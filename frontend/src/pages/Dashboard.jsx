import { useEffect, useState } from 'react';
import { productApi, orderApi, notificationApi } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, notifications: 0, unread: 0 });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([productApi.getAll(), orderApi.getAll(), notificationApi.getAll()])
      .then(([p, o, n]) => {
        setStats({
          products: p.data.length,
          orders: o.data.length,
          notifications: n.data.length,
          unread: n.data.filter((x) => !x.is_read).length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <h1>Welcome back, {user.name} </h1>
      <div className="grid">
        <div className="stat-card">
          <div className="number">{stats.products}</div>
          <div className="label">Products</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.orders}</div>
          <div className="label">Orders</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.notifications}</div>
          <div className="label">Notifications</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.unread}</div>
          <div className="label">Unread</div>
        </div>
      </div>
    </div>
  );
}
