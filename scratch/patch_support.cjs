const fs = require('fs');

// --- Patch SupportAdmin.tsx ---
let adminCode = fs.readFileSync('frontend/src/pages/SupportAdmin.tsx', 'utf8');

adminCode = adminCode.replace(
  'useEffect(() => {\n    if (initData) fetchTickets();\n  }, [initData]);',
  `useEffect(() => {
    if (initData) {
      fetchTickets();
      const interval = setInterval(() => {
        fetchTickets();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [initData]);`
);
// Also in case it's without 'if (initData)'
adminCode = adminCode.replace(
  'useEffect(() => {\n    fetchTickets();\n  }, [initData]);',
  `useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => {
      fetchTickets();
    }, 3000);
    return () => clearInterval(interval);
  }, [initData]);`
);

adminCode = adminCode.replace(
  /const viewTicket = \(ticket: any\) => \{\s*setActiveTicket\(ticket\);\s*fetch\(`\/admin\/tickets\/\$\{ticket\.id\}`[^]*?\}\);\s*\};\s*/,
  `const viewTicket = (ticket: any) => {
    setActiveTicket(ticket);
    fetch(\`/admin/tickets/\${ticket.id}\`, {
      headers: { 'x-telegram-init-data': initData }
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
      });
  };

  useEffect(() => {
    if (!activeTicket) return;
    const interval = setInterval(() => {
      fetch(\`/admin/tickets/\${activeTicket.id}\`, {
        headers: { 'x-telegram-init-data': initData }
      })
        .then(res => res.json())
        .then(data => {
          if (data.messages) setMessages(data.messages);
        });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTicket, initData]);\n\n`
);

adminCode = adminCode.replace(
  /const isUser = m\.sender_id === activeTicket\.user_id;[^]*?<\/div>\s*\);\s*\}\)/,
  `const isUser = m.sender_id === activeTicket.user_id;
            return (
              <div key={m.id} className={\`relative group p-3 rounded-xl max-w-[85%] \${!isUser ? 'bg-[var(--button-color)] text-[var(--button-text-color)] self-end' : 'bg-[var(--secondary-bg-color)] text-[var(--text-color)] self-start'}\`}>
                <div className="text-xs opacity-70 mb-1 font-bold">{isUser ? activeTicket.first_name : m.sender_name + ' (Support)'}</div>
                <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                <div className={\`absolute top-1/2 -translate-y-1/2 \${!isUser ? 'right-full mr-2' : 'left-full ml-2'} text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-10\`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })`
);

fs.writeFileSync('frontend/src/pages/SupportAdmin.tsx', adminCode);
console.log('Fixed SupportAdmin.tsx');

// --- Patch Support.tsx ---
let supportCode = fs.readFileSync('frontend/src/pages/Support.tsx', 'utf8');

supportCode = supportCode.replace(
  'useEffect(() => {\n    if (initData) {\n      fetchTickets();\n      fetchPayments();\n    }\n  }, [initData]);',
  `useEffect(() => {
    if (initData) {
      fetchTickets();
      fetchPayments();
      const interval = setInterval(() => {
        fetchTickets();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [initData]);`
);

supportCode = supportCode.replace(
  /const viewTicket = \(ticket: any\) => \{\s*setActiveTicket\(ticket\);\s*fetch\(`\/api\/tickets\/\$\{ticket\.id\}`[^]*?\}\);\s*\};\s*/,
  `const viewTicket = (ticket: any) => {
    setActiveTicket(ticket);
    fetch(\`/tickets/\${ticket.id}\`, {
      headers: { 'x-telegram-init-data': initData }
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
      });
  };

  useEffect(() => {
    if (!activeTicket) return;
    const interval = setInterval(() => {
      fetch(\`/tickets/\${activeTicket.id}\`, {
        headers: { 'x-telegram-init-data': initData }
      })
        .then(res => res.json())
        .then(data => {
          if (data.messages) setMessages(data.messages);
        });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTicket, initData]);\n\n`
);

supportCode = supportCode.replace(
  /fetch\('\/api\/tickets'/g,
  `fetch('/tickets'`
);
supportCode = supportCode.replace(
  /fetch\(`\/api\/tickets/g,
  `fetch(\`/tickets`
);

supportCode = supportCode.replace(
  /return \(\s*<div key=\{m\.id\} className=\{\`p-3 rounded-xl max-w-\[85%\] \$\{m\.sender_name \? 'bg-\[var\(--secondary-bg-color\)\] self-start' : 'bg-\[var\(--primary-color\)\] text-white self-end'\}\`\}>\s*\{m\.sender_name && <div className="text-xs opacity-70 mb-1 font-bold">\{m\.sender_name\} \(Support\)<\/div>\}\s*<div className="text-sm whitespace-pre-wrap">\{m\.message\}<\/div>\s*<div className="text-\[10px\] opacity-60 mt-1 text-right">\{new Date\(m\.created_at\)\.toLocaleString\(\)\}<\/div>\s*<\/div>\s*\);/g,
  `const isMe = m.sender_id === user?.id;
            return (
              <div key={m.id} className={\`relative group p-3 rounded-xl max-w-[85%] \${isMe ? 'bg-[var(--button-color)] text-[var(--button-text-color)] self-end' : 'bg-[var(--secondary-bg-color)] text-[var(--text-color)] self-start'}\`}>
                {!isMe && m.sender_name && <div className="text-xs opacity-70 mb-1 font-bold">{m.sender_name} (Support)</div>}
                <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                <div className={\`absolute top-1/2 -translate-y-1/2 \${isMe ? 'right-full mr-2' : 'left-full ml-2'} text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-10\`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );`
);

fs.writeFileSync('frontend/src/pages/Support.tsx', supportCode);
console.log('Fixed Support.tsx');
