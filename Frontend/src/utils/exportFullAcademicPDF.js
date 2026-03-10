import jsPDF from "jspdf";
import "jspdf-autotable";

export function exportFullAcademicPDF(student) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Full Academic Report", 14, 18);

  doc.setFontSize(12);
  doc.text(`Name: ${student.name}`, 14, 28);
  doc.text(`Program: ${student.program}`, 14, 36);
  doc.text(`CGPA: ${student.cgpa}`, 14, 44);
  doc.text(`Risk Level: ${student.risk}`, 14, 52);

  doc.autoTable({
    startY: 62,
    head: [["Subject", "Score"]],
    body: student.performance.map(p => [p.Subject, p.Score]),
  });

  doc.addPage();
  doc.text("AI Risk Explanation", 14, 20);
  doc.text(student.explanation, 14, 30, { maxWidth: 180 });

  doc.save("full-academic-report.pdf");
}
