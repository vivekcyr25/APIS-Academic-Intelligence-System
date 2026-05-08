import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Semester, Subject, AcademicMemory } from '../../types/academic-v2';

export const exportSemesterToPDF = async (
  semester: Semester, 
  subjects: Subject[],
  profileName: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Typography Settings
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(3, 0, 20); // Midnight
  doc.text('Academic Intelligence Report', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated for: ${profileName}`, 20, 38);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 43);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 50, 190, 50);
  
  // Semester Summary
  doc.setFontSize(18);
  doc.setTextColor(3, 0, 20);
  doc.text(semester.label, 20, 65);
  
  doc.setFontSize(12);
  doc.text(`SGPA: ${semester.sgpa.toFixed(2)}`, 20, 75);
  doc.text(`Total Credits: ${semester.totalCredits}`, 70, 75);
  doc.text(`Attendance: ${semester.avgAttendance}%`, 120, 75);

  // Subject Table Header
  const tableTop = 90;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, tableTop, 170, 10, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Subject', 25, tableTop + 6);
  doc.text('Credits', 100, tableTop + 6);
  doc.text('Grade', 130, tableTop + 6);
  doc.text('Attendance', 155, tableTop + 6);

  // Subject Rows
  doc.setFont('helvetica', 'normal');
  let currentY = tableTop + 18;
  
  subjects.forEach((sub, i) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 30;
    }
    
    doc.text(sub.name, 25, currentY);
    doc.text(sub.credits.toString(), 105, currentY);
    doc.text(sub.grade || 'N/A', 135, currentY);
    doc.text(`${sub.attendancePercentage}%`, 160, currentY);
    
    doc.setDrawColor(245, 245, 245);
    doc.line(20, currentY + 4, 190, currentY + 4);
    currentY += 12;
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`APIS AI — Academic Operating System | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save(`${semester.label.replace(' ', '_')}_Report.pdf`);
  localStorage.setItem('apis_last_export_at', new Date().toISOString());
};

export const downloadAcademicArchive = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `APIS_Academic_Archive_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  localStorage.setItem('apis_last_export_at', new Date().toISOString());
};
