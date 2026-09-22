import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api, { paperService } from '../services/api';
import { CheckCircle } from 'lucide-react';

export default function PapersTable() {
  const { role } = useContext(AuthContext);
  const [papers, setPapers] = useState<any[]>([]);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseTime, setReleaseTime] = useState('');
  const [windowSeconds, setWindowSeconds] = useState(30);
  
  const [rejectReason, setRejectReason] = useState('Wrong syllabus');
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyingStep, setVerifyingStep] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  const [failedStageStr, setFailedStageStr] = useState('');

  useEffect(() => {
    fetchPapers();
    const interval = setInterval(() => {
        setPapers(p => [...p]); // Trigger re-render for time remaining
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const [downloadMetrics, setDownloadMetrics] = useState<any>(null);
  
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  const handleViewTimeline = async (id: number) => {
      try {
          const res = await api.get(`/papers/chain/${id}`);
          setTimelineData(res.data);
          setShowTimelineModal(true);
      } catch (err) {
          alert("Failed to load chain of custody.");
      }
  };

  const fetchPapers = async () => {
      api.get('/papers/')
      .then(res => {
          const data = res.data;
          if (Array.isArray(data)) setPapers(data);
          else setPapers([]);
      })
      .catch(console.error);
  }

  const submitApprove = async () => {
    if (!selectedId || !releaseDate || !releaseTime) return;
    const datetimeStr = `${releaseDate}T${releaseTime}:00`;
    await paperService.approve(selectedId, {
        release_datetime: datetimeStr,
        download_window_seconds: windowSeconds
    });
    setShowApproveModal(false);
    fetchPapers();
  };

  const submitReject = async () => {
    if (!selectedId || !rejectReason) return;
    await paperService.reject(selectedId, { reason: rejectReason });
    setShowRejectModal(false);
    fetchPapers();
  };
  
  const handleDownload = async (id: number, token: string) => {
    setShowVerificationModal(true);
    setVerifyingStep(0);
    setVerificationError('');
    setFailedStageStr('');
    
    // Initial delay for UX
    await new Promise(r => setTimeout(r, 400));
    
    try {
        const res = await api.get(`/papers/download/${id}?token=${token}`, {
            responseType: 'blob'
        });
        
        // If successful, animate through all steps
        for (let i = 1; i <= 6; i++) {
            await new Promise(r => setTimeout(r, 400));
            setVerifyingStep(i);
        }
        
        setTimeout(() => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `paper_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            
            const metricsJson = res.headers['x-metrics'];
            if (metricsJson) {
                setDownloadMetrics(JSON.parse(metricsJson));
            }
        }, 500);
    } catch(err: any) {
        // Blob responses with JSON error need parsing
        if (err.response?.data instanceof Blob) {
            const text = await err.response.data.text();
            try {
                const json = JSON.parse(text);
                const detail = json.detail;
                
                if (typeof detail === 'string') {
                    // It's a structured time-lock or token string error
                    setVerificationError(detail);
                    setFailedStageStr("Time/Authorization");
                    setVerifyingStep(0);
                } else if (typeof detail === 'object' && detail.failed_stage) {
                    const stage = detail.failed_stage;
                    const reason = detail.reason;
                    
                    const stageMap: any = {
                        "University CA": 1,
                        "ML-DSA": 2,
                        "SHA3": 3,
                        "ML-KEM": 4,
                        "HKDF": 5,
                        "AES": 6
                    };
                    const failIndex = stageMap[stage] || 1;
                    
                    for (let i = 1; i < failIndex; i++) {
                        await new Promise(r => setTimeout(r, 400));
                        setVerifyingStep(i);
                    }
                    await new Promise(r => setTimeout(r, 400));
                    
                    setFailedStageStr(stage);
                    setVerificationError(reason);
                    setVerifyingStep(failIndex - 1);
                }
            } catch {
                setVerificationError("Verification pipeline failed.");
            }
        } else {
            setVerificationError("Paper release time has not arrived or expired.");
        }
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };
  
  const getTimeRemaining = (releaseStr: string, windowSec: number) => {
      if (!releaseStr) return { status: 'N/A', currentIST: '', releaseIST: '', countdown: '' };
      
      const nowEpoch = new Date().getTime();
      const releaseEpoch = new Date(releaseStr).getTime();
      const endEpoch = releaseEpoch + (windowSec * 1000);
      
      // Calculate IST strings strictly by shifting epoch to IST (+5:30) and reading UTC string
      const getISTString = (epoch: number) => {
          const d = new Date(epoch + (5.5 * 3600 * 1000));
          return d.toISOString().substring(11, 19) + " IST";
      };

      const currentIST = getISTString(nowEpoch);
      const releaseIST = getISTString(releaseEpoch);
      
      let status = '';
      let countdown = '';
      
      if (nowEpoch < releaseEpoch) {
          status = 'Waiting';
          const diff = Math.floor((releaseEpoch - nowEpoch) / 1000);
          const m = Math.floor(diff / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          countdown = `${m}:${s}`;
      } else if (nowEpoch > endEpoch) {
          status = 'Expired';
          countdown = '00:00';
      } else {
          status = 'Open';
          const diff = Math.floor((endEpoch - nowEpoch) / 1000);
          const m = Math.floor(diff / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          countdown = `${m}:${s}`;
      }
      
      return { status, currentIST, releaseIST, countdown };
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
      <h2 className="text-xl font-bold text-slate-800 mb-6">
        {role === 'Administrator' ? 'Pending Approvals' : role === 'Exam Centre' ? 'Approved Downloads' : 'My Uploaded Papers'}
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-sm text-slate-500">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Title</th>
            {role !== 'Professor' && <th className="py-3 px-4">Professor</th>}
            <th className="py-3 px-4">Course</th>
            {role === 'Administrator' && <th className="py-3 px-4">SHA3 Hash</th>}
            <th className="py-3 px-4">Status</th>
            {role === 'Exam Centre' && <th className="py-3 px-4">Time Window</th>}
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {papers.map(paper => (
            <tr key={paper.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 font-mono text-slate-600">{paper.id}</td>
              <td className="py-3 px-4 font-medium text-slate-800">{paper.title}</td>
              {role !== 'Professor' && <td className="py-3 px-4 text-slate-600">{paper.professor_name}</td>}
              <td className="py-3 px-4 text-slate-600">{paper.course_code}</td>
              {role === 'Administrator' && <td className="py-3 px-4 font-mono text-xs text-slate-400">{paper.sha3_hash}</td>}
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(paper.status)}`}>
                  {paper.status}
                </span>
              </td>
              
              {role === 'Exam Centre' && (
                  <td className="py-3 px-4 text-xs font-mono text-slate-600 space-y-1">
                      {(() => {
                          const timeData = getTimeRemaining(paper.release_datetime, paper.download_window_seconds);
                          if (timeData.status === 'N/A') return <span>N/A</span>;
                          return (
                              <>
                                  <div className="flex justify-between w-48"><span className="font-semibold">Release Time</span> <span className="text-blue-700 font-bold">{timeData.releaseIST}</span></div>
                                  <div className="flex justify-between w-48"><span className="font-semibold">Server Time</span> <span className="text-slate-800">{timeData.currentIST}</span></div>
                                  <div className="flex justify-between w-48 border-t pt-1 mt-1"><span className="font-semibold text-slate-500">Countdown</span> <span className={timeData.status === 'Open' ? 'text-emerald-600 font-bold' : timeData.status === 'Waiting' ? 'text-amber-600 font-bold' : 'text-red-600 font-bold'}>{timeData.countdown} ({timeData.status})</span></div>
                              </>
                          );
                      })()}
                  </td>
              )}

              <td className="py-3 px-4 text-right space-x-2">
                <button onClick={() => handleViewTimeline(paper.id)} className="px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 rounded text-sm font-semibold">Details</button>
                {role === 'Administrator' && paper.status === 'Pending' && (
                  <button onClick={() => { setSelectedId(paper.id); setShowReviewModal(true); }} className="px-3 py-1 bg-slate-800 text-white rounded text-sm font-semibold hover:bg-slate-900">Review</button>
                )}
                
                {role === 'Exam Centre' && paper.status === 'Approved' && (
                  (() => {
                    const timeData = getTimeRemaining(paper.release_datetime, paper.download_window_seconds);
                    const isOpen = timeData.status === 'Open';
                    const isBefore = timeData.status === 'Waiting';
                    
                    let btnClass = "px-3 py-1 text-white rounded text-sm font-semibold ";
                    let btnText = "Verify & Download";
                    
                    if (isBefore) {
                        btnClass += "bg-slate-500 hover:bg-slate-600";
                    } else if (isOpen) {
                        btnClass += "bg-blue-600 hover:bg-blue-700";
                    } else {
                        btnClass += "bg-slate-500 hover:bg-slate-600";
                    }
                    
                    return (
                        <button 
                            onClick={() => handleDownload(paper.id, paper.release_token)} 
                            className={btnClass}
                        >
                            {btnText}
                        </button>
                    );
                  })()
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Modals */}
      {showReviewModal && (() => {
        const p = papers.find(x => x.id === selectedId);
        if (!p) return null;
        const valid = p.ca_status === 'Valid';
        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[600px] shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-2">Cryptographic Review Panel</h3>
                
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Section A — Academic Details</h4>
                <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
                    <div className="grid grid-cols-2 gap-y-2">
                        <span className="text-slate-500 font-semibold text-sm">Paper ID</span>
                        <span className="text-slate-800 font-medium">{p.id}</span>
                        
                        <span className="text-slate-500 font-semibold text-sm">Paper Title</span>
                        <span className="text-slate-800 font-medium">{p.title}</span>
                        
                        <span className="text-slate-500 font-semibold text-sm">Course Code</span>
                        <span className="text-slate-800 font-medium">{p.course_code}</span>
                        
                        <span className="text-slate-500 font-semibold text-sm">Professor</span>
                        <span className="text-slate-800 font-medium">{p.professor_name}</span>
                        
                        <span className="text-slate-500 font-semibold text-sm">Upload Timestamp</span>
                        <span className="text-slate-800 font-medium">{new Date(p.timestamp).toLocaleString()}</span>
                    </div>
                </div>

                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Section B — Cryptographic Evidence</h4>
                <div className={`p-4 rounded-lg mb-6 border ${valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="grid grid-cols-2 gap-y-2">
                        <span className="text-slate-500 font-semibold text-sm">CA Certificate</span>
                        <span className={valid ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>{valid ? 'Verified' : 'Invalid'}</span>
                        
                        <span className="text-slate-500 font-semibold text-sm">ML-DSA Signature</span>
                        <span className={valid ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>{valid ? 'Valid' : 'Failed'}</span>
                        
                        <span className="text-slate-500 font-semibold text-sm">SHA3 Integrity</span>
                        <span className={valid ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>{valid ? 'Matched' : 'Failed'}</span>
                        
                        <span className="text-slate-500 font-semibold text-sm">Encryption Algorithm</span>
                        <span className="text-slate-800 font-medium">AES-256-GCM</span>
                        
                        <span className="text-slate-500 font-semibold text-sm">PQ Key Exchange</span>
                        <span className="text-slate-800 font-medium">ML-KEM-768</span>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 border-t pt-4">
                    <button onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
                    <button onClick={() => { setShowReviewModal(false); setShowRejectModal(true); }} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold">Reject</button>
                    <button onClick={() => { setShowReviewModal(false); setShowApproveModal(true); }} disabled={!valid} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 rounded font-bold">Approve</button>
                </div>
            </div>
        </div>
        );
      })()}

      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
                <h3 className="text-lg font-bold mb-4">Schedule Release Time</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Release Date [IST (Asia/Kolkata)]</label>
                        <input type="date" className="w-full border p-2 rounded" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Release Time [IST (Asia/Kolkata)]</label>
                        <input type="time" className="w-full border p-2 rounded" value={releaseTime} onChange={e => setReleaseTime(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Download Window (Seconds)</label>
                        <input type="number" className="w-full border p-2 rounded" value={windowSeconds} onChange={e => setWindowSeconds(parseInt(e.target.value))} />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                    <button onClick={submitApprove} className="px-4 py-2 bg-emerald-600 text-white rounded font-bold">Confirm Release</button>
                </div>
            </div>
        </div>
      )}
      
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-red-600">Reject Paper</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Reason for rejection</label>
                        <select className="w-full border p-2 rounded" value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                            <option>Wrong syllabus</option>
                            <option>Duplicate paper</option>
                            <option>Invalid format</option>
                            <option>Corrupted upload</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                    <button onClick={submitReject} className="px-4 py-2 bg-red-600 text-white rounded font-bold">Confirm Reject</button>
                </div>
            </div>
        </div>
      )}

      {/* Verification Dialog */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[450px] shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-2">Cryptographic Verification Pipeline</h3>
                <div className="space-y-4 mb-8">
                    {[
                        { num: 1, name: "University CA Certificate" },
                        { num: 2, name: "ML-DSA Signature" },
                        { num: 3, name: "SHA3 Integrity" },
                        { num: 4, name: "ML-KEM Decapsulation" },
                        { num: 5, name: "HKDF Key Derivation" },
                        { num: 6, name: "AES-256-GCM Authentication" }
                    ].map(step => {
                        let statusIcon = <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>;
                        let textClass = "text-slate-400";
                        
                        if (verifyingStep >= step.num) {
                            statusIcon = <CheckCircle size={20} className="text-emerald-600"/>;
                            textClass = "text-slate-800 font-medium";
                        } else if (verificationError && failedStageStr && verifyingStep === step.num - 1) {
                            // This is the stage that failed
                            statusIcon = <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">X</div>;
                            textClass = "text-red-600 font-bold";
                        } else if (!verificationError && verifyingStep === step.num - 1) {
                            statusIcon = <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>;
                            textClass = "text-blue-600 font-medium";
                        }
                        
                        return (
                            <div key={step.num} className="flex items-center space-x-3">
                                {statusIcon}
                                <span className={textClass}>{step.name}</span>
                            </div>
                        );
                    })}
                </div>

                {verificationError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 text-center">
                    <p className="font-bold text-red-700 uppercase tracking-wider text-sm mb-1">FAILED: {failedStageStr || "Verification"}</p>
                    <p className="text-red-600 text-sm font-semibold mb-2">Reason: {verificationError}</p>
                    <span className="text-xs text-red-500 font-bold bg-white px-2 py-1 rounded border border-red-100">Download Aborted</span>
                  </div>
                ) : verifyingStep === 6 ? (
                  <div className="mb-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center mb-4">
                        <p className="font-bold text-emerald-700 uppercase tracking-wider text-sm mb-1">Secure Document Verified</p>
                        <p className="text-emerald-600 text-xs font-semibold">Decrypted & Downloaded successfully.</p>
                      </div>
                      
                      {downloadMetrics && (
                          <div className="p-4 border rounded-lg bg-slate-50">
                              <h4 className="font-bold text-slate-700 mb-3 text-sm">Verification Summary</h4>
                              <div className="space-y-2 text-xs">
                                  <div className="flex justify-between border-b pb-1"><span className="text-slate-600">CA Verification</span><span className="font-mono font-medium">{downloadMetrics.ca_verify_ms} ms</span></div>
                                  <div className="flex justify-between border-b pb-1"><span className="text-slate-600">ML-DSA Verification</span><span className="font-mono font-medium">{downloadMetrics.mldsa_verify_ms} ms</span></div>
                                  <div className="flex justify-between border-b pb-1"><span className="text-slate-600">SHA3 Integrity</span><span className="font-mono font-medium">{downloadMetrics.sha3_verify_ms} ms</span></div>
                                  <div className="flex justify-between border-b pb-1"><span className="text-slate-600">ML-KEM Decapsulation</span><span className="font-mono font-medium">{downloadMetrics.mlkem_decapsulation_ms} ms</span></div>
                                  <div className="flex justify-between border-b pb-1"><span className="text-slate-600">AES Decryption</span><span className="font-mono font-medium">{downloadMetrics.aes_decrypt_ms} ms</span></div>
                                  <div className="flex justify-between pt-1"><span className="text-slate-800 font-bold">Total Verification Time</span><span className="font-mono font-bold text-emerald-700">{downloadMetrics.total_download_ms} ms</span></div>
                              </div>
                          </div>
                      )}
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg mb-4 font-bold text-center animate-pulse">
                    Verifying Cryptographic Evidence...
                  </div>
                )}
                
                <div className="flex justify-end border-t pt-4">
                    <button onClick={() => setShowVerificationModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Close</button>
                </div>
            </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[500px] shadow-lg max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-2">Chain of Custody (Timeline)</h3>
                
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 mb-6">
                    {timelineData.map((t, idx) => (
                        <div key={idx} className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                            <p className="text-sm font-bold text-slate-800">{t.action}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(t.time + "Z").toLocaleString()}</p>
                            <p className="text-xs font-semibold text-blue-600 mt-1">{t.user} ({t.role})</p>
                        </div>
                    ))}
                    {timelineData.length === 0 && <p className="text-sm text-slate-500 pl-6">No events recorded.</p>}
                </div>
                
                <div className="flex justify-end border-t pt-4">
                    <button onClick={() => setShowTimelineModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
