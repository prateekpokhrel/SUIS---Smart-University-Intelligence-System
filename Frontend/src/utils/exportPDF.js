import jsPDF from "jspdf";
import "jspdf-autotable";

export function exportPDF(data, filename = "report") {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Student Performance Report", 14, 15);

  const tableColumn = Object.keys(data[0]);
  const tableRows = data.map(item => Object.values(item));

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 25,
  });

  doc.save(`${filename}.pdf`);
}
