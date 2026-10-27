
import { useEffect, useState } from 'react';
import './Dashboard.css';

const API_URL = 'http://localhost:8080';

function Dashboard() {
    const [summary, setSummary] = useState({
        totalProducts: 0,
        lowStockProducts: 0,
        totalUnitsInStock: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadDashboard() {
            const token = sessionStorage.getItem('accessToken');

            if (!token) {
                window.location.href = '/';
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/dashboard/summary`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 401) {
                    sessionStorage.removeItem('accessToken');
                    window.location.href = '/';
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Unable to load dashboard (${response.status}).`);
                }

                const data = await response.json();
                setSummary(data);
            } catch (err) {
                setError(
                    err.message === 'Failed to fetch'
                        ? 'Cannot connect to the backend. Check that Spring Boot is running.'
                        : err.message
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    function handleLogout() {
        sessionStorage.removeItem('accessToken');
        window.location.href = '/';
    }

    return (
        <div className="dashboard-page">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="sidebar-logo">S</span>
                    <span>StockFlow</span>
                </div>

                <nav className="sidebar-nav">
                    <a className="nav-link active" href="/dashboard">
                        Dashboard
                    </a>
                    <a className="nav-link" href="/products">
                        Products
                    </a>
                    <a className="nav-link" href="/movements">
                        Stock Movements
                    </a>
                </nav>

                <nav className="sidebar-nav">
                    {/* Existing Dashboard, Products and Stock Movements links */}
                </nav>

                <div className="sidebar-section-title">
                    ACCOUNT & SETTINGS
                </div>

                <nav className="sidebar-nav">
                    <a className="nav-link" href="/admin-approvals">
                        Admin Approvals
                    </a>
                    <a className="nav-link" href="/change-password">
                        Change Password
                    </a>
                </nav>

                <div className="sidebar-logout-section">
                    <button className="logout-button" onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Here's an overview of your inventory.</p>
                    </div>
                    <span className="admin-badge">Administrator</span>
                </header>

                {loading ? (
                    <p className="dashboard-message">Loading dashboard...</p>
                ) : error ? (
                    <p className="dashboard-error" role="alert">{error}</p>
                ) : (
                    <>
                        <section className="summary-grid">
                            <article className="summary-card">
                                <span className="summary-label">Total Products</span>
                                <strong>{summary.totalProducts}</strong>
                                <span className="summary-description">
                  Products in your inventory
                </span>
                            </article>

                            <article className="summary-card low-stock-card">
                                <span className="summary-label">Low Stock Products</span>
                                <strong>{summary.lowStockProducts}</strong>
                                <span className="summary-description">
                  Products needing attention
                </span>
                            </article>

                            <article className="summary-card">
                                <span className="summary-label">Total Units in Stock</span>
                                <strong>{summary.totalUnitsInStock}</strong>
                                <span className="summary-description">
                  Units across all products
                </span>
                            </article>
                        </section>

                        <section className="dashboard-welcome">
                            <h2>Welcome to StockFlow</h2>
                            <p>
                                Your inventory summary is up to date. Use the sidebar to
                                manage products and track stock movements.
                            </p>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
