const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// Find the verifications block
const idx = code.indexOf(`      {activeTab === 'verifications' && (`);
if (idx !== -1) {
    let before = code.substring(0, idx);
    let after = code.substring(idx);
    
    // Remove trailing newlines and \n\n from before
    before = before.replace(/\\n\\n$/, ''); // if it literally has \n\n
    before = before.replace(/\n+$/, '\n\n'); // ensure proper spacing
    
    // Restore the block
    const block = `      {activeTab === 'verifications' && (
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
              <div key={v.user_id} className="card flex flex-col gap-3 relative overflow-hidden group">`;
              
    // Wait, let's just do a simple Regex replacement of the messed up area
}

code = fs.readFileSync('frontend/src/pages/Admin.tsx', 'utf8');

// The messed up area right now:
//       )}
//           ) : (
//             verifications.map(v => (

// Wait, let's just restore the file from git and re-apply our changes since git is available!
