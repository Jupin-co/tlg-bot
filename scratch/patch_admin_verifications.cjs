const fs = require('fs');
const path = 'frontend/src/pages/Admin.tsx';
let content = fs.readFileSync(path, 'utf8');

const stateVars = `
  const [verifications, setVerifications] = useState<any[]>([]);

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/admin/verifications', { headers: { 'x-telegram-init-data': initData } });
      const data = await res.json();
      if (data.verifications) setVerifications(data.verifications);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerification = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(\`/api/admin/verifications/\${id}/\${action}\`, {
        method: 'POST',
        headers: { 'x-telegram-init-data': initData }
      });
      if (res.ok) {
        showToast(action === 'approve' ? 'Approved' : 'Rejected', 'success');
        fetchVerifications();
      } else {
        showToast('Failed to process verification', 'error');
      }
    } catch {
      showToast('Error processing verification', 'error');
    }
  };
`;

content = content.replace('const handlePayment = async', stateVars + '\n  const handlePayment = async');

const fetchEffect = `
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'verifications') {
      fetchVerifications();
    }
  }, [activeTab, initData]);
`;

content = content.replace(/\} else if \(activeTab === 'users'\) \{\r?\n\s*fetchUsers\(\);\r?\n\s*\}\r?\n\s*\}, \[activeTab, initData\]\);/, fetchEffect);


const tabMenu = `
        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {['catalog', 'payments', 'invoices', 'users', 'settings', 'verifications'].map(tab => (
            <button 
              key={tab}
              className={\`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all \${activeTab === tab ? 'bg-[#4F46E5] text-white shadow-md' : 'bg-[var(--secondary-bg-color)] text-[var(--text-color)] opacity-70 hover:opacity-100'}\`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
`;

content = content.replace(/<div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">[\s\S]*?<\/div>/, tabMenu);


const verificationsRender = `
      {activeTab === 'verifications' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-xl">{t('lbl_kyc_verifications', 'KYC Verifications')}</h2>
            <button className="secondary py-1 px-3" onClick={fetchVerifications}><RefreshCw size={16} /></button>
          </div>
          
          {verifications.length === 0 ? (
            <div className="card text-center py-10 text-hint">
              <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p>{t('msg_no_pending_verifications', 'No pending verifications.')}</p>
            </div>
          ) : (
            verifications.map(v => (
              <div key={v.user_id} className="card flex flex-col gap-3 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{v.first_name} {v.last_name}</h3>
                    <p className="text-sm text-hint num-fix">@{v.username}</p>
                  </div>
                  <span className="bg-[rgba(255,149,0,0.1)] text-[var(--hint-color)] px-3 py-1 rounded-full font-bold text-xs">
                    PENDING
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2 bg-[var(--secondary-bg-color)] p-3 rounded-lg border border-[var(--border-color)]">
                  <div>
                    <span className="text-xs text-hint block mb-1">National Code</span>
                    <span className="font-medium num-fix">{v.national_code}</span>
                  </div>
                  <div>
                    <span className="text-xs text-hint block mb-1">Date of Birth</span>
                    <span className="font-medium num-fix">{v.date_of_birth}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button 
                    className="flex-1 bg-[rgba(52,199,89,0.1)] text-success border border-[rgba(52,199,89,0.2)] hover:bg-[rgba(52,199,89,0.2)] py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                    onClick={() => handleVerification(v.user_id, 'approve')}
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button 
                    className="flex-1 bg-[rgba(255,59,48,0.1)] text-danger border border-[rgba(255,59,48,0.2)] hover:bg-[rgba(255,59,48,0.2)] py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                    onClick={() => handleVerification(v.user_id, 'reject')}
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
`;

content = content.replace('      {activeTab === \'settings\'', verificationsRender + '\n      {activeTab === \'settings\'');

fs.writeFileSync(path, content);
console.log('Admin Verifications tab added');
