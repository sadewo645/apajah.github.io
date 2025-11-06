export function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 shadow-lg">
      <table className="min-w-full divide-y divide-white/5">
        <thead className="bg-slate-900/60">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-white/60">
                Data tidak tersedia.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/50'}>
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-sm text-white/80">
                    {row[column] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
