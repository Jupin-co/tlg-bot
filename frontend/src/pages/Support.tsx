import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageSquare, Plus, Send } from 'lucide-react';

export default function Support({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create ticket state
  const [isCreating, setIsCreating] = useState(false);
  const [newHeading, setNewHeading] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<string>('');
  
  // Active ticket view state
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  
  useEffect(() => {
    if (initData) {
      fetchTickets();
      fetchPayments();
    }
  }, [initData]);

  const fetchTickets = () => {
    fetch('/api/tickets', {
      headers: { 'x-telegram-init-data': initData }
    })
      .then(res => res.json())
      .then(data => {
        setTickets(data.tickets || []);
        setLoading(false);
      });
  };

  const fetchPayments = () => {
    fetch('/api/payments', {
      headers: { 'x-telegram-init-data': initData }
    })
      .then(res => res.json())
      .then(data => {
        setPayments(data.payments || []);
      });
  };
  
  const viewTicket = (ticket: any) => {
    setActiveTicket(ticket);
    fetch(`/api/tickets/${ticket.id}`, {
      headers: { 'x-telegram-init-data': initData }
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
      });
  };

  const handleCreateTicket = () => {
    if (!newHeading.trim() || !newMessage.trim()) return;
    
    fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': initData
      },
      body: JSON.stringify({
        heading: newHeading,
        message: newMessage,
        invoice_id: selectedInvoice ? parseInt(selectedInvoice) : null
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsCreating(false);
          setNewHeading('');
          setNewMessage('');
          setSelectedInvoice('');
          fetchTickets();
        }
      });
  };

  const handleReply = () => {
    if (!replyText.trim() || !activeTicket) return;
    
    fetch(`/api/tickets/${activeTicket.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': initData
      },
      body: JSON.stringify({ message: replyText })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReplyText('');
          viewTicket(activeTicket); // refresh messages
        }
      });
  };
  
  const closeTicket = () => {
    if (!activeTicket) return;
    if (!confirm(t('confirm_close_ticket', 'Are you sure you want to close this ticket?'))) return;
    
    fetch(`/api/tickets/${activeTicket.id}/close`, {
      method: 'POST',
      headers: { 'x-telegram-init-data': initData }
    })
      .then(() => {
        setActiveTicket({ ...activeTicket, status: 'CLOSED' });
        fetchTickets();
      });
  };

  if (loading) return <div className="p-4 text-center">{t('loading', 'Loading...')}</div>;

  if (activeTicket) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] pb-20 relative">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-[var(--bg-color)] z-10 py-2">
          <div className="flex items-center gap-3">
            <button className="secondary p-2 rounded-full" onClick={() => setActiveTicket(null)}>
              <ArrowLeft size={20} />
            </button>
            <h2 className="m-0 text-lg font-bold truncate max-w-[200px]">{activeTicket.heading}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded font-bold ${activeTicket.status === 'OPEN' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
              {activeTicket.status}
            </span>
            {activeTicket.status === 'OPEN' && (
              <button className="danger p-2 text-xs" onClick={closeTicket}>{t('lbl_close_ticket', 'Close')}</button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-3 pb-2">
          {messages.map(m => {
            return (
              <div key={m.id} className={`p-3 rounded-xl max-w-[85%] ${m.sender_name ? 'bg-[var(--secondary-bg-color)] self-start' : 'bg-[var(--primary-color)] text-white self-end'}`}>
                {m.sender_name && <div className="text-xs opacity-70 mb-1 font-bold">{m.sender_name} (Support)</div>}
                <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                <div className="text-[10px] opacity-60 mt-1 text-right">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
        
        {activeTicket.status === 'OPEN' ? (
          <div className="flex gap-2 sticky bottom-0 bg-[var(--bg-color)] py-2">
            <input 
              type="text" 
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={t('lbl_type_message', 'Type a message...') as string}
              className="flex-1"
              onKeyPress={e => e.key === 'Enter' && handleReply()}
            />
            <button className="primary p-3" onClick={handleReply}>
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div className="text-center text-hint text-sm p-3 bg-[var(--secondary-bg-color)] rounded-lg">
            {t('lbl_ticket_closed_msg', 'This ticket is closed.')}
          </div>
        )}
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="animate-fade-in pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold m-0 flex items-center gap-2">
            <button className="secondary p-1 rounded-full" onClick={() => setIsCreating(false)}><ArrowLeft size={20}/></button>
            {t('lbl_create_ticket', 'New Ticket')}
          </h1>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="input-group">
            <label>{t('lbl_related_invoice', 'Related Invoice (Optional)')}</label>
            <select value={selectedInvoice} onChange={e => setSelectedInvoice(e.target.value)} className="w-full p-3 rounded-xl bg-[var(--secondary-bg-color)] border border-[var(--border-color)]">
              <option value="">{t('lbl_none', 'None')}</option>
              {payments.map(p => (
                <option key={p.id} value={p.invoice_id}>
                  {t('lbl_invoice', 'Invoice')} #{p.invoice_id} - {p.type === 'WALLET_CHARGE' ? t('lbl_wallet_charge', 'Wallet Charge') : t('lbl_product_purchase', 'Product Purchase')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="input-group">
            <label>{t('lbl_heading', 'Subject')}</label>
            <input type="text" value={newHeading} onChange={e => setNewHeading(e.target.value)} placeholder={t('lbl_heading_placeholder', 'E.g. Issue with my payment') as string} />
          </div>
          
          <div className="input-group">
            <label>{t('lbl_message', 'Message')}</label>
            <textarea 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
              rows={5}
              placeholder={t('lbl_message_placeholder', 'Describe your issue in detail...') as string}
              className="w-full p-3 rounded-xl bg-[var(--secondary-bg-color)] border border-[var(--border-color)] resize-none"
            />
          </div>
          
          <button className="primary w-full py-3 mt-2" onClick={handleCreateTicket} disabled={!newHeading.trim() || !newMessage.trim()}>
            {t('btn_submit_ticket', 'Submit Ticket')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold m-0">{t('lbl_support', 'Support')}</h1>
        <button className="primary p-2 flex items-center gap-1 text-sm" onClick={() => setIsCreating(true)}>
          <Plus size={16} /> {t('lbl_new_ticket', 'New')}
        </button>
      </div>
      
      {tickets.length === 0 ? (
        <div className="card text-center py-10 text-hint flex flex-col items-center gap-3">
          <MessageSquare size={48} opacity={0.3} />
          <p>{t('msg_no_tickets', 'You have no support tickets.')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map(t => (
            <div key={t.id} className="card cursor-pointer hover:border-[var(--button-color)] transition-colors" onClick={() => viewTicket(t)}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold m-0 text-base">{t.heading}</h3>
                <span className={`text-[10px] px-2 py-1 rounded font-bold ${t.status === 'OPEN' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                  {t.status}
                </span>
              </div>
              {t.invoice_id && (
                <div className="text-xs text-hint mb-2">
                  {t.invoice_type === 'WALLET_CHARGE' ? 'Wallet Charge' : 'Order'} #{t.invoice_id}
                </div>
              )}
              <div className="text-[10px] text-hint text-right">{new Date(t.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
