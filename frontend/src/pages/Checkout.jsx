import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { orders, payments, cart } from '../services/api';
import Skeleton from '../components/ui/Skeleton';

export default function Checkout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [cartData, setCartData] = useState({ items: [] });
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderComplete, setOrderComplete] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    cart.get()
      .then((r) => setCartData(r || { items: [] }))
      .catch(() => setCartData({ items: [] }))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, navigate]);

  const total = cartData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    
    try {
      // 1. Place order from cart
      const order = await orders.place();
      
      // 2. Process payment
      const paymentResult = await payments.pay(order._id || order.id);
      
      // 3. Show success
      setOrderComplete({
        orderId: order._id || order.id,
        status: paymentResult.status,
        total: order.total
      });
      
    } catch (err) {
      setError(err.body?.error || 'Checkout failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '800px' }}>
        <Skeleton height="2.5rem" style={{ width: '200px', marginBottom: '2rem' }} />
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
          <Skeleton variant="rectangular" height="300px" />
          <Skeleton variant="rectangular" height="300px" />
        </div>
      </div>
    );
  }

  // Order complete state
  if (orderComplete) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>✅</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
          Order Placed Successfully!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        <div className="card" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)', textAlign: 'left' }}>
          <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
              <span style={{ fontWeight: 600 }}>#{orderComplete.orderId?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '999px', 
                fontSize: '0.8rem',
                fontWeight: 500,
                backgroundColor: '#22c55e20',
                color: '#22c55e'
              }}>
                {orderComplete.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Total:</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${orderComplete.total?.toFixed(2) || total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center" style={{ gap: 'var(--spacing-md)' }}>
          <Link to="/orders" className="btn btn-primary">View Orders</Link>
          <Link to="/products" className="btn" style={{ backgroundColor: 'var(--color-border)' }}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartData.items || cartData.items.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
          Add some products to your cart before checking out.
        </p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)' }}>Checkout</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          {error}
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 'var(--spacing-xl)' }}>
        {/* Shipping Form */}
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Shipping Information</h3>
          <form onSubmit={handleCheckout} className="flex" style={{ flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Address</label>
              <input 
                required
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>City</label>
                <input 
                  required
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Zip Code</label>
                <input 
                  required
                  placeholder="10001"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>Payment</h4>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                🔒 Secure payment processing. Your card will be charged upon order confirmation.
              </div>
            </div>

            <button 
              type="submit"
              disabled={placing}
              className="btn btn-accent" 
              style={{ marginTop: 'var(--spacing-md)', width: '100%', fontSize: '1.1rem', padding: '1rem' }}
            >
              {placing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: 'var(--spacing-lg)', height: 'fit-content' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
            {cartData.items.map((item) => (
              <div key={item._id} className="flex justify-between" style={{ fontSize: '0.9rem' }}>
                <span>
                  {item.product?.title || 'Product'} × {item.quantity}
                </span>
                <span style={{ fontWeight: 500 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-md)' }}>
            <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
              <span style={{ color: '#22c55e' }}>Free</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 'var(--spacing-sm)' }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
