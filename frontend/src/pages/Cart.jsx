import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cart, getToken } from '../services/api';
import Skeleton from '../components/ui/Skeleton';

export default function Cart() {
  const [cartData, setCartData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    cart.get()
      .then((r) => setCartData(r || { items: [] }))
      .catch(() => setCartData({ items: [] }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!getToken()) {
      // Still show cart page, but it will be empty for non-logged in users
      setLoading(false);
      return;
    }
    load();
  }, []);

  const handleRemove = async (itemId) => {
    setRemoving(itemId);
    try {
      const updated = await cart.removeItem(itemId);
      setCartData(updated || { items: [] });
    } catch (err) {
      console.error('Failed to remove item', err);
      // Reload cart to get fresh state
      load();
    } finally {
      setRemoving(null);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const updated = await cart.updateItem(itemId, { quantity: newQuantity });
      setCartData(updated || { items: [] });
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const total = cartData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '900px' }}>
        <Skeleton height="2.5rem" style={{ width: '200px', marginBottom: '2rem' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="100px" style={{ marginBottom: '1rem' }} />
        ))}
        <div className="flex justify-end" style={{ marginTop: '2rem', gap: '1rem' }}>
          <Skeleton height="2rem" style={{ width: '100px' }} />
          <Skeleton height="3rem" style={{ width: '180px' }} />
        </div>
      </div>
    );
  }

  if (!cartData.items || cartData.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🛒</div>
        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
          Looks like you haven't added anything yet.
        </p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)' }}>Shopping Cart</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {cartData.items.map((item) => {
          // Handle both populated and non-populated product references
          const product = item.product || {};
          const productId = product._id || product;
          const productTitle = product.title || 'Product';
          const productImage = product.images?.[0];

          return (
            <div 
              key={item._id} 
              className="card flex justify-between items-center" 
              style={{ 
                padding: 'var(--spacing-md)',
                opacity: removing === item._id ? 0.5 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {productImage ? (
                    <img src={productImage} alt={productTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>🛒</span>
                  )}
                </div>
                <div>
                  <Link 
                    to={`/products/${productId}`} 
                    style={{ fontWeight: 600, fontSize: '1.1rem', display: 'block', marginBottom: '0.25rem' }}
                  >
                    {productTitle}
                  </Link>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    ${item.price?.toFixed(2)} each
                  </div>
                </div>
              </div>
              
              <div className="flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
                {/* Quantity Controls */}
                <div className="flex items-center" style={{ gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'white',
                      cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                      opacity: item.quantity <= 1 ? 0.5 : 1
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>

                <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                
                <button 
                  onClick={() => handleRemove(item._id)}
                  disabled={removing === item._id}
                  style={{ 
                    color: '#ef4444', 
                    fontWeight: 500, 
                    background: 'none',
                    padding: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {removing === item._id ? '...' : 'Remove'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ 
        marginTop: 'var(--spacing-xl)', 
        borderTop: '1px solid var(--color-border)', 
        paddingTop: 'var(--spacing-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/products" style={{ color: 'var(--color-text-muted)' }}>
          &larr; Continue Shopping
        </Link>
        
        <div className="flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
          <div style={{ fontSize: '1.25rem' }}>
            Total: <span style={{ fontWeight: 800 }}>${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-accent" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
