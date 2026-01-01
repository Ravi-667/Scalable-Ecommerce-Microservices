import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth, useUser, UserButton, SignOutButton } from '@clerk/clerk-react';

export default function Layout({ children }) {
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="layout">
      <Navbar />
      <main className="page-enter" key={location.pathname} style={{ minHeight: '80vh', padding: 'var(--spacing-lg) 0' }}>
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <header style={{ 
      borderBottom: '1px solid var(--color-border)', 
      padding: 'var(--spacing-sm) 0', 
      position: 'sticky', 
      top: 0, 
      backgroundColor: 'rgba(255,255,255,0.95)', 
      backdropFilter: 'blur(10px)', 
      zIndex: 100 
    }}>
      <div className="container flex justify-between items-center">
        <Link to="/home" style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
          🛒 MicroStore
        </Link>
        
        <nav className="flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
          <Link to="/home" style={{ color: 'var(--color-text)', fontWeight: 500, transition: 'color 0.2s' }}>
            Home
          </Link>
          <Link to="/products" style={{ color: 'var(--color-text)', fontWeight: 500, transition: 'color 0.2s' }}>
            Products
          </Link>
          
          {isLoaded && isSignedIn ? (
            <>
              <Link to="/cart" style={{ color: 'var(--color-text)', fontWeight: 500, transition: 'color 0.2s' }}>
                🛒 Cart
              </Link>
              <Link to="/orders" style={{ color: 'var(--color-text)', fontWeight: 500, transition: 'color 0.2s' }}>
                Orders
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                {user && (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Hi, {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                  </span>
                )}
                <UserButton 
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: '36px',
                        height: '36px'
                      }
                    }
                  }}
                />
              </div>
            </>
          ) : isLoaded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <Link to="/sign-in" className="btn" style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500
              }}>
                Sign In
              </Link>
              <Link to="/sign-up" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Get Started
              </Link>
            </div>
          ) : (
            <div style={{ width: '80px', height: '36px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)' }} />
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--color-border)', 
      padding: 'var(--spacing-xl) 0', 
      marginTop: 'var(--spacing-xl)', 
      backgroundColor: '#f8fafc'
    }}>
      <div className="container">
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>🛒 MicroStore</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Scalable E-Commerce Platform
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
            <Link to="/products" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Products</Link>
            <Link to="/cart" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Cart</Link>
            <Link to="/orders" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Orders</Link>
          </div>
        </div>
        
        <div style={{ 
          marginTop: 'var(--spacing-lg)', 
          paddingTop: 'var(--spacing-md)', 
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
          color: 'var(--color-text-muted)', 
          fontSize: '0.85rem' 
        }}>
          &copy; {new Date().getFullYear()} Scalable Microservices E-Commerce. Built with React + Node.js + Clerk.
        </div>
      </div>
    </footer>
  );
}
