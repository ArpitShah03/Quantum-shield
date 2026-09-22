import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PapersTable from './PapersTable';

export default function Dashboard() {
  const { role } = useContext(AuthContext);
  const [papers, setPapers] = useState<any[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<any>(null);

  useEffect(() => {
    api.get('/papers/')
    .then(res => {
      const data = res.data;
      if (Array.isArray(data)) setPapers(data);
      else setPapers([]);
    })
    .catch(console.error);

    if (role === 'Administrator') {
      api.get('/papers/metrics/admin')
      .then(res => {
          setAdminMetrics(res.data);
      }).catch(console.error);
    }
  }, [role]);

  const pendingCount = papers.filter(p => p.status === 'Pending').length;
  const approvedCount = papers.filter(p => p.status === 'Approved').length;
  const rejectedCount = papers.filter(p => p.status === 'Rejected').length;
  const totalCount = papers.length;
  const scheduledCount = papers.filter(p => p.status === 'Approved' && p.release_datetime).length;

  const handleExport = async () => {
    try {
      const res = await api.get('/papers/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'security_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Export failed.');
    }
  };

  if (role === 'Professor') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome, Professor</h2>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-500 font-semibold">Total Uploads</p>
                <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-amber-500 font-semibold">Pending Approvals</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-emerald-500 font-semibold">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-red-500 font-semibold">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Submit New Examination</h3>
            <p className="text-slate-500">Securely encrypt and upload your examination papers.</p>
          </div>
          <Link to="/upload" className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Upload Paper</Link>
        </div>
      </div>
    );
  }

  if (role === 'Administrator') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Administrator Dashboard</h2>
            <button onClick={handleExport} className="px-4 py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-900 shadow">Export Security Report (CSV)</button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-amber-500 font-semibold">Pending Reviews</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-emerald-500 font-semibold">Approved Papers</p>
                <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-red-500 font-semibold">Rejected Papers</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-blue-500 font-semibold">Scheduled Releases</p>
                <p className="text-2xl font-bold text-blue-600">{scheduledCount}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">System Performance</h3>
                {adminMetrics ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">Avg Encryption Time</span>
                            <span className="font-mono text-blue-700 font-bold">{adminMetrics.avg_upload_ms} ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">Avg Verification Time</span>
                            <span className="font-mono text-emerald-700 font-bold">{adminMetrics.avg_verify_ms} ms</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-4">
                            <span className="text-slate-600 font-medium">Total Secure Papers</span>
                            <span className="font-bold text-slate-800">{adminMetrics.total_papers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">Total Secure Extractions</span>
                            <span className="font-bold text-slate-800">{adminMetrics.total_downloads}</span>
                        </div>
                    </div>
                ) : <p className="text-slate-400">Loading metrics...</p>}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Recent Chain of Custody</h3>
                {adminMetrics && adminMetrics.recent_chain ? (
                    <div className="space-y-3">
                        {adminMetrics.recent_chain.map((log: any, idx: number) => (
                            <div key={idx} className="flex flex-col border-l-2 border-slate-300 pl-3">
                                <span className="text-sm font-bold text-slate-800">{log.action} <span className="text-slate-400 font-normal">| Paper {log.paper_id}</span></span>
                                <span className="text-xs text-slate-500">{new Date(log.time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} • {log.user}</span>
                            </div>
                        ))}
                        {adminMetrics.recent_chain.length === 0 && <p className="text-slate-400 text-sm">No recent activity.</p>}
                    </div>
                ) : <p className="text-slate-400">Loading logs...</p>}
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Action Required</h3>
          <p className="text-slate-500 mb-4">You have examinations waiting for institutional approval.</p>
          <Link to="/approvals" className="px-6 py-2 bg-amber-600 text-white rounded font-bold hover:bg-amber-700">View Pending Approvals</Link>
        </div>
      </div>
    );
  }

  if (role === 'Exam Centre') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Exam Centre Dashboard</h2>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Secure Extraction</h3>
          <p className="text-slate-500 mb-4">Approved examinations are ready for secure decapsulation.</p>
          <Link to="/downloads" className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">View Approved Papers</Link>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}
