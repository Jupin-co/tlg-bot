import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

export default function SupportAdmin({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Active ticket view state
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  
  useEffect(() => {
    if (initData) {
      fetchTickets();
    }
  }, [initData]);

  const fetchTickets = () => {
    fetch('/api/admin/tickets', {
      headers: { 'x-telegram-init-data': initData }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setTickets(data.tickets || []);
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  };
  
  const viewTicket = (ticket: any) => {
    setActiveTicket(ticket);
    fetch(`/api/admin/tickets/${ticket.id}`, {
      headers: { 'x-telegram-init-data': initData }
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
      });
  };

  const handleReply = () => {
    if (!replyText.trim() || !activeTicket) return;
    
    fetch(`/api/admin/tickets/${activeTicket.id}/messages`, {
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
    
    fetch(`/api/admin/tickets/${activeTicket.id}/close`, {
      method: 'POST',
      headers: { 'x-telegram-init-data': initData }
    })
      .then(() => {
        setActiveTicket({ ...activeTicket, status: 'CLOSED' });
        fetchTickets();
      });
  };

  if (loading) return <div className="p-4 text-center">{t('loading', 'Loading...')}</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  if (activeTicket) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] pb-20 relative animate-fade-in">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-[var(--bg-color)] z-10 py-2">
          <div className="flex items-center gap-3">
            <button className="secondary p-2 rounded-full" onClick={() => setActiveTicket(null)}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="m-0 text-lg font-bold truncate max-w-[200px]">{activeTicket.heading}</h2>
              <div className="text-xs text-hint">User: {activeTicket.first_name || 'Unknown'}</div>
            </div>
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
          {messages.map((m: any) => {
            const isUser = m.sender_id === activeTicket.user_id;
            return (
              <div key={m.id} className={`p-3 rounded-xl max-w-[85%] ${!isUser ? 'bg-[var(--secondary-bg-color)] self-start' : 'bg-[var(--primary-color)] text-white self-end'}`}>
                <div className="text-xs opacity-70 mb-1 font-bold">{isUser ? activeTicket.first_name : m.sender_name + ' (Support)'}</div>
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

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold m-0">{t('lbl_support_admin', 'Support Admin')}</h1>
      </div>
      
      {tickets.length === 0 ? (
        <div className="card text-center py-10 text-hint flex flex-col items-center gap-3">
          <MessageSquare size={48} opacity={0.3} />
          <p>{t('msg_no_tickets', 'There are no support tickets.')}</p>
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
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-[var(--text-color)] font-bold mb-1">
                    User: {t.first_name || 'Unknown'}
                  </div>
                  {t.invoice_id && (
                    <div className="text-xs text-hint">
                      {t.invoice_type === 'WALLET_CHARGE' ? 'Wallet Charge' : 'Order'} #{t.invoice_id}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-hint text-right">{new Date(t.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
