import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
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

      {/* Featured Teaser */}
      <section>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Collection</h2>
          <Link to="/products" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>View All &rarr;</Link>
        </div>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {/* Mock Featured Items */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Featured Item {i}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
