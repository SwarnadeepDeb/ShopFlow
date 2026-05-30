import { useEffect, useState } from 'react';
import { orderApi } from '../api';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ user_id: '', product_id: '', quantity: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = () => orderApi.getAll().then((r) => setOrders(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await orderApi.create({
        user_id: parseInt(form.user_id) || user.id,
        product_id: parseInt(form.product_id),
        quantity: parseInt(form.quantity),
      });
      setForm({ user_id: '', product_id: '', quantity: '' });
      setSuccess('Order placed');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    }
  };

  const updateStatus = async (id, status) => {
    await orderApi.update(id, { status }).catch(() => {});
    load();
  };

  const remove = async (id) => {
    if (!confirm('Cancel this order?')) return;
    await orderApi.delete(id).catch(() => {});
    load();
  };

  return (
    <div className="page">
      <h1>Orders</h1>
      <div className="card">
        <h2 style={{ marginBottom: 16, fontSize: 16 }}>Place Order</h2>
        <form onSubmit={create}>
          <input name="user_id" type="number" placeholder={`User ID (default: ${user.id})`} value={form.user_id} onChange={handle} />
          <input name="product_id" type="number" placeholder="Product ID" value={form.product_id} onChange={handle} required />
          <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handle} required min="1" />
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button type="submit">Place Order</button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>ID</th><th>User</th><th>Product</th><th>Qty</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.user_id}</td>
                <td>{o.product_id}</td>
                <td>{o.quantity}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button className="danger" onClick={() => remove(o.id)}>Cancel</button>
                </td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999' }}>No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
