import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/logs')
      .then(data => setLogs(data))
      .catch(err => console.error(err));
  }, []);

  const columns = [
    { header: 'Timestamp', accessor: (row: any) => new Date(row.timestamp).toLocaleString() },
    { header: 'User ID', accessor: 'user_id' },
    { header: 'Action', accessor: 'action' },
    { header: 'IP Address', accessor: 'ip_address' },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge 
          variant={
            row.status === 'Success' ? 'success' : 
            row.status === 'Tampered' ? 'danger' : 'warning'
          }
        >
          {row.status}
        </Badge>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-text-muted mt-1">Immutable record of all system events and access attempts.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <DataTable columns={columns} data={logs} searchable />
    </div>
  );
}
