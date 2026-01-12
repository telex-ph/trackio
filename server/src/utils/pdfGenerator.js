import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

export const generatePDFCertificate = async (certificateData) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const maroonDark = [60, 0, 0];    
    const maroonClassic = [128, 0, 0]; 
    const maroonBright = [180, 0, 0];
    const deepBlack = [30, 30, 30];

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFillColor(maroonDark[0], maroonDark[1], maroonDark[2]);
    doc.triangle(0, 0, 70, 0, 0, 70, 'F');
    doc.setFillColor(maroonClassic[0], maroonClassic[1], maroonClassic[2]);
    doc.triangle(0, 0, 45, 0, 0, 45, 'F');

    doc.setFillColor(maroonDark[0], maroonDark[1], maroonDark[2]);
    doc.triangle(pageWidth, pageHeight, pageWidth - 70, pageHeight, pageWidth, pageHeight - 70, 'F');
    doc.setFillColor(maroonBright[0], maroonBright[1], maroonBright[2]);
    doc.triangle(pageWidth, pageHeight, pageWidth - 35, pageHeight, pageWidth, pageHeight - 35, 'F');

    doc.setTextColor(maroonDark[0], maroonDark[1], maroonDark[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(44);
    doc.text('CERTIFICATE', pageWidth / 2, 55, { align: 'center' });

    doc.setTextColor(maroonClassic[0], maroonClassic[1], maroonClassic[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('OF PROFESSIONAL EXCELLENCE', pageWidth / 2, 63, { align: 'center' });

    doc.setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
    doc.setFontSize(13);
    doc.setFont('times', 'italic');
    doc.text('This formal recognition is proudly bestowed upon', pageWidth / 2, 85, { align: 'center' });

    doc.setTextColor(maroonDark[0], maroonDark[1], maroonDark[2]);
    doc.setFontSize(42);
    doc.setFont('times', 'bold');
    doc.text(certificateData.employeeName || 'HERNANI DOMINGO', pageWidth / 2, 105, { align: 'center' });

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(13);
    doc.setFont('times', 'normal');
    doc.text('In grateful appreciation for your exemplary leadership, unwavering dedication,', pageWidth / 2, 120, { align: 'center' });
    doc.text('and outstanding contributions to the success of the organization as', pageWidth / 2, 128, { align: 'center' });

    doc.setTextColor(maroonBright[0], maroonBright[1], maroonBright[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(certificateData.title || 'PANGASINAN #1', pageWidth / 2, 142, { align: 'center' });

    const sigY = 178;
    const lineW = 65;
    doc.setDrawColor(maroonClassic[0], maroonClassic[1], maroonClassic[2]);
    doc.setLineWidth(0.5);

    doc.line(40, sigY, 40 + lineW, sigY);
    doc.setTextColor(deepBlack[0], deepBlack[1], deepBlack[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DATE OF ISSUANCE', 40 + (lineW / 2), sigY + 6, { align: 'center' });

    doc.line(pageWidth - 40 - lineW, sigY, pageWidth - 40, sigY);
    doc.text('OFFICIAL SIGNATURE', pageWidth - 40 - (lineW / 2), sigY + 6, { align: 'center' });

    const sealX = pageWidth / 2;
    const sealY = 172;
    const sealRadius = 20;
    
    doc.setDrawColor(maroonBright[0], maroonBright[1], maroonBright[2]);
    doc.setLineWidth(1.2);
    doc.circle(sealX, sealY, sealRadius, 'S');

    try {
      const logoPath = path.resolve(process.cwd(), '..', 'client', 'src', 'assets', 'logos', 'telexlogo.png');
      
      if (fs.existsSync(logoPath)) {
        const imgData = fs.readFileSync(logoPath).toString('base64');
        const logoBase64 = `data:image/png;base64,${imgData}`;
        
        const logoWidth = 65; 
        const logoHeight = 45; 
        
        doc.addImage(
          logoBase64, 
          'PNG', 
          sealX - (logoWidth / 2), 
          sealY - (logoHeight / 2), 
          logoWidth, 
          logoHeight,
          undefined,
          'FAST'
        );
      } else {
        doc.setTextColor(maroonBright[0], maroonBright[1], maroonBright[2]);
        doc.setFontSize(9);
        doc.text('VERIFIED', sealX, sealY + 1, { align: 'center' });
      }
    } catch (e) {
      console.error(e.message);
    }

    const certRef = certificateData.certificateNumber || `CERT-1768206949429-MAUMEI0U`;
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Official Document ID: ${certRef}`, 15, pageHeight - 10);

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
    
  } catch (error) {
    throw error;
  }
};