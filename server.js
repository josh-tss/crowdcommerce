require('dotenv').config();
const fs = require('fs');
const express = require('express');
const path = require('path');
// Use default export to ensure Context is available
const Shopify = require('@shopify/shopify-api').default;

// Load environment variables
const {
  SHOPIFY_STORE,
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  PORT = 3000,
} = process.env;

// Initialize Shopify API context
Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: [
    'read_products',
    'write_products',
    'read_draft_orders',
    'write_draft_orders',
    'read_customers',
    'write_customers',
    'read_orders',
  ],
  HOST_NAME: SHOPIFY_STORE,
  HOST_SCHEME: 'https',
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Prepare the HTML template with App Bridge placeholders
const htmlPath = path.join(__dirname, 'public', 'index.html');
let htmlTemplate = fs.readFileSync(htmlPath, 'utf8')
  .replace(/{{SHOPIFY_API_KEY}}/g, SHOPIFY_API_KEY)
  .replace(/{{SHOPIFY_STORE}}/g, SHOPIFY_STORE);

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static assets from /static
app.use('/static', express.static(path.join(__dirname, 'public')));

// Sample API endpoint: fetch first 5 products
app.get('/api/products', async (_req, res) => {
  try {
    const client = new Shopify.Clients.Rest(
      SHOPIFY_STORE,
      SHOPIFY_ADMIN_API_ACCESS_TOKEN
    );
    const productsRes = await client.get({ path: 'products', query: { limit: 5 } });
    res.json(productsRes.body.products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Fallback: serve the embedded app HTML
app.get('/*', (_req, res) => {
  res.status(200).send(htmlTemplate);
});

// Start the server
app.listen(PORT, () => {
  console.log(`> CrowdCommerce app is running on http://localhost:${PORT}`);
});
