import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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

export default function Basket({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [basket, setBasket] = useState<any[]>([]);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBasket = () => {
    fetch('/api/basket', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.basket) setBasket(data.basket);
      })
      .catch(console.error);
  };

  const fetchInvoice = (id: number) => {
    fetch(`/api/invoice/${id}`, { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => {
        if (data.invoice) {
          setInvoice(data.invoice);
          setPaymentInfo(data.paymentInfo);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (initData) fetchBasket();
  }, [initData]);

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

  const handleRemove = async (basketId: number) => {
    await fetch('/api/basket/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ basket_id: basketId })
    });
    fetchBasket();
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/invoice/create', {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData }
      });
      const data = await res.json();
      if (data.success) {
        setInvoiceId(data.invoice_id);
        fetchInvoice(data.invoice_id);
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch {
      console.error('error');
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only images are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const webpBlob = await convertToWebp(file);
      const formData = new FormData();
      formData.append('receipt', webpBlob, 'receipt.webp');

      const res = await fetch(`/api/invoice/${invoiceId}/receipt`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('Receipt uploaded successfully! Awaiting approval.');
        fetchInvoice(invoiceId!);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload error or conversion failed');
    } finally {
      setUploading(false);
    }
  };

  if (invoice) {
    return (
      <div style={{ paddingBottom: 60 }}>
        <h2>Invoice #{invoice.id}</h2>
        <div className="card mt-2">
          <p><strong>Status:</strong> {invoice.status}</p>
          <p><strong>Total:</strong> {invoice.total_price.toLocaleString()} {invoice.currency}</p>
          
          {invoice.status === 'PENDING_PAYMENT' && (
            <>
              <p style={{ color: 'red', fontWeight: 'bold' }}>{t('lbl_expires_in', 'Expires in:')} {timeLeft}</p>
              <div style={{ marginTop: 20, padding: 10, background: 'var(--tg-theme-secondary-bg-color)', borderRadius: 8 }}>
                <h4>{t('lbl_payment_instructions', 'Payment Instructions')}</h4>
                <p>{t('lbl_transfer_to_card', 'Transfer to Card:')}</p>
                <p><strong>{paymentInfo?.card_number || 'N/A'}</strong></p>
                <p>{paymentInfo?.card_holder || 'N/A'}</p>
                
                <div style={{ marginTop: 20 }}>
                  <p>{t('lbl_upload_receipt_instruction', 'Upload your receipt image (Max 10MB):')}</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    disabled={uploading || timeLeft === 'Expired'}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={uploading || timeLeft === 'Expired'}
                  >
                    {uploading ? t('btn_uploading', 'Uploading...') : t('btn_upload_receipt', 'Upload Receipt')}
                  </button>
                </div>
              </div>
            </>
          )}

          {invoice.status === 'PENDING_APPROVAL' && (
            <p style={{ marginTop: 20, color: 'orange' }}>{t('msg_receipt_review', 'Your receipt is being reviewed by admins.')}</p>
          )}
          {invoice.status === 'APPROVED' && (
            <p style={{ marginTop: 20, color: 'green' }}>{t('msg_payment_approved', 'Payment approved! You can check your wallet.')}</p>
          )}
          
          <button style={{ marginTop: 20 }} onClick={() => navigate('/profile')}>{t('btn_go_to_profile', 'Go to Profile')}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate('/')}>&larr; {t('btn_back', 'Back')}</button>
        <h1>{t('title_basket', 'Your Basket')}</h1>
      </div>
      
      {basket.length === 0 ? (
        <p className="mt-4">{t('msg_basket_empty', 'Your basket is empty.')}</p>
      ) : (
        <div className="mt-4">
          {basket.map(item => (
            <div key={item.basket_id} className="card mt-2 flex justify-between items-center">
              <div>
                <h4>{item.name}</h4>
                <p>{item.base_price.toLocaleString()} {item.currency} x {item.quantity}</p>
              </div>
              <button style={{ background: '#f44336' }} onClick={() => handleRemove(item.basket_id)}>{t('btn_remove', 'Remove')}</button>
            </div>
          ))}
          
          <div className="card mt-4">
            <h3>{t('lbl_total', 'Total:')} {basket.reduce((a, b) => a + b.base_price * b.quantity, 0).toLocaleString()} {basket[0]?.currency}</h3>
            <button className="mt-2" style={{ width: '100%' }} onClick={handleCheckout}>{t('btn_checkout', 'Checkout')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
