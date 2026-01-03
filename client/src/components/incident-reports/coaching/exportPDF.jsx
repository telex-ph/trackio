import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportAllFiles = async (ref) => {
  if (!ref?.current) return;

  const canvas = await html2canvas(ref.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("Coaching_Report.pdf");
};
