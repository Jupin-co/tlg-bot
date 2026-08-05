
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, UploadCloud, ReceiptText } from 'lucide-react';

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
        window.location.reload();
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
    <div className="container dir-auto">
      <div className="flex items-center gap-3 mb-6">
        <button className="secondary" style={{ padding: '8px', borderRadius: '50%' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold" style={{ margin: 0 }}>{t('lbl_invoice', 'Invoice')} <span className="num-fix">#{invoice.id}</span></h2>
      </div>
      
      <div className="card text-center flex flex-col items-center">
        <ReceiptText size={48} opacity={0.5} className="mb-4 text-hint" />
        
        <div className="flex flex-col gap-2 w-full text-left">
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-hint font-semibold text-sm uppercase">{t('lbl_status', 'Status')}</span>
            <span className={`font-bold ${invoice.status === 'PENDING_PAYMENT' ? 'text-danger' : 'text-success'}`}>{t('status_' + invoice.status.toLowerCase(), invoice.status) as string}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-hint font-semibold text-sm uppercase">{t('lbl_total', 'Total')}</span>
            <span className="font-bold text-lg num-fix">{invoice.total_price.toLocaleString()} {t(invoice.currency.toLowerCase(), invoice.currency)}</span>
          </div>
        </div>
        
        {invoice.status === 'PENDING_PAYMENT' && (
          <div className="w-full mt-6 text-left">
            <div className="flex justify-between items-center bg-[rgba(255,59,48,0.1)] px-4 py-3 rounded-lg mb-4">
              <span className="text-danger font-bold text-sm">{t('lbl_expires_in', 'Expires in:')}</span>
              <span className="text-danger font-bold num-fix">{timeLeft}</span>
            </div>
            
            <div className="bg-[var(--secondary-bg-color)] p-5 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-hint" />
                <h4 className="font-bold" style={{ margin: 0 }}>{t('lbl_payment_instructions', 'Payment Instructions')}</h4>
              </div>
              
              <p className="text-hint text-sm mb-1">{t('lbl_transfer_to_card', 'Transfer to Card:')}</p>
              <div className="bg-[var(--card-bg-color)] p-3 rounded-lg border border-[var(--border-color)] text-center mb-4">
                <p className="font-bold text-lg num-fix tracking-widest">{paymentInfo?.card_number || 'N/A'}</p>
                <p className="text-sm text-hint mt-1">{paymentInfo?.card_holder || 'N/A'}</p>
              </div>
              
              <div className="mt-6 border-t border-[var(--border-color)] pt-4">
                <p className="font-semibold text-sm mb-3 text-center">{t('lbl_upload_receipt_instruction', 'Upload your receipt image (Max 10MB)')}</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={uploading || timeLeft === 'Expired'}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button 
                  style={{ width: '100%' }}
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading || timeLeft === 'Expired'}
                >
                  <UploadCloud size={20} />
                  {uploading ? t('btn_uploading', 'Uploading...') : t('btn_upload_receipt', 'Upload Receipt')}
                </button>
              </div>
            </div>
          </div>
        )}

        {invoice.status === 'PENDING_APPROVAL' && (
          <div className="mt-6 p-4 rounded-lg text-center w-full" style={{ background: 'rgba(255,149,0,0.1)', color: '#ff9500' }}>
            <p className="font-semibold" style={{ margin: 0 }}>{t('msg_receipt_review', 'Your receipt is being reviewed by admins.')}</p>
          </div>
        )}
        {invoice.status === 'APPROVED' && (
          <div className="mt-6 p-4 rounded-lg text-center w-full" style={{ background: 'rgba(52,199,89,0.1)', color: '#34c759' }}>
            <p className="font-bold" style={{ margin: 0 }}>{t('msg_payment_approved', 'Payment approved! You can check your inventory.')}</p>
          </div>
        )}
        
        <button className="secondary mt-6 w-full flex items-center justify-center gap-2" onClick={() => navigate('/profile')}>
          {t('btn_go_to_profile', 'Go to Profile')} <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </div>
  );
}
