
import { useState } from 'react';
import './ChangePassword.css';

const API_URL = 'http://localhost:8080';

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must differ from your current password.');
            return;
        }

        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            window.location.href = '/';
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/change-password`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                    }),
                }
            );

            const responseText = await response.text();

            if (response.status === 401) {
                sessionStorage.removeItem('accessToken');
                window.location.href = '/';
                return;
            }

            if (!response.ok) {
                throw new Error(responseText || 'Unable to change password.');
            }

            setMessage('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="change-password-page">
            <section className="change-password-card">
                <a href="/dashboard" className="change-password-back">
                    &larr; Back to Dashboard
                </a>

                <h1>Change Password</h1>
                <p className="change-password-description">
                    Update your account password to keep your account secure.
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                        id="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        required
                    />

                    <label htmlFor="newPassword">New Password</label>
                    <input
                        id="newPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        required
                    />

                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                    />

                    {error && (
                        <p className="change-password-error" role="alert">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="change-password-success" role="status">
                            {message}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default ChangePassword;
