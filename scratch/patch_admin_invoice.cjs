const fs = require('fs');
const file = 'frontend/src/pages/Admin.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `          {invoices.length === 0 ? (
            <p className="text-hint">No invoices found.</p>
          ) : (
            invoices.map(inv => (
              <div key={inv.id} className="card">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold m-0 truncate">{t('invoice_hash', 'Invoice #') as string}{inv.id}</h3>
                    <p className="text-sm font-medium mt-1">
                      {inv.first_name} {inv.username ? \`(@\${inv.username})\` : ''}
                    </p>
                    <p className="text-xs text-hint mt-1 flex items-center gap-1">
                      <Clock size={12} /> {new Date(inv.created_at).toLocaleString()}
                    </p>
                  </div>`;

const replacement = `          {invoices.length === 0 ? (
            <p className="text-hint">No invoices found.</p>
          ) : (
            invoices.map(inv => {
              let receiptKey = null;
              if (inv.payment_data) {
                try {
                  const data = JSON.parse(inv.payment_data);
                  receiptKey = data.receipt_key;
                } catch (e) {}
              }
              
              return (
              <div 
                key={inv.id} 
                className={\`card \${receiptKey ? 'cursor-pointer hover:border-[var(--button-color)] transition-colors' : ''}\`}
                onClick={() => {
                  if (receiptKey) {
                    const k = receiptKey.startsWith('receipts/') ? receiptKey.replace('receipts/', '') : receiptKey;
                    setFullScreenImg(\`/api/receipt-image/\${k}\`);
                  }
                }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold m-0 truncate">{t('invoice_hash', 'Invoice #') as string}{inv.id}</h3>
                    <p className="text-sm font-medium mt-1">
                      {inv.first_name} {inv.username ? \`(@\${inv.username})\` : ''}
                    </p>
                    <p className="text-xs text-hint mt-1 flex items-center gap-1">
                      <Clock size={12} /> {new Date(inv.created_at).toLocaleString()}
                    </p>
                    {receiptKey && (
                      <p className="text-xs text-[var(--button-color)] mt-2 flex items-center gap-1">
                        <Eye size={14} /> {t('lbl_view_receipt', 'View Receipt')}
                      </p>
                    )}
                  </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  // Also fix the closing parenthesis of map
  const targetEnd = `              </div>
            ))
          )}`;
  const replacementEnd = `              </div>
            )})
          )}`;
  code = code.replace(targetEnd, replacementEnd);
  
  fs.writeFileSync(file, code);
  console.log('Admin.tsx patched successfully');
} else {
  console.log('Target not found in Admin.tsx');
}
