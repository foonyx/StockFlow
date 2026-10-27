
import { useState } from 'react';
import './ProductForm.css';

const API_URL = 'http://localhost:8080';

function ProductForm({ onClose, onCreated }) {
    const [form, setForm] = useState({
        sku: '',
        name: '',
        description: '',
        price: '',
        lowStockThreshold: '5',
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
        setLoading(true);

        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            window.location.href = '/';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sku: form.sku.trim(),
                    name: form.name.trim(),
                    description: form.description.trim(),
                    price: Number(form.price),
                    lowStockThreshold: Number(form.lowStockThreshold),
                }),
            });

            if (response.status === 401) {
                sessionStorage.removeItem('accessToken');
                window.location.href = '/';
                return;
            }

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || `Failed to create product (${response.status}).`);
            }

            onCreated();
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
                aria-labelledby="product-form-title"
            >
                <header className="product-modal-header">
                    <div>
                        <h2 id="product-form-title">Add Product</h2>
                        <p>Enter the details of your new inventory item.</p>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close form"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="product-sku">SKU</label>
                    <input
                        id="product-sku"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        placeholder="e.g. KB-001"
                        maxLength={100}
                        required
                    />

                    <label htmlFor="product-name">Product name</label>
                    <input
                        id="product-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        maxLength={150}
                        required
                    />

                    <label htmlFor="product-description">Description</label>
                    <textarea
                        id="product-description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe the product"
                        rows={3}
                        required
                    />

                    <div className="product-form-row">
                        <div>
                            <label htmlFor="product-price">Price (RM)</label>
                            <input
                                id="product-price"
                                name="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="product-threshold">Low-stock threshold</label>
                            <input
                                id="product-threshold"
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
                        New products start with zero stock. Use Stock In to add inventory.
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

                        <button type="submit" className="primary-button" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default ProductForm;
