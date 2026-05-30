import { useEffect, useState } from 'react';
import { notificationApi } from '../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ user_id: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = () => notificationApi.getAll().then((r) => setNotifications(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await notificationApi.create({
        user_id: parseInt(form.user_id) || user.id,
        message: form.message,
      });
      setForm({ user_id: '', message: '' });
      setSuccess('Notification created');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create notification');
    }
  };

  const markRead = async (id) => {
    await notificationApi.markAsRead(id).catch(() => {});
    load();
  };

  const remove = async (id) => {
    await notificationApi.delete(id).catch(() => {});
    load();
  };

  return (
    <div className="page">
      <h1>Notifications</h1>
      <div className="card">
        <h2 style={{ marginBottom: 16, fontSize: 16 }}>Create Notification</h2>
        <form onSubmit={create}>
          <input name="user_id" type="number" placeholder={`User ID (default: ${user.id})`} value={form.user_id} onChange={handle} />
          <input name="message" placeholder="Message" value={form.message} onChange={handle} required />
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button type="submit">Send Notification</button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>ID</th><th>User</th><th>Message</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.user_id}</td>
                <td>{n.message}</td>
                <td><span className={`badge ${n.is_read ? 'read' : 'unread'}`}>{n.is_read ? 'Read' : 'Unread'}</span></td>
                <td className="actions">
                  {!n.is_read && <button className="secondary" onClick={() => markRead(n.id)}>Mark Read</button>}
                  <button className="danger" onClick={() => remove(n.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!notifications.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>No notifications yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
