export default function SeoTable({ columns, rows, empty = "No records yet." }) {
  if (!rows.length) return <div className="crm-empty"><h3>{empty}</h3><p>Configure Supabase or run the local draft automation to create records.</p></div>;
  return <div className="crm-table-wrap"><table className="crm-table seo-table">
    <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={row.id || `${row.url || row.keyword || "row"}-${index}`}>
      {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : String(row[column.key] ?? "—")}</td>)}
    </tr>)}</tbody>
  </table></div>;
}
