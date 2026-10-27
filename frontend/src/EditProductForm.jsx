
import { useState } from 'react';
import './ProductForm.css';

const API_URL = 'http://localhost:8080';

function EditProductForm({ product, onClose, onUpdated }) {
    const [form, setForm] = useState({
        sku: product.sku ?? '',
        name: product.name ?? '',
        description: product.description ?? '',
        price: String(product.price ?? ''),
        lowStockThreshold: String(product.lowStockThreshold ?? 5),
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const price = Number(form.price);
        const threshold = Number(form.lowStockThreshold);

        if (!Number.isFinite(price) || price <= 0) {
            setError('Price must be greater than zero.');
            return;
        }

        if (!Number.isInteger(threshold) || threshold < 0) {
            setError('Low-stock threshold must be a whole number of zero or more.');
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
                `${API_URL}/api/products/${product.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        sku: form.sku.trim(),
                        name: form.name.trim(),
                        description: form.description.trim(),
                        price,
                        lowStockThreshold: threshold,
                    }),
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
                    message || `Failed to update product (${response.status}).`
                );
            }

            await onUpdated();
            onClose();
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

    return (
        <div className="product-modal-backdrop">
            <section
                className="product-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-product-title"
            >
                <header className="product-modal-header">
                    <div>
                        <h2 id="edit-product-title">Edit Product</h2>
                        <p>Update product details without changing stock quantity.</p>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close form"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="edit-product-sku">SKU</label>
                    <input
                        id="edit-product-sku"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        maxLength={100}
                        required
                    />

                    <label htmlFor="edit-product-name">Product name</label>
                    <input
                        id="edit-product-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        maxLength={150}
                        required
                    />

                    <label htmlFor="edit-product-description">Description</label>
                    <textarea
                        id="edit-product-description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        required
                    />

                    <div className="product-form-row">
                        <div>
                            <label htmlFor="edit-product-price">Price (RM)</label>
                            <input
                                id="edit-product-price"
                                name="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="edit-product-threshold">
                                Low-stock threshold
                            </label>
                            <input
                                id="edit-product-threshold"
                                name="lowStockThreshold"
                                type="number"
                                min="0"
                                step="1"
                                value={form.lowStockThreshold}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <p className="product-form-note">
                        Current quantity: {product.quantity}. Use Stock In or Stock Out
                        to change inventory levels.
                    </p>

                    {error && (
                        <p className="product-form-error" role="alert">{error}</p>
                    )}

                    <footer className="product-form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default EditProductForm;
