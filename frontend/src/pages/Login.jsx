import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register') {
        await userApi.register(form);
        setMode('login');
        setError('');
        return;
      }
      const { data } = await userApi.login({ email: form.email, password: form.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400 }}>
      <div className="card">
        <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
        <br />
        <form onSubmit={submit}>
          {mode === 'register' && (
            <input name="name" placeholder="Full name" value={form.name} onChange={handle} required />
          )}
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handle} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required />
          {error && <div className="error">{error}</div>}
          <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
          <button type="button" className="secondary" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Create account' : 'Back to login'}
          </button>
        </form>
      </div>
    </div>
  );
}
