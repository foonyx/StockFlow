
import { useEffect, useState } from 'react';
import './StockMovements.css';

const API_URL = 'http://localhost:8080';

function StockMovements() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [movementFilter, setMovementFilter] = useState('ALL');

    const filteredMovements = movements.filter((movement) => {
        const matchesSearch = movement.productName
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());

        const matchesType =
            movementFilter === 'ALL' ||
            movement.type === movementFilter;

        return matchesSearch && matchesType;
    });

    useEffect(() => {
        async function loadMovements() {
            try {
                const token = sessionStorage.getItem('accessToken');

                if (!token) {
                    window.location.href = '/';
                    return;
                }

                const response = await fetch(
                    `${API_URL}/api/stock-movements`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 401) {
                    sessionStorage.removeItem('accessToken');
                    window.location.href = '/';
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to load stock movements.');
                }

                const data = await response.json();
                setMovements(data);
            } catch (err) {
                setError(err.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        }

        loadMovements();
    }, []);

    function formatDate(dateString) {
        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleString('en-MY', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    }

    return (
        <div className="movements-page">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">S</span>
                    <span>StockFlow</span>
                </div>

                <nav className="sidebar-nav">
                    <a href="/dashboard">Dashboard</a>
                    <a href="/products">Products</a>
                    <a href="/movements" className="active">
                        Stock Movements
                    </a>
                </nav>

                <button
                    className="sidebar-logout"
                    onClick={() => {
                        sessionStorage.removeItem('accessToken');
                        window.location.href = '/';
                    }}
                >
                    Sign out
                </button>
            </aside>

            <main className="movements-main">
                <header className="movements-header">
                    <div>
                        <h1>Stock Movements</h1>
                        <p>
                            Track stock received and stock issued
                            across your inventory.
                        </p>
                    </div>
                </header>

                <section className="movement-summary">
                    <div className="movement-summary-card">
                        <span>Total movements</span>
                        <strong>{movements.length}</strong>
                    </div>

                    <div className="movement-summary-card">
                        <span>Stock in records</span>
                        <strong>
                            {movements.filter(
                                (item) => item.type === 'STOCK_IN'
                            ).length}
                        </strong>
                    </div>

                    <div className="movement-summary-card">
                        <span>Stock out records</span>
                        <strong>
                            {movements.filter(
                                (item) => item.type === 'STOCK_OUT'
                            ).length}
                        </strong>
                    </div>
                </section>


                <section className="movements-table-card">
                    <div className="movements-table-heading">
                        <h2>Movement History</h2>
                        <span>Newest first</span>
                    </div>

                    <div className="movement-filters">
                        <input
                            type="text"
                            placeholder="Search by product name..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />

                        <select
                            value={movementFilter}
                            onChange={(event) => setMovementFilter(event.target.value)}
                        >
                            <option value="ALL">All movements</option>
                            <option value="STOCK_IN">Stock In</option>
                            <option value="STOCK_OUT">Stock Out</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="movement-message">
                            Loading stock movements...
                        </div>
                    ) : error ? (
                        <div className="products-error">{error}</div>
                    ) : filteredMovements.length === 0 ? (
                        <div className="movement-message">
                            No stock movements found.
                        </div>
                    ) : (
                        <div className="movements-table-scroll">
                            <table className="movements-table">
                                <thead>
                                <tr>
                                    <th>Date &amp; Time</th>
                                    <th>Product</th>
                                    <th>Movement Type</th>
                                    <th>Quantity</th>
                                    <th>Reference</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredMovements.map((movement) => (
                                    <tr key={movement.id}>
                                        <td>
                                            {formatDate(
                                                movement.createdAt
                                            )}
                                        </td>

                                        <td>
                                            <strong>
                                                {movement.productName}
                                            </strong>
                                            <span className="movement-product-id">
                                                    Product ID: {movement.productId}
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    className={
                                                        movement.type === 'STOCK_IN'
                                                            ? 'movement-badge movement-in'
                                                            : 'movement-badge movement-out'
                                                    }
                                                >
                                                    {movement.type === 'STOCK_IN'
                                                        ? 'Stock In'
                                                        : 'Stock Out'}
                                                </span>
                                        </td>

                                        <td>
                                            <strong
                                                className={
                                                    movement.type === 'STOCK_IN'
                                                        ? 'quantity-in'
                                                        : 'quantity-out'
                                                }
                                            >
                                                {movement.type === 'STOCK_IN'
                                                    ? '+'
                                                    : '-'}
                                                {movement.quantity}
                                            </strong>
                                        </td>

                                        <td>#{movement.id}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {!loading && !error && (
                    <p className="movements-count">
                        Showing {filteredMovements.length} of {movements.length} movement record(s)
                    </p>
                )}
            </main>
        </div>
    );
}

export default StockMovements;
