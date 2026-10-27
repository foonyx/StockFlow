
import { useEffect, useState } from 'react';
import './StockMovements.css';

const API_URL = 'http://localhost:8080';
const ITEMS_PER_PAGE = 10;

function StockMovements() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [movementFilter, setMovementFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter movement records by product name and movement type.
    const filteredMovements = movements.filter((movement) => {
        const matchesSearch = (movement.productName || '')
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());

        const matchesType =
            movementFilter === 'ALL' ||
            movement.type === movementFilter;

        return matchesSearch && matchesType;
    });

    // Calculate pagination based on the filtered records.
    const totalPages = Math.ceil(
        filteredMovements.length / ITEMS_PER_PAGE
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const paginatedMovements = filteredMovements.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // Load movement history from the backend.
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
                    throw new Error(
                        `Failed to load stock movements (${response.status}).`
                    );
                }

                const data = await response.json();

                // Display the newest movements first.
                data.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );

                setMovements(data);
            } catch (err) {
                setError(
                    err.message === 'Failed to fetch'
                        ? 'Cannot connect to the backend. Check that Spring Boot is running.'
                        : err.message || 'Something went wrong.'
                );
            } finally {
                setLoading(false);
            }
        }

        loadMovements();
    }, []);

    // Return to page 1 whenever the search or filter changes.
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, movementFilter]);

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

    function handleLogout() {
        sessionStorage.removeItem('accessToken');
        window.location.href = '/';
    }

    return (
        <div className="movements-page">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="sidebar-logo">S</span>
                    <span>StockFlow</span>
                </div>

                <nav className="sidebar-nav">
                    <a className="nav-link" href="/dashboard">
                        Dashboard
                    </a>
                    <a className="nav-link" href="/products">
                        Products
                    </a>
                    <a className="nav-link active" href="/movements">
                        Stock Movements
                    </a>
                </nav>

                <div className="sidebar-section-title">
                    ACCOUNT &amp; SETTINGS
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
                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                </div>
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
                            {
                                movements.filter(
                                    (item) => item.type === 'STOCK_IN'
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="movement-summary-card">
                        <span>Stock out records</span>
                        <strong>
                            {
                                movements.filter(
                                    (item) => item.type === 'STOCK_OUT'
                                ).length
                            }
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
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            aria-label="Search by product name"
                        />

                        <select
                            value={movementFilter}
                            onChange={(event) =>
                                setMovementFilter(event.target.value)
                            }
                            aria-label="Filter movement type"
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
                        <div className="products-error" role="alert">
                            {error}
                        </div>
                    ) : filteredMovements.length === 0 ? (
                        <div className="movement-message">
                            No stock movements found.
                        </div>
                    ) : (
                        <>
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
                                    {paginatedMovements.map((movement) => (
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

                            <div className="movements-pagination">
                                <p className="movements-count">
                                    Showing {startIndex + 1}–
                                    {Math.min(
                                        startIndex + ITEMS_PER_PAGE,
                                        filteredMovements.length
                                    )}{' '}
                                    of {filteredMovements.length} record(s)
                                </p>

                                <div className="pagination-buttons">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((page) => page - 1)
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>

                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((page) => page + 1)
                                        }
                                        disabled={currentPage >= totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export default StockMovements;
