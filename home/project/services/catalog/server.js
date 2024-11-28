import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      description TEXT,
      image_url TEXT,
      category TEXT,
      stock INTEGER
    )
  `);

  // Add sample products
  db.run(`
    INSERT INTO products (name, price, description, category, stock)
    VALUES 
      ('Laptop', 999.99, 'High-performance laptop', 'Electronics', 10),
      ('Smartphone', 699.99, 'Latest smartphone', 'Electronics', 15),
      ('Headphones', 199.99, 'Wireless headphones', 'Electronics', 20)
  `);
});

// Add a root route that returns HTML
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; connect-src 'self' *;");
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Product Catalog API</title>
      </head>
      <body>
        <h1>Product Catalog API</h1>
        <p>Available endpoints:</p>
        <ul>
          <li>GET /products - List all products</li>
          <li>GET /products/:id - Get a specific product</li>
        </ul>
      </body>
    </html>
  `);
});

// Products endpoint
app.get('/products', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { category, minPrice, maxPrice, search } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (minPrice) {
    query += ' AND price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(maxPrice);
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  db.all(query, params, (err, products) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(products);
  });
});

// Get single product
app.get('/products/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(3002, () => console.log('Catalog service running on port 3002'));
