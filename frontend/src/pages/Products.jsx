import { useEffect, useState } from 'react';
import { productApi } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => productApi.getAll().then((r) => setProducts(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await productApi.create({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 });
      setForm({ name: '', description: '', price: '', stock: '' });
      setSuccess('Product created');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    await productApi.delete(id).catch(() => {});
    load();
  };

  return (
    <div className="page">
      <h1>Products</h1>
      <div className="card">
        <h2 style={{ marginBottom: 16, fontSize: 16 }}>Add Product</h2>
        <form onSubmit={create}>
          <input name="name" placeholder="Product name" value={form.name} onChange={handle} required />
          <input name="description" placeholder="Description" value={form.description} onChange={handle} />
          <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handle} required />
          <input name="stock" type="number" placeholder="Stock (default 0)" value={form.stock} onChange={handle} />
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button type="submit">Add Product</button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Stock</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="danger" onClick={() => remove(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!products.length && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999' }}>No products yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
