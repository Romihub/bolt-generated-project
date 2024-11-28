import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new sqlite3.Database(':memory:');

app.use(express.json());
app.use(cors());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'customer'
    )
  `);
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
    if (err) {
      res.status(400).json({ error: 'User already exists' });
    } else {
      res.status(201).json({ message: 'User created' });
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        'secret',
        { expiresIn: '1h' }
      );
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.listen(3001, () => console.log('Auth service running on port 3001'));
