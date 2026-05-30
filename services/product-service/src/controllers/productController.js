const pool = require('../config/db');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const { rows } = await pool.query(
      'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || '', price, stock || 0]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProducts = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProduct = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const { rows } = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, description, price, stock, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createProduct, getProducts, getProduct, updateProduct, deleteProduct };
