import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { products, cart, getToken } from '../services/api';
import Skeleton from '../components/ui/Skeleton';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Artificial delay for effect
    setTimeout(() => {
      products.get(id)
        .then(setP)
        .catch(() => setP(null))
        .finally(() => setLoading(false));
    }, 600);
  }, [id]);

  const add = async () => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await cart.add({ productId: p._id, quantity: 1 });
      // In a real app, we'd use a toast here
      alert('Added to cart successfully!');
    } catch (err) {
      alert('Add failed: ' + (err.body?.error || err.status || 'Unknown error'));
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex" style={{ gap: 'var(--spacing-xl)', flexDirection: 'column' }}>
        <div style={{ padding: 'var(--spacing-sm)' }}>
          <Link to="/products" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>&larr; Back to Products</Link>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
          <Skeleton variant="rectangular" height="400px" style={{ borderRadius: 'var(--radius-lg)' }} />
          <div>
            <Skeleton height="3rem" style={{ marginBottom: '1rem' }} />
            <Skeleton height="1.5rem" width="20%" style={{ marginBottom: '2rem' }} />
            <Skeleton height="1rem" count={3} style={{ marginBottom: '0.5rem' }} />
            <Skeleton height="1rem" count={3} style={{ marginBottom: '2rem' }} />
            <Skeleton height="3.5rem" width="150px" style={{ borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
       <div style={{ padding: 'var(--spacing-sm) 0' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            &larr; Back
          </button>
        </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
        {/* Image Section */}
        <div style={{ 
          backgroundColor: '#f1f5f9', 
          borderRadius: 'var(--radius-lg)', 
          minHeight: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {p.images && p.images[0] ? (
            <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }} />
          ) : (
             <span style={{ fontSize: '5rem' }}>📦</span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex" style={{ flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>{p.title}</h1>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: 'var(--color-primary)', 
            marginBottom: 'var(--spacing-lg)' 
          }}>
            ${p.price} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>{p.currency || 'USD'}</span>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.6, color: '#475569' }}>
            {p.description}
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <span style={{ 
              display: 'inline-block', 
              padding: '0.25rem 0.75rem', 
              backgroundColor: '#e2e8f0', 
              borderRadius: '999px', 
              fontSize: '0.85rem',
              fontWeight: 500
            }}>
              SKU: {p.sku || 'N/A'}
            </span>
          </div>

          <button 
            onClick={add} 
            disabled={adding}
            className="btn btn-primary"
            style={{ alignSelf: 'start', padding: '1rem 3rem', fontSize: '1.1rem' }}
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
