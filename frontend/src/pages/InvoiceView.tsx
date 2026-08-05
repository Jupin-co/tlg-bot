import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../i18n';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, UploadCloud, ReceiptText, Clock, CheckCircle2 } from 'lucide-react';

export default function InvoiceView({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initData && id) {
      fetch(`/api/invoice/${id}`, { headers: { 'x-telegram-init-data': initData } })
        .then(r => r.json())
        .then(data => {
          if (data.invoice) {
            setInvoice(data.invoice);
            setPaymentInfo(data.paymentInfo);
          }
        })
        .catch(console.error);
    }
  }, [initData, id]);

  useEffect(() => {
    if (invoice && invoice.expires_at && invoice.status === 'PENDING_PAYMENT') {
      const interval = setInterval(() => {
        const diff = new Date(invoice.expires_at).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft('Expired');
          clearInterval(interval);
        } else {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [invoice]);

  const convertToWebp = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject('Conversion failed');
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = reject;
    });
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('msg_only_images', 'Only images are allowed'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t('msg_file_size', 'File size must be less than 10MB'));
      return;
    }

    setUploading(true);

    try {
      const webpBlob = await convertToWebp(file);
      const formData = new FormData();
      formData.append('receipt', webpBlob, 'receipt.webp');

      const res = await fetch(`/api/invoice/${id}/receipt`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert(t('msg_upload_success', 'Receipt uploaded successfully! Awaiting approval.'));
        navigate('/profile');
      } else {
        alert(data.error || t('msg_upload_failed', 'Upload failed'));
      }
    } catch (err) {
      console.error(err);
      alert(t('msg_upload_error', 'Upload error or conversion failed'));
    } finally {
      setUploading(false);
    }
  };

  if (!invoice) {
    return <div className="container dir-auto flex justify-center items-center h-full"><p>Loading...</p></div>;
  }

  return (
    <div className="container dir-auto max-w-[600px] mx-auto py-4">
      {/* Sleek Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          className="p-2 rounded-full bg-[var(--secondary-bg-color)] hover:bg-[var(--border-color)] transition-colors flex items-center justify-center shrink-0 border-none cursor-pointer" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} className="text-[var(--text-color)]" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight leading-none m-0">{t('lbl_invoice', 'Invoice')}</h2>
          <span className="text-sm text-hint num-fix">#{invoice.id}</span>
        </div>
      </div>
      
      {/* Main Card */}
      <div className="bg-[var(--card-bg-color)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        
        {/* Top Summary Section */}
        <div className="p-6 border-b border-[var(--border-color)] flex flex-col items-center justify-center bg-[var(--secondary-bg-color)] relative">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-color)] flex items-center justify-center mb-4">
            <ReceiptText size={28} className="text-[var(--primary-color)]" />
          </div>
          
          <div className="text-center mb-4">
            <p className="text-sm text-hint uppercase tracking-wider font-semibold mb-1">{t('lbl_total', 'Total Amount')}</p>
            <div className="text-4xl font-extrabold tracking-tight num-fix">
              {formatNumber(invoice.total_price)} <span className="text-xl text-hint font-normal">{t(invoice.currency.toLowerCase(), invoice.currency) as string}</span>
            </div>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
            invoice.status === 'PENDING_PAYMENT' ? 'bg-danger/10 text-danger border-danger/20' : 
            invoice.status === 'APPROVED' ? 'bg-success/10 text-success border-success/20' : 
            'bg-warning/10 text-warning border-warning/20'
          }`}>
            {t('status_' + invoice.status.toLowerCase(), invoice.status) as string}
          </div>
        </div>
        
        {/* Expiry Warning (if pending) */}
        {invoice.status === 'PENDING_PAYMENT' && (
          <div className="p-4 bg-danger/5 border-b border-[rgba(255,59,48,0.1)] flex items-center justify-between">
            <span className="text-danger font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
              {t('lbl_expires_in', 'Time remaining to pay:')}
            </span>
            <span className="text-danger font-bold num-fix text-lg tracking-tight bg-[var(--card-bg-color)] px-2 rounded-md">{timeLeft}</span>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6">
          {invoice.status === 'PENDING_PAYMENT' && (
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-[var(--primary-color)]" />
                  <h4 className="font-bold text-sm uppercase tracking-wide m-0">{t('lbl_payment_instructions', 'Payment Details')}</h4>
                </div>
                
                <div className="bg-[var(--secondary-bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                  <p className="text-hint text-xs uppercase font-semibold mb-2">{t('lbl_transfer_to_card', 'Transfer exact amount to:')}</p>
                  <p className="font-bold text-xl num-fix tracking-widest break-all mb-1">{paymentInfo?.card_number || 'N/A'}</p>
                  <p className="text-sm font-medium opacity-80">{paymentInfo?.card_holder || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-sm uppercase tracking-wide m-0 flex items-center gap-2">
                  <UploadCloud size={18} className="text-[var(--primary-color)]" />
                  {t('lbl_upload_receipt_instruction', 'Confirm Payment')}
                </h4>
                <p className="text-sm text-hint leading-relaxed">
                  {t('lbl_upload_receipt_desc', 'After transferring the funds, upload a screenshot or photo of your receipt. (Max 10MB)')}
                </p>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={uploading || timeLeft === 'Expired'}
                  ref={fileInputRef}
                  className="hidden"
                  style={{ display: 'none' }}
                />
                
                <button 
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-none cursor-pointer ${uploading || timeLeft === 'Expired' ? 'bg-[var(--secondary-bg-color)] text-hint cursor-not-allowed' : 'bg-[var(--primary-color)] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'}`}
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading || timeLeft === 'Expired'}
                >
                  <UploadCloud size={20} className={uploading ? 'animate-bounce' : ''} />
                  {uploading ? t('btn_uploading', 'Uploading securely...') : t('btn_upload_receipt', 'Upload Receipt Image')}
                </button>
              </div>
              
            </div>
          )}

          {invoice.status === 'PENDING_APPROVAL' && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-warning" style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)' }}>
                <Clock size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('status_pending_approval', 'Under Review')}</h3>
              <p className="text-sm text-hint max-w-xs">{t('msg_receipt_review', 'Your receipt has been securely uploaded and is currently being verified by our team.')}</p>
            </div>
          )}
          
          {invoice.status === 'APPROVED' && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-success" style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('status_approved', 'Payment Successful')}</h3>
              <p className="text-sm text-hint max-w-xs">{t('msg_payment_approved', 'Your payment has been verified. You can now access your products in your inventory.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
