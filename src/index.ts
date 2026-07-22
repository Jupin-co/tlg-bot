import { Hono } from 'hono';
import { initBot, Env } from './bot';
import api from './api';

const app = new Hono<{ Bindings: Env }>();

app.route('/api', api);

let isBotInitialized = false;

app.post('/bot', async (c) => {
  const bot = initBot(c.env);
  try {
    if (!isBotInitialized) {
      await bot.init();
      isBotInitialized = true;
    }
    const update = await c.req.json();
    c.executionCtx.waitUntil(bot.handleUpdate(update));
    return c.text('OK');
  } catch (err) {
    console.error(err);
    return c.text('Error', 500);
  }
});

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Telegram E-Commerce Mini App</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--tg-theme-bg-color, #ffffff);
      color: var(--tg-theme-text-color, #000000);
      margin: 0;
      padding: 16px;
    }
    .product {
      border: 1px solid var(--tg-theme-hint-color, #ccc);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      background-color: var(--tg-theme-secondary-bg-color, #f0f0f0);
    }
    h1 { font-size: 24px; }
  </style>
</head>
<body>
  <h1>Product Catalog</h1>
  <div id="catalog">Loading...</div>

  <script>
    const tg = window.Telegram.WebApp;
    tg.expand();

    async function loadCatalog() {
      try {
        const res = await fetch('/api/catalog', {
          headers: {
            'x-telegram-init-data': tg.initData
          }
        });
        
        if (!res.ok) throw new Error("API Error");
        
        const data = await res.json();
        const catalogDiv = document.getElementById('catalog');
        
        if (data.products && data.products.length > 0) {
          catalogDiv.innerHTML = data.products.map(p => \`
            <div class="product">
              <h3>\${p.name}</h3>
              <p>Price: $\${p.base_price}</p>
            </div>
          \`).join('');
        } else {
          catalogDiv.innerHTML = "No products available.";
        }
      } catch (e) {
        document.getElementById('catalog').innerText = "Error loading catalog. Are you testing outside of Telegram?";
      }
    }

    loadCatalog();
  </script>
</body>
</html>
`;

app.get('/', (c) => {
  return c.html(htmlContent);
});

export default app;
