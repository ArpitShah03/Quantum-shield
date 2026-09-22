import React, { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';

export function ProfessorDashboard() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/papers')
      .then(data => setPapers(data))
      .catch(err => console.error(err));
  }, []);

  const stats = [
    { title: 'My Papers', value: papers.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Pending Verification', value: papers.filter(p => p.status === 'Uploaded Successfully').length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Verified', value: papers.filter(p => p.status !== 'Uploaded Successfully').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Professor Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Manage and upload your examination papers securely.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/upload')}>
          <Upload className="w-4 h-4 mr-2" />
          Upload New Paper
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase bg-surface">
                <tr>
                  <th className="px-6 py-3 font-semibold rounded-tl-lg">Paper ID</th>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Course</th>
                  <th className="px-6 py-3 font-semibold">Upload Date</th>
                  <th className="px-6 py-3 font-semibold text-right rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper, i) => (
                  <tr key={i} className="bg-white border-b border-border hover:bg-surface/50 cursor-pointer" onClick={() => navigate(`/dashboard/papers/${paper.id}`)}>
                    <td className="px-6 py-4 font-medium text-text-main">{paper.id}</td>
                    <td className="px-6 py-4">{paper.title}</td>
                    <td className="px-6 py-4">{paper.course_code}</td>
                    <td className="px-6 py-4">{new Date(paper.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant={paper.status === 'Verified' ? 'success' : 'warning'}>
                        {paper.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
