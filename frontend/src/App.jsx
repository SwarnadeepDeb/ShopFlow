import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';

function Nav() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  return (
    <nav>
      <span className="brand">ShopFlow</span>
      <NavLink to="/">Dashboard</NavLink>
      <NavLink to="/products">Products</NavLink>
      <NavLink to="/orders">Orders</NavLink>
      <NavLink to="/notifications">Notifications</NavLink>
      {user
        ? <button onClick={logout} className="secondary" style={{ marginLeft: 'auto', padding: '6px 14px' }}>Logout ({user.name})</button>
        : <NavLink to="/login" style={{ marginLeft: 'auto' }}>Login</NavLink>
      }
    </nav>
  );
}

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
