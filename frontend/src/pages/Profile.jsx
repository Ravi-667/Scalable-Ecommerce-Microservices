import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { orders } from '../services/api';
import Skeleton from '../components/ui/Skeleton';

export default function Profile() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signOut } = useClerk();
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoaded) return;
    
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const ordersRes = await orders.list();
        setUserOrders(ordersRes.items || []);
      } catch (err) {
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoaded, isSignedIn, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#eab308',
      paid: '#22c55e',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div>
        <Skeleton height="2.5rem" style={{ width: '200px', marginBottom: '2rem' }} />
        <div className="card" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <Skeleton height="1.5rem" style={{ width: '150px', marginBottom: '1rem' }} />
          <Skeleton height="1rem" style={{ width: '250px', marginBottom: '0.5rem' }} />
          <Skeleton height="1rem" style={{ width: '200px' }} />
        </div>
        <Skeleton height="2rem" style={{ width: '150px', marginBottom: '1rem' }} />
        <Skeleton variant="rectangular" height="100px" style={{ marginBottom: '1rem' }} />
        <Skeleton variant="rectangular" height="100px" style={{ marginBottom: '1rem' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
        <h2 style={{ color: '#ef4444', marginBottom: 'var(--spacing-md)' }}>Error</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>My Profile</h2>
        <button onClick={handleLogout} className="btn" style={{ backgroundColor: '#ef4444', color: 'white' }}>
          Logout
        </button>
      </div>

      {/* User Info Card */}
      <div className="card" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Account Information
        </h3>
        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
          <div>
            <span style={{ fontWeight: 600 }}>Name:</span> {user?.fullName || user?.firstName || 'N/A'}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Email:</span> {user?.emailAddresses?.[0]?.emailAddress || 'N/A'}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Order History</h3>
        <Link to="/orders" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>View All &rarr;</Link>
      </div>

      {userOrders.length === 0 ? (
        <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}>
            You haven't placed any orders yet.
          </p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {userOrders.slice(0, 5).map((order) => (
            <div key={order._id} className="card" style={{ padding: 'var(--spacing-md)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    backgroundColor: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status)
                  }}>
                    {order.status?.toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    ${order.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
