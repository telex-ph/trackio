// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';

export const generatePDFCertificate = async (certificateData) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
   
    // --- 1. PREMIUM COLORS ---
    const navyBlue = [15, 23, 42];    
    const deepRed = [153, 27, 27];    
    const mutedGold = [161, 131, 75];
    const pureBlack = [0, 0, 0];

    // --- 2. MODERN GEOMETRIC UI ---
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative Right Wing (Modern Layout)
    doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.triangle(pageWidth, 0, pageWidth, pageHeight, pageWidth - 55, 0, 'F');
    doc.setFillColor(deepRed[0], deepRed[1], deepRed[2]);
    doc.triangle(pageWidth, pageHeight, pageWidth, pageHeight - 90, pageWidth - 35, pageHeight, 'F');

    // Minimalist Left Border Accent
    doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.rect(0, 0, 10, pageHeight, 'F');
    doc.setFillColor(mutedGold[0], mutedGold[1], mutedGold[2]);
    doc.rect(10, 50, 2, 50, 'F');

    // --- 3. REFINED TYPOGRAPHY & TEXT ---
   
    // Main Header
    doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(48);
    doc.text('CERTIFICATE', 35, 45, { charSpace: 2 });
   
    // Sub-header (More Formal Wordings)
    doc.setTextColor(mutedGold[0], mutedGold[1], mutedGold[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('OF PROFESSIONAL EXCELLENCE', 35, 54, { charSpace: 3 });

    // Lead-in text
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(12);
    doc.setFont('times', 'italic');
    doc.text('This formal recognition is proudly bestowed upon', pageWidth / 2, 85, { align: 'center' });

    // Recipient Name (The Focus Point)
    doc.setTextColor(pureBlack[0], pureBlack[1], pureBlack[2]);
    doc.setFontSize(52);
    doc.setFont('times', 'bold');
    doc.text(certificateData.employeeName.toUpperCase(), pageWidth / 2, 108, { align: 'center' });

    // Elegant Gold Divider
    doc.setDrawColor(mutedGold[0], mutedGold[1], mutedGold[2]);
    doc.setLineWidth(0.8);
    doc.line(pageWidth / 2 - 75, 114, pageWidth / 2 + 75, 114);

    // Better Recognition Statement
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(15);
    doc.setFont('times', 'normal');
    doc.text('In grateful appreciation for your exemplary leadership, unwavering dedication,', pageWidth / 2, 128, { align: 'center' });
    doc.text('and outstanding contributions to the success of the organization as', pageWidth / 2, 136, { align: 'center' });

    // The Title (High contrast)
    doc.setTextColor(deepRed[0], deepRed[1], deepRed[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(certificateData.title.toUpperCase(), pageWidth / 2, 150, { align: 'center' });

    // --- 4. CLEAN SIGNATURE & DATE LINES (BLACK) ---
    const lineY = 182;
    const lineWidth = 65;
    doc.setDrawColor(pureBlack[0], pureBlack[1], pureBlack[2]);
    doc.setLineWidth(0.5);

    // Left Line: Date
    doc.line(40, lineY, 40 + lineWidth, lineY);
    doc.setTextColor(pureBlack[0], pureBlack[1], pureBlack[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DATE OF ISSUANCE', 40 + (lineWidth / 2), lineY + 7, { align: 'center' });

    // Right Line: Signature
    doc.line(pageWidth - 40 - lineWidth, lineY, pageWidth - 40, lineY);
    doc.text('OFFICIAL SIGNATURE', pageWidth - 40 - (lineWidth / 2), lineY + 7, { align: 'center' });

    // --- 5. TOP SEAL (PRESTIGE BADGE) ---
    const sealX = pageWidth - 30;
    const sealY = 32;
   
    // Outer Gold
    doc.setFillColor(mutedGold[0], mutedGold[1], mutedGold[2]);
    doc.circle(sealX, sealY, 14, 'F');
   
    // Inner White Ring
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.6);
    doc.circle(sealX, sealY, 11, 'S');
   
    // Seal Content
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED', sealX, sealY + 1, { align: 'center' });

    // Footer Ref
    const certRef = certificateData.certificateNumber || `VER-REF-${Math.floor(Date.now() / 10000)}`;
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Official Document ID: ${certRef}`, 15, pageHeight - 10);

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
   
  } catch (error) {
    console.error('Error generating prestige PDF:', error);
    throw error;
  }
};
