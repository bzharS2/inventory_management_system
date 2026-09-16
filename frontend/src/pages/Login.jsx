import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    const destination = location.state?.from?.pathname || '/products';
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || '/products', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '5rem auto', padding: '2rem', borderRadius: 12, background: '#f6f7fb' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Inventory Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: 8 }}>Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c7ced8' }}
            autoComplete="username"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: 8 }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c7ced8' }}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', color: '#b42318', background: '#fef3f2', padding: 10, borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.9rem', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
