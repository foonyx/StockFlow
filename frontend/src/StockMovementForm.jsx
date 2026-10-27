
import { useState } from 'react';
import './ProductForm.css';

const API_URL = 'http://localhost:8080';

function StockMovementForm({ product, movementType, onClose, onSuccess }) {
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const isStockIn = movementType === 'stock-in';

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const amount = Number(quantity);

        if (!Number.isInteger(amount) || amount <= 0) {
            setError('Please enter a whole number greater than zero.');
            return;
        }

        if (!isStockIn && amount > product.quantity) {
            setError(
                `You only have ${product.quantity} units available.`
            );
            return;
        }

        setSaving(true);

        try {
            const token = sessionStorage.getItem('accessToken');

            const response = await fetch(
                `${API_URL}/api/products/${product.id}/${movementType}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ quantity: amount }),
                }
            );

            if (response.status === 401) {
                sessionStorage.removeItem('accessToken');
                window.location.href = '/';
                return;
            }

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Stock movement failed.');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(event) => event.stopPropagation()}
            >
                <h2>{isStockIn ? 'Stock In' : 'Stock Out'}</h2>

                <p>
                    <strong>{product.name}</strong>
                    {' '}({product.sku})
                </p>

                <p>Current quantity: {product.quantity}</p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="stock-quantity">
                        Quantity
                    </label>

                    <input
                        id="stock-quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        placeholder="Enter quantity"
                        required
                    />

                    {error && (
                        <p className="products-error">{error}</p>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button type="submit" disabled={saving}>
                            {saving
                                ? 'Processing...'
                                : isStockIn
                                    ? 'Confirm Stock In'
                                    : 'Confirm Stock Out'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StockMovementForm;
