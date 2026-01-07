// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';

export const generatePDFCertificate = async (certificateData) => {
  try {
    // Create a new jsPDF instance in landscape mode (A4)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Set page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Add background color
    doc.setFillColor(248, 249, 250); // #f8f9fa
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add border
    doc.setDrawColor(231, 76, 60); // #e74c3c
    doc.setLineWidth(3);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Add decorative stars
    doc.setTextColor(52, 152, 219); // #3498db
    doc.setFontSize(40);
    doc.text('★', margin + 10, margin + 10);
    doc.text('★', pageWidth - margin - 10, margin + 10);
    doc.text('★', margin + 10, pageHeight - margin - 10);
    doc.text('★', pageWidth - margin - 10, pageHeight - margin - 10);

    // Main title
    doc.setTextColor(44, 62, 80); // #2c3e50
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF RECOGNITION', pageWidth / 2, 60, { align: 'center' });

    // Subtitle
    doc.setTextColor(127, 140, 141); // #7f8c8d
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Presented To', pageWidth / 2, 80, { align: 'center' });

    // Employee name
    doc.setTextColor(231, 76, 60); // #e74c3c
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text(certificateData.employeeName, pageWidth / 2, 100, { align: 'center' });

    // For outstanding achievement in
    doc.setTextColor(44, 62, 80); // #2c3e50
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('for outstanding achievement in', pageWidth / 2, 120, { align: 'center' });

    // Recognition title
    doc.setTextColor(44, 62, 80); // #2c3e50
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`"${certificateData.title}"`, pageWidth / 2, 135, { align: 'center' });

    // Recognition type
    const recognitionType = certificateData.recognitionType 
      ? certificateData.recognitionType.replace(/_/g, ' ').toUpperCase()
      : 'RECOGNITION';
    
    doc.setTextColor(52, 152, 219); // #3498db
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(recognitionType, pageWidth / 2, 155, { align: 'center' });

    // Format date
    const issueDate = certificateData.date 
      ? new Date(certificateData.date)
      : new Date();
    
    const formattedDate = issueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.setTextColor(127, 140, 141); // #7f8c8d
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formattedDate}`, pageWidth / 2, 175, { align: 'center' });

    // Certificate number
    const certNumber = certificateData.certificateNumber || 
      `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    doc.setTextColor(149, 165, 166); // #95a5a6
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Certificate No: ${certNumber}`, pageWidth / 2, pageHeight - 40, { align: 'center' });

    // Signatures area
    const signatureY = 200;

    // Left signature (Issuer)
    const issuer = certificateData.issuer || 'Your Company Name';
    doc.setTextColor(44, 62, 80); // #2c3e50
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Signature line
    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(0.5);
    doc.line(60, signatureY, 120, signatureY);
    doc.text(issuer, 90, signatureY + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.text('Issuing Authority', 90, signatureY + 20, { align: 'center' });

    // Right signature (CEO)
    const signature = certificateData.signature || 'CEO Signature';
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Signature line
    doc.line(pageWidth - 120, signatureY, pageWidth - 60, signatureY);
    doc.text(signature, pageWidth - 90, signatureY + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.text('Chief Executive Officer', pageWidth - 90, signatureY + 20, { align: 'center' });

    // Company seal (center)
    const centerX = pageWidth / 2;
    const sealY = signatureY + 40;
    
    // Draw seal circle
    doc.setDrawColor(231, 76, 60); // #e74c3c
    doc.setFillColor(255, 255, 255); // white
    doc.circle(centerX, sealY, 15, 'FD'); // Fill and draw
    
    // Add text inside seal
    doc.setTextColor(231, 76, 60); // #e74c3c
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SEAL', centerX - 8, sealY - 2);

    // Return the PDF as a Buffer directly
    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};