export default function ReportTable({ title, columns, data }) {
  return (
    <div className="bg-surfaceLight dark:bg-slate-900 rounded-2xl p-6 shadow-soft">
  <h3 className="text-lg font-semibold mb-4">
    {title}
  </h3>

  <table className="w-full">
    <thead>
      <tr className="text-left text-sm text-mutedLight dark:text-mutedDark">
        {columns.map(col => (
          <th key={col} className="pb-3 font-medium">
            {col}
          </th>
        ))}
      </tr>
    </thead>

    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
      {data.map((row, i) => (
        <tr
          key={i}
          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
        >
          {Object.values(row).map((val, j) => (
            <td
              key={j}
              className="py-4 font-medium text-textLight dark:text-textDark"
            >
              {val}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}
