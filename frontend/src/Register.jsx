
import { useState } from 'react';
import './Register.css';

const API_URL = 'http://localhost:8080';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const text = await response.text();

            if (!response.ok) {
                throw new Error(text || `Registration failed (${response.status}).`);
            }

            setMessage(
                'Registration successful! Your account is pending admin approval.'
            );
            setUsername('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Unable to register.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="register-page">
            <section className="register-card">
                <div className="register-brand">
                    <span className="brand-icon">S</span>
                    <h1>StockFlow</h1>
                </div>

                <h2>Create an admin account</h2>
                <p className="register-description">
                    Register your account and wait for approval before accessing inventory.
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="register-username">Username</label>
                    <input
                        id="register-username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        minLength={3}
                        maxLength={100}
                        autoComplete="username"
                        required
                    />

                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                        required
                    />

                    <label htmlFor="register-confirm-password">
                        Confirm Password
                    </label>
                    <input
                        id="register-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    {error && <p className="register-error" role="alert">{error}</p>}
                    {message && <p className="register-success" role="status">{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="register-footer">
                    Already have an account? <a href="/">Sign in</a>
                </p>
            </section>
        </main>
    );
}

export default Register;
