import { Receipt as ReceiptType } from '@/types/pos';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { generateReceiptPDF, printReceipt } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

interface ReceiptProps {
  receipt: ReceiptType;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  showActions?: boolean;
}

export const Receipt = ({ 
  receipt, 
  storeName, 
  storeAddress, 
  storePhone,
  showActions = true 
}: ReceiptProps) => {
  
  const handleDownloadPDF = async () => {
    try {
      await generateReceiptPDF(receipt, { name: storeName, address: storeAddress, phone: storePhone, email: '' });
      toast({
        title: 'PDF Downloaded',
        description: 'Receipt has been saved as PDF successfully.'
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Could not generate PDF receipt.',
        variant: 'destructive'
      });
    }
  };

  const handlePrint = () => {
    try {
      printReceipt();
      toast({
        title: 'Printing...',
        description: 'Receipt sent to printer.'
      });
    } catch (error) {
      toast({
        title: 'Print Failed',
        description: 'Could not print receipt.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      {showActions && (
        <div className="flex space-x-2 mb-4">
          <Button onClick={handleDownloadPDF} className="flex-1" variant="default">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} className="flex-1" variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      )}

      {/* Receipt Content */}
      <div 
        id="receipt-content"
        className="pos-receipt max-w-[80mm] mx-auto bg-white text-black p-4"
        style={{ 
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.3',
          color: '#000'
        }}
      >
        {/* Store Header */}
        <div className="text-center mb-4">
          <div 
            style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}
          >
            {storeName}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>{storeAddress}</div>
          <div style={{ fontSize: '10px', marginBottom: '8px' }}>{storePhone}</div>
          
          <div style={{ 
            borderTop: '1px dashed #000',
            borderBottom: '1px dashed #000',
            padding: '4px 0',
            margin: '8px 0',
            fontSize: '10px'
          }}>
            OFFICIAL RECEIPT
          </div>
          
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            Receipt No: {receipt.id}
          </div>
          <div style={{ fontSize: '10px' }}>
            {format(receipt.timestamp, 'MMM dd, yyyy hh:mm a')}
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

        {/* Items */}
        <div style={{ marginBottom: '8px' }}>
          {receipt.items.map((item, index) => (
            <div key={index} style={{ marginBottom: '6px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                <span style={{ maxWidth: '60%', wordBreak: 'break-word' }}>
                  {item.name}
                </span>
                <span>₱{item.price.toFixed(2)}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#444'
              }}>
                <span>{item.quantity} x ₱{item.price.toFixed(2)}</span>
                <span>₱{(item.price * item.quantity).toFixed(2)}</span>
              </div>
              
              {item.discount && item.discount > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#666'
                }}>
                  <span>Discount ({item.discount}%)</span>
                  <span>-₱{((item.price * item.quantity * item.discount) / 100).toFixed(2)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

        {/* Totals */}
        <div style={{ fontSize: '11px', marginBottom: '8px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '2px'
          }}>
            <span>Subtotal:</span>
            <span>₱{receipt.subtotal.toFixed(2)}</span>
          </div>
          
          {receipt.discount > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px',
              color: '#666'
            }}>
              <span>Total Discount:</span>
              <span>-₱{receipt.discount.toFixed(2)}</span>
            </div>
          )}
          
          {receipt.tax > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '2px'
            }}>
              <span>VAT (12%):</span>
              <span>₱{receipt.tax.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '2px solid #000', margin: '8px 0' }}></div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          <span>TOTAL:</span>
          <span>₱{receipt.total.toFixed(2)}</span>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

        {/* Payment Info */}
        <div style={{ fontSize: '10px', marginBottom: '8px' }}>
          <div style={{ marginBottom: '2px' }}>
            Payment Method: {receipt.paymentMethod.toUpperCase()}
          </div>
          {receipt.cashier && (
            <div style={{ marginBottom: '2px' }}>
              Cashier: {receipt.cashier}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '10px',
          color: '#666',
          marginTop: '8px'
        }}>
          <div style={{ marginBottom: '4px' }}>Thank you for your purchase!</div>
          <div style={{ marginBottom: '4px' }}>Please come again!</div>
          <div style={{ marginBottom: '8px' }}>
            This serves as your official receipt.
          </div>
          <div style={{ fontSize: '8px' }}>
            Generated by Acer Online Cashier
          </div>
        </div>
      </div>
    </div>
  );
};