'use client';

// ─────────────────────────────────────────────
// Reusable data table component
// ─────────────────────────────────────────────

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'কোনো ডেটা নেই',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="admin-card p-8 text-center">
        <p style={{ color: 'var(--admin-muted)' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-sm font-semibold"
                  style={{ color: 'var(--admin-muted)' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--admin-border)' }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
