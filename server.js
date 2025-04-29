require('dotenv').config();
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const path = require('path');

const app = express();
const {
  SHOPIFY_STORE,
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  PORT
} = process.env;

Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: ['read_products','write_products','read_draft_orders','write_draft_orders','read_customers','write_customers','read_orders'],
  HOST_NAME: SHOPIFY_STORE,
  HOST_SCHEME: 'https',
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Serve static assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// Sample API endpoint
app.get('/api/products', async (_req, res) => {
  const client = new Shopify.Clients.Rest(
    SHOPIFY_STORE,
    SHOPIFY_ADMIN_API_ACCESS_TOKEN
  );
  const products = await client.get({ path: 'products', query: { limit: 5 } });
  res.json(products.body.products);
});

// Fallback to index.html for React UI
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`> Server listening on http://localhost:${PORT}`);
});