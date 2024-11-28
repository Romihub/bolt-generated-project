import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(express.json());
app.use(cors());

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

  // Add some sample products
  db.run(`
    INSERT INTO products (name, price, description, category, stock)
    VALUES 
      ('Laptop', 999.99, 'High-performance laptop', 'Electronics', 10),
      ('Smartphone', 699.99, 'Latest smartphone', 'Electronics', 15),
      ('Headphones', 199.99, 'Wireless headphones', 'Electronics', 20)
  `);
});

app.get('/products', (req, res) => {
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

app.listen(3002, () => console.log('Catalog service running on port 3002'));
