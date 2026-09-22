import React from 'react';
import { Download, ShieldAlert, FileKey2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { mockPapers } from '../../data/mockData';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export function ExamCentreDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Centre Portal</h1>
          <p className="text-sm text-text-muted mt-1">Access and verify examination papers for your centre.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary rounded-lg text-white">
                <FileKey2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">Available Papers</p>
                <h3 className="text-2xl font-bold text-primary">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Papers Ready for Download</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {mockPapers.map((paper, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border rounded-lg bg-white hover:border-primary/50 transition-colors">
                <div className="flex-1 mb-4 sm:mb-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-semibold text-text-main">{paper.name}</h4>
                    <Badge variant={paper.status === 'Verified' ? 'success' : 'warning'}>{paper.status}</Badge>
                  </div>
                  <p className="text-sm text-text-muted">
                    {paper.courseCode} • {paper.subject} • Uploaded by {paper.professor}
                  </p>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => navigate(`/dashboard/verification`)}>
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Verify Integrity
                  </Button>
                  <Button className="flex-1 sm:flex-none" disabled={paper.status !== 'Verified'}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
