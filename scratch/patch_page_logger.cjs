const fs = require('fs');

let code = fs.readFileSync('frontend/src/App.tsx', 'utf8');

// Add PageLogger component
const pageLoggerCode = `
const PageLogger = ({ initData }: { initData: string }) => {
  const location = useLocation();
  useEffect(() => {
    if (initData && location.pathname !== '/') { // Landing logs itself
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ action: 'PAGE_VIEW', details: { path: location.pathname } })
      }).catch(() => {});
    }
  }, [location.pathname, initData]);
  return null;
};
`;

if (!code.includes('PageLogger')) {
  code = code.replace(
    "function App() {",
    pageLoggerCode + "\nfunction App() {"
  );
  code = code.replace(
    "<BrowserRouter>",
    "<BrowserRouter>\n      <PageLogger initData={initData} />"
  );
}

fs.writeFileSync('frontend/src/App.tsx', code);
console.log('Patched App.tsx with PageLogger');
