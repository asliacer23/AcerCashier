import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Receipt, Store } from '@/types/pos';
import { format } from 'date-fns';

export const generateReceiptPDF = async (
  receipt: Receipt,
  store: Store,
  elementId: string = 'receipt-content'
): Promise<void> => {
  try {
    // Get the receipt element
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Receipt element not found');
    }

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Calculate dimensions for thermal receipt (80mm width)
    const imgWidth = 80; // 80mm thermal paper width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF in portrait mode with custom size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, Math.max(imgHeight + 20, 100)] // Dynamic height with minimum
    });

    // Add the canvas image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 5, 10, imgWidth - 10, imgHeight);

    // Generate filename with timestamp
    const timestamp = format(receipt.timestamp, 'yyyyMMdd-HHmmss');
    const filename = `Receipt-${receipt.id}-${timestamp}.pdf`;

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF receipt');
  }
};

export const printReceipt = (): void => {
  // Create print-specific styles
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      #receipt-content, #receipt-content * {
        visibility: visible;
      }
      #receipt-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 80mm;
        font-size: 12px;
        line-height: 1.2;
      }
      @page {
        size: 80mm auto;
        margin: 5mm;
      }
    }
  `;

  // Add print styles to document
  const styleElement = document.createElement('style');
  styleElement.textContent = printStyles;
  document.head.appendChild(styleElement);

  // Trigger print
  window.print();

  // Remove print styles after printing
  setTimeout(() => {
    document.head.removeChild(styleElement);
  }, 1000);
};