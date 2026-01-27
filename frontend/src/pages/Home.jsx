import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../services/api';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    products.list('')
      .then((response) => {
        const items = response.items || (Array.isArray(response) ? response : []);
        
        // Sort by rating and take top 3
        const topProducts = items
          .filter(p => p.rating && p.rating.rate) // Has rating
          .sort((a, b) => b.rating.rate - a.rating.rate) // Highest first
          .slice(0, 3); // Top 3
        
        setFeaturedItems(topProducts);
      })
      .catch((err) => {
        console.error('Failed to fetch featured products', err);
        setError('Failed to load featured products');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section style={{ 
        textAlign: 'center', 
        padding: 'var(--spacing-xl) 0', 
        backgroundColor: 'var(--color-primary)', 
        color: 'white', 
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 'var(--spacing-md)' }}>
          Elevate Your Shopping Experience
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: 'var(--spacing-lg)', maxWidth: '600px', margin: '0 auto var(--spacing-lg)' }}>
          Discover premium microservices-driven products with a seamless, scalable interface.
        </p>
        <div className="flex justify-center" style={{ gap: 'var(--spacing-md)' }}>
          <Link to="/products" className="btn btn-accent" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Shop Now
          </Link>
          <button className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Learn More
          </button>
        </div>
      </section>

      {/* Featured Collection */}
      <section>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Collection</h2>
          <Link to="/products" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>View All &rarr;</Link>
        </div>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {loading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : error ? (
            // Error state
            <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary" 
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                Retry
              </button>
            </div>
          ) : (
            // Featured products
            featuredItems.map((product) => (
              <Link 
                key={product._id} 
                to={`/products/${product._id}`}
                className="card" 
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
              >
                {/* Product Image */}
                <div style={{ 
                  height: '200px', 
                  backgroundColor: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  {product.images && product.images[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>🛍️</span>
                  )}
                </div>
                
                {/* Product Info */}
                <div style={{ padding: 'var(--spacing-md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Category Badge */}
                  {product.category && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      textTransform: 'uppercase', 
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.05em',
                      marginBottom: '0.5rem'
                    }}>
                      {product.category}
                    </span>
                  )}
                  
                  {/* Title */}
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    marginBottom: '0.5rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.3
                  }}>
                    {product.title}
                  </h3>
                  
                  {/* Rating */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#eab308', fontSize: '1rem' }}>★</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {product.rating.rate}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      ({product.rating.count})
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: 'var(--color-primary)',
                    marginTop: 'auto'
                  }}>
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
