import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Basket({ initData }: { initData: string }) {
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
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
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
      alert('Upload error');
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
          <p><strong>Total:</strong> {new Intl.NumberFormat().format(invoice.total_price)} {invoice.currency}</p>
          
          {invoice.status === 'PENDING_PAYMENT' && (
            <>
              <p style={{ color: 'red', fontWeight: 'bold' }}>Expires in: {timeLeft}</p>
              <div style={{ marginTop: 20, padding: 10, background: 'var(--tg-theme-secondary-bg-color)', borderRadius: 8 }}>
                <h4>Payment Instructions</h4>
                <p>Transfer to Card:</p>
                <p><strong>{paymentInfo?.card_number || 'N/A'}</strong></p>
                <p>{paymentInfo?.card_holder || 'N/A'}</p>
                
                <div style={{ marginTop: 20 }}>
                  <p>Upload your receipt image (Max 5MB):</p>
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
                    {uploading ? 'Uploading...' : 'Upload Receipt'}
                  </button>
                </div>
              </div>
            </>
          )}

          {invoice.status === 'PENDING_APPROVAL' && (
            <p style={{ marginTop: 20, color: 'orange' }}>Your receipt is being reviewed by admins.</p>
          )}
          {invoice.status === 'APPROVED' && (
            <p style={{ marginTop: 20, color: 'green' }}>Payment approved! You can check your wallet.</p>
          )}
          
          <button style={{ marginTop: 20 }} onClick={() => navigate('/profile')}>Go to Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate('/')}>&larr; Back</button>
        <h1>Your Basket</h1>
      </div>
      
      {basket.length === 0 ? (
        <p className="mt-4">Your basket is empty.</p>
      ) : (
        <div className="mt-4">
          {basket.map(item => (
            <div key={item.basket_id} className="card mt-2 flex justify-between items-center">
              <div>
                <h4>{item.name}</h4>
                <p>{new Intl.NumberFormat().format(item.base_price)} {item.currency} x {item.quantity}</p>
              </div>
              <button style={{ background: 'red' }} onClick={() => handleRemove(item.basket_id)}>Remove</button>
            </div>
          ))}
          
          <div className="card mt-4">
            <h3>Total: {new Intl.NumberFormat().format(basket.reduce((a, b) => a + b.base_price * b.quantity, 0))} {basket[0]?.currency}</h3>
            <button className="mt-2" style={{ width: '100%' }} onClick={handleCheckout}>Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}
