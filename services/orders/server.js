import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';

const app = express();
const db = new Database('orders.db');

app.use(express.json());
app.use(cors());

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    status TEXT,
    total REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL
  );
`);

app.post('/orders', (req, res) => {
  const { userId, items, total } = req.body;
  
  db.transaction(() => {
    const orderResult = db.prepare(
      'INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)'
    ).run(userId, 'pending', total);

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
    );

    items.forEach(item => {
      insertItem.run(orderId, item.productId, item.quantity, item.price);
    });

    return orderId;
  })();

  res.status(201).json({ message: 'Order created' });
});

app.get('/orders/:userId', (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, oi.product_id, oi.quantity, oi.price
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
  `).all(req.params.userId);

  const formattedOrders = orders.reduce((acc, row) => {
    if (!acc[row.id]) {
      acc[row.id] = {
        id: row.id,
        status: row.status,
        total: row.total,
        created_at: row.created_at,
        items: []
      };
    }
    acc[row.id].items.push({
      product_id: row.product_id,
      quantity: row.quantity,
      price: row.price
    });
    return acc;
  }, {});

  res.json(Object.values(formattedOrders));
});

app.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

app.listen(3004, () => console.log('Orders service running on port 3004'));
