// PDF Generator for Employee Payslips using jsPDF and html2canvas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency, numberToWords } from './dateUtils';

/**
 * Downloads a high-resolution, branded PDF payslip directly to the user's device.
 * 
 * @param {HTMLElement|string} elementOrId - The DOM element or ID containing the printable payslip
 * @param {Object} payslipData - Structured payslip calculation data
 * @param {Object} company - Company metadata (name, gstin, address, etc.)
 */
export const downloadPayslipAsPDF = async (elementOrId, payslipData, company = {}) => {
  try {
    const element = typeof elementOrId === 'string'
      ? document.getElementById(elementOrId)
      : elementOrId;

    if (!element) {
      throw new Error('Payslip element not found in DOM');
    }

    // Sanitize employee name for clean filename
    const safeName = (payslipData?.employeeName || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeMonth = (payslipData?.monthName || 'Month').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeYear = payslipData?.year || new Date().getFullYear();
    const fileName = `Payslip_${safeName}_${safeMonth}_${safeYear}.pdf`;

    // High quality canvas capture (scale: 2 for sharp retina text)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024, // Consistent rendering viewport
      onclone: (clonedDoc) => {
        // Ensure the cloned payslip element is fully expanded and visible
        const clonedEl = clonedDoc.getElementById('printable-payslip') || clonedDoc.body;
        if (clonedEl) {
          clonedEl.style.overflow = 'visible';
          clonedEl.style.height = 'auto';
          clonedEl.style.maxHeight = 'none';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10; // 10mm margins
    const contentWidth = pdfWidth - (margin * 2);

    // Calculate scaled height preserving aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const contentHeight = (imgHeight * contentWidth) / imgWidth;

    // If it fits on 1 page (most payslips do with 10mm margin):
    if (contentHeight <= pdfHeight - (margin * 2)) {
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');
    } else {
      // Multi-page slicing if unusually long
      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - (margin * 2));

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
        heightLeft -= (pdfHeight - (margin * 2));
      }
    }

    // Trigger direct browser file download
    pdf.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Failed to generate payslip PDF via html2canvas:', error);
    // Fallback: trigger standard browser print dialog
    if (typeof window !== 'undefined') {
      window.print();
    }
    return { success: false, error: error.message };
  }
};
