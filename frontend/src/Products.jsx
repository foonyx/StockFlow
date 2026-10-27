
import { useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import EditProductForm from './EditProductForm';
import StockMovementForm from './StockMovementForm';
import './Products.css';

const API_URL = 'http://localhost:8080';

function Products() {
    const [stockMovementProduct, setStockMovementProduct] = useState(null);
    const [stockMovementType, setStockMovementType] = useState('stock-in');
    const [deletingId, setDeletingId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [direction, setDirection] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProducts();
    }, [search, lowStockOnly, sortBy, direction]);

    async function loadProducts() {
        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            window.location.href = '/';
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams();

            if (search.trim()) params.set('search', search.trim());
            if (lowStockOnly) params.set('lowStockOnly', 'true');

            params.set('sortBy', sortBy);
            params.set('direction', direction);

            const response = await fetch(
                `${API_URL}/api/products?${params.toString()}`,
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
                throw new Error(`Failed to load products (${response.status}).`);
            }

            const data = await response.json();
            setProducts(data);
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

    function handleLogout() {
        sessionStorage.removeItem('accessToken');
        window.location.href = '/';
    }

    async function handleDelete(product) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}" (${product.sku})?`
        );

        if (!confirmed) return;

        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            window.location.href = '/';
            return;
        }

        setDeletingId(product.id);
        setError('');

        try {
            const response = await fetch(
                `${API_URL}/api/products/${product.id}`,
                {
                    method: 'DELETE',
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
                const message = await response.text();
                throw new Error(
                    message || `Failed to delete product (${response.status}).`
                );
            }

            await loadProducts();
        } catch (err) {
            setError(
                err.message === 'Failed to fetch'
                    ? 'Cannot connect to the backend. Check that Spring Boot is running.'
                    : err.message
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="products-page">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="sidebar-logo">S</span>
                    <span>StockFlow</span>
                </div>

                <nav className="sidebar-nav">
                    <a className="nav-link" href="/dashboard">Dashboard</a>
                    <a className="nav-link active" href="/products">Products</a>
                    <a className="nav-link" href="/movements">Stock Movements</a>
                </nav>

                <button className="logout-button" onClick={handleLogout}>
                    Sign out
                </button>
            </aside>

            <main className="products-main">
                <header className="products-header">
                    <div>
                        <h1>Products</h1>
                        <p>Manage and monitor your inventory.</p>
                    </div>
                    <button
                        className="primary-button"
                        onClick={() => setShowAddForm(true)}
                    >
                        + Add Product
                    </button>
                </header>

                <section className="products-toolbar">
                    <input
                        type="search"
                        placeholder="Search by product name or SKU..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Search products"
                    />

                    <label className="low-stock-filter">
                        <input
                            type="checkbox"
                            checked={lowStockOnly}
                            onChange={(event) => setLowStockOnly(event.target.checked)}
                        />
                        Low stock only
                    </label>

                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        aria-label="Sort products by"
                    >
                        <option value="name">Sort by name</option>
                        <option value="sku">Sort by SKU</option>
                        <option value="price">Sort by price</option>
                        <option value="quantity">Sort by quantity</option>
                    </select>

                    <select
                        value={direction}
                        onChange={(event) => setDirection(event.target.value)}
                        aria-label="Sort direction"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </section>

                {error && <p className="products-error" role="alert">{error}</p>}

                <section className="products-table-card">
                    {loading ? (
                        <p className="table-message">Loading products...</p>
                    ) : products.length === 0 ? (
                        <p className="table-message">No products found.</p>
                    ) : (
                        <div className="table-scroll">
                            <table className="products-table">
                                <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Low Stock Threshold</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <strong>{product.name}</strong>
                                            <span className="product-description">
                          {product.description}
                        </span>
                                        </td>
                                        <td>{product.sku}</td>
                                        <td>RM {Number(product.price).toFixed(2)}</td>
                                        <td>{product.quantity}</td>
                                        <td>{product.lowStockThreshold}</td>
                                        <td>
                                            <span
                                                className={`stock-status ${
                                                    product.lowStock ? 'status-low' : 'status-good'
                                                }`}
                                            >
                                              {product.lowStock ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>

                                        <td className="product-actions">
                                            <button
                                                type="button"
                                                className="edit-product-button"
                                                onClick={() => setEditingProduct(product)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-product-button"
                                                onClick={() => handleDelete(product)}
                                                disabled={deletingId === product.id}
                                            >
                                                {deletingId === product.id ? 'Deleting...' : 'Delete'}
                                            </button>

                                            <button
                                                type="button"
                                                className="stock-in-button"
                                                onClick={() => {
                                                    setStockMovementProduct(product);
                                                    setStockMovementType('stock-in');
                                                }}
                                            >
                                                Stock In
                                            </button>

                                            <button
                                                type="button"
                                                className="stock-out-button"
                                                onClick={() => {
                                                    setStockMovementProduct(product);
                                                    setStockMovementType('stock-out');
                                                }}
                                            >
                                                Stock Out
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <p className="products-count">
                    {loading ? 'Loading...' : `${products.length} product(s) shown`}
                </p>
            </main>

            {showAddForm && (
                <ProductForm
                    onClose={() => setShowAddForm(false)}
                    onCreated={loadProducts}
                />
            )}

            {editingProduct && (
                <EditProductForm
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onUpdated={loadProducts}
                />
            )}

            {stockMovementProduct && (
                <StockMovementForm
                    product={stockMovementProduct}
                    movementType={stockMovementType}
                    onClose={() => setStockMovementProduct(null)}
                    onSuccess={loadProducts}
                />
            )}
        </div>
    );
}

export default Products;
