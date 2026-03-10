export const exportCSV = (filename, rows) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]).join(",");
  const values = rows.map(r => Object.values(r).join(",")).join("\n");
  const csv = headers + "\n" + values;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
