import React from 'react';
import { cn } from '../../lib/utils';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
}

export function DataTable<T>({ columns, data, searchable = false }: DataTableProps<T>) {
  return (
    <div className="w-full">
      {searchable && (
        <div className="flex items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}
      <div className="border border-border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted uppercase bg-surface border-b border-border">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-6 py-3 font-semibold">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="bg-white border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4">
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-text-muted">
          Showing 1 to {data.length} of {data.length} entries
        </span>
        <div className="flex space-x-2">
          <button className="p-1 rounded border border-border bg-white text-text-muted hover:bg-surface disabled:opacity-50">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="p-1 rounded border border-border bg-white text-text-muted hover:bg-surface disabled:opacity-50">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
