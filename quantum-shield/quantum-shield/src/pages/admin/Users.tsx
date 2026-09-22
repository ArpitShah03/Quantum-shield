import React from 'react';
import { UserPlus, Edit, Trash2, Key } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockUsers } from '../../data/mockData';

export function Users() {
  const columns = [
    { header: 'User Name', accessor: 'name' as keyof typeof mockUsers[0] },
    { header: 'Role', accessor: 'role' as keyof typeof mockUsers[0] },
    { header: 'Department', accessor: 'department' as keyof typeof mockUsers[0] },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      ) 
    },
    {
      header: 'Actions',
      accessor: () => (
        <div className="flex space-x-2">
          <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit User">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Reset Password">
            <Key className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete User">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-text-muted mt-1">Manage roles and access permissions across the framework.</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <DataTable columns={columns} data={mockUsers} searchable />
    </div>
  );
}
