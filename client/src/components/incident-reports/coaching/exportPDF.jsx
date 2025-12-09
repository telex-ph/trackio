import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export const exportAllFiles = async (formData) => {
  // 1️⃣ Generate main PDF from hidden div
  const element = document.getElementById("coaching-pdf-export");
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  const pdfBlob = pdf.output("blob");

  // 2️⃣ Create a ZIP
  const zip = new JSZip();
  zip.file(`${formData.agentName || "coaching"}-details.pdf`, pdfBlob);

  // 3️⃣ Add all evidence PDFs
  const allFiles = [...formData.evidence];

  for (const file of allFiles) {
    // Only include PDFs
    if (file.url.endsWith(".pdf")) {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        zip.file(file.fileName, blob);
      } catch (err) {
        console.error("Failed to fetch file:", file.fileName, err);
      }
    }
  }

  // 4️⃣ Generate ZIP and trigger download
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${formData.agentName || "coaching"}-export.zip`);
};
