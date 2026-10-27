
import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Products from './Products';
import StockMovements from './StockMovements';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
          'http://localhost:8080/api/auth/login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid username or password.');
        }

        throw new Error(`Login failed (${response.status}).`);
      }

      const data = await response.json();

      if (!data.accessToken) {
        throw new Error('The server did not return an access token.');
      }

      sessionStorage.setItem('accessToken', data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(
          err.message === 'Failed to fetch'
              ? 'Cannot connect to the server. Check Spring Boot and CORS settings.'
              : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  if (currentPath === '/dashboard') {
    return <Dashboard />;
  }

  if (currentPath === '/products') {
    return <Products />;
  }

  if (currentPath === '/movements') {
    return <StockMovements />;
  }

  return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand-icon">S</div>
          <h1>StockFlow</h1>
          <p className="subtitle">Inventory Management System</p>

          <div className="welcome-text">
            <h2>Welcome back</h2>
            <p>Sign in to manage your inventory.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
            />

            <label htmlFor="password">Password</label>
            <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
            />

            {error && <p className="login-error" role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="login-footer">Authorized administrators only</p>
        </section>
      </main>
  );
}

export default App;
