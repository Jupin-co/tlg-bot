import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../i18n';
import { Package, Clock, Copy, Check, Search, ArrowUpDown } from 'lucide-react';

export default function Inventory({ initData }: { initData: string }) {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<any[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'time_asc' | 'time_desc'>('none');

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
    const invItem = inventory.find(i => i.id === id);
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ 
        action: 'COPY_REDEEM_CODE', 
        details: { 
          inventory_id: id,
          product_name: invItem?.product_name || invItem?.snapshot_name,
          user_agent: navigator.userAgent
        } 
      })
    }).catch(console.error);
  };

  useEffect(() => {
    if (!initData) return;
    fetch('/api/inventory', { headers: { 'x-telegram-init-data': initData } })
      .then(r => r.json())
      .then(data => { if (data.inventory) setInventory(data.inventory); })
      .catch(console.error);
  }, [initData]);

  const calculateTimeLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${formatNumber(d)} ${t('lbl_days', 'days')} ${formatNumber(h)} ${t('lbl_hours', 'hours')}`;
  };

  if (!initData) {
    return (
      <div className="container dir-auto flex flex-col items-center justify-center h-full gap-4 text-center">
        <Package size={48} opacity={0.3} />
        <p className="text-hint">{t('msg_open_in_telegram', 'Please open this app from inside Telegram.')}</p>
      </div>
    );
  }

  const filteredInventory = inventory.filter(item => 
    (item.snapshot_name && item.snapshot_name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (item.snapshot_description && item.snapshot_description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortOrder === 'none') return 0;
    const aTime = a.access_ends_at ? new Date(a.access_ends_at).getTime() : Infinity;
    const bTime = b.access_ends_at ? new Date(b.access_ends_at).getTime() : Infinity;
    return sortOrder === 'time_asc' ? aTime - bTime : bTime - aTime;
  });

  return (
    <div className="container dir-auto">
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-xl font-bold m-0">{t('tab_inventory', 'Inventory')}</h1>
      </div>

      <div className="flex flex-col gap-3 mb-4 bg-[var(--card-bg-color)] p-3 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-hint" size={18} />
          <input 
            type="text" 
            placeholder={t('search', 'Search')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 m-0 bg-[var(--bg-color)]"
            style={{ margin: 0 }}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSortOrder(prev => prev === 'none' ? 'time_asc' : prev === 'time_asc' ? 'time_desc' : 'none')}
            className={`flex-1 flex items-center justify-center gap-2 m-0 ${sortOrder !== 'none' ? 'primary' : 'secondary'}`}
          >
            <ArrowUpDown size={16} />
            <span className="text-sm font-medium">
              {sortOrder === 'none' ? 'Sort by Expiry' : sortOrder === 'time_asc' ? 'Expiry: Soonest First' : 'Expiry: Latest First'}
            </span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {sortedInventory.length === 0 ? (
          <div className="card text-center py-10 text-hint flex flex-col items-center gap-3">
            <Package size={48} opacity={0.3} />
            <p>{searchQuery ? t('no_results', 'No results found.') : t('msg_no_products', 'You have no active products.')}</p>
          </div>
        ) : (
          sortedInventory.map(item => (
            <div key={item.id} className="card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--button-color)]"></div>
              <h4 className="font-bold text-lg m-0">{item.snapshot_name}</h4>
              <p className="text-sm text-hint mt-1 mb-4">{item.snapshot_description}</p>
              
              {item.image_url && (
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 border border-[var(--border-color)]">
                  <img src={item.image_url} alt={item.snapshot_name} className="w-full h-full object-cover" />
                </div>
              )}

              {item.redeem_code && (
                <div className="bg-[var(--secondary-bg-color)] p-3 rounded-lg border border-[var(--border-color)] mb-4 flex flex-col gap-2">
                  <span className="text-xs text-hint uppercase font-semibold">{t('lbl_code', 'Code')}</span>
                  <div className="flex items-start gap-2 bg-[var(--bg-color)] p-2 rounded border border-[var(--border-color)]">
                    <div className="flex-1 break-all whitespace-normal text-sm font-mono num-fix">
                      {item.redeem_code}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(item.redeem_code, item.id)}
                      className="p-2 bg-[var(--button-color)] text-[var(--button-text-color)] rounded-md shrink-0 hover:opacity-90 transition-opacity"
                      title="Copy Code"
                    >
                      {copiedCodeId === item.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
              
              {item.access_ends_at && (
                <div className="flex items-center gap-2 text-sm font-medium border-t border-[var(--border-color)] pt-3">
                  <Clock size={16} className="text-[var(--button-color)]" />
                  <span>{t('lbl_time_left', 'Time left:')}</span>
                  <span className="text-[var(--button-color)]">{calculateTimeLeft(item.access_ends_at)}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
