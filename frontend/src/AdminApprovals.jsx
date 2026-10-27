
import { useEffect, useState } from 'react';
import './AdminApprovals.css';

const API_URL = 'http://localhost:8080';

function AdminApprovals() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    async function loadPendingAdmins() {
        setLoading(true);
        setError('');

        try {
            const token = sessionStorage.getItem('accessToken');

            if (!token) {
                window.location.href = '/';
                return;
            }

            const response = await fetch(`${API_URL}/api/admins/pending`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('You are not authorised to view pending accounts.');
            }

            if (!response.ok) {
                throw new Error(`Failed to load accounts (${response.status}).`);
            }

            setAdmins(await response.json());
        } catch (err) {
            setError(err.message || 'Unable to load pending accounts.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPendingAdmins();
    }, []);

    async function handleDecision(admin, decision) {
        const action = decision === 'approve' ? 'approve' : 'reject';

        if (!window.confirm(`Are you sure you want to ${action} ${admin.username}?`)) {
            return;
        }

        setProcessingId(admin.id);
        setError('');
        setMessage('');

        try {
            const token = sessionStorage.getItem('accessToken');

            const response = await fetch(
                `${API_URL}/api/admins/${admin.id}/${decision}`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(responseText || `Unable to ${action} account.`);
            }

            setAdmins((currentAdmins) =>
                currentAdmins.filter((item) => item.id !== admin.id)
            );

            setMessage(`${admin.username} was ${decision === 'approve' ? 'approved' : 'rejected'}.`);
        } catch (err) {
            setError(err.message || `Unable to ${action} account.`);
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <main className="approvals-page">
            <header className="approvals-header">
                <div>
                    <p className="approvals-eyebrow">USER MANAGEMENT</p>
                    <h1>Admin Approvals</h1>
                    <p>Review new administrator account requests.</p>
                </div>

                <button
                    className="approvals-refresh"
                    onClick={loadPendingAdmins}
                    disabled={loading}
                >
                    Refresh
                </button>
            </header>

            {error && <p className="approvals-error" role="alert">{error}</p>}
            {message && <p className="approvals-success" role="status">{message}</p>}

            <section className="approvals-panel">
                <h2>Pending Requests ({admins.length})</h2>

                {loading ? (
                    <p className="approvals-empty">Loading accounts...</p>
                ) : admins.length === 0 ? (
                    <p className="approvals-empty">There are no pending account requests.</p>
                ) : (
                    <div className="approvals-table-wrapper">
                        <table className="approvals-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {admins.map((admin) => (
                                <tr key={admin.id}>
                                    <td>{admin.id}</td>
                                    <td>{admin.username}</td>
                                    <td>
                                        <span className="pending-badge">Pending</span>
                                    </td>
                                    <td>
                                        <div className="approvals-actions">
                                            <button
                                                className="approve-button"
                                                onClick={() => handleDecision(admin, 'approve')}
                                                disabled={processingId === admin.id}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="reject-button"
                                                onClick={() => handleDecision(admin, 'reject')}
                                                disabled={processingId === admin.id}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <a className="approvals-back" href="/dashboard">← Back to Dashboard</a>
        </main>
    );
}

export default AdminApprovals;
