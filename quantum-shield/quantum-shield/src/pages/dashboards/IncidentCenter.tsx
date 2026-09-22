import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';

export function IncidentCenter() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pq_crypto/security-incidents')
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Incident Center</h1>
          <p className="text-sm text-text-muted mt-1">Audit log of all blocked cryptographic tampering attempts.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button variant="default">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center bg-surface/50 rounded-t-xl">
            <Search className="w-5 h-5 text-text-muted mr-3" />
            <input 
              type="text" 
              placeholder="Search by Incident ID, Reason, or User..." 
              className="bg-transparent border-none focus:outline-none flex-1 text-sm font-medium"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase bg-surface">
                <tr>
                  <th className="px-6 py-4 font-semibold">Incident ID</th>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Target Paper ID</th>
                  <th className="px-6 py-4 font-semibold">Attacker Role</th>
                  <th className="px-6 py-4 font-semibold">Detection Engine</th>
                  <th className="px-6 py-4 font-semibold">Reason</th>
                  <th className="px-6 py-4 font-semibold">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-text-muted">Loading incidents...</td>
                  </tr>
                ) : incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertTriangle className="w-12 h-12 text-text-muted/30 mb-3" />
                        <p className="text-text-muted font-medium">No security incidents recorded.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-xs">INC-{incident.id.toString().padStart(5, '0')}</td>
                      <td className="px-6 py-4 text-text-muted">{new Date(incident.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium">Paper #{incident.paper_id}</td>
                      <td className="px-6 py-4">
                        <Badge variant={incident.role === 'Hacker' ? 'danger' : 'warning'}>{incident.role}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">PQ Verification</td>
                      <td className="px-6 py-4 font-bold text-red-600">{incident.reason}</td>
                      <td className="px-6 py-4">
                        <Badge variant="danger">{incident.action}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted bg-surface/30 rounded-b-xl">
            <span>Showing {incidents.length} incidents</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
