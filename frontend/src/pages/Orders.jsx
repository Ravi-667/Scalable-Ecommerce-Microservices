import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orders, getToken, logout } from '../services/api';
import Skeleton from '../components/ui/Skeleton';

export default function Orders() {
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orders.list();
        setUserOrders(res.items || []);
      } catch (err) {
        if (err.status === 401) {
          logout();
        }
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

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
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="120px" style={{ marginBottom: '1rem' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>My Orders</h2>
        <Link to="/profile" style={{ color: 'var(--color-text-muted)' }}>&larr; Back to Profile</Link>
      </div>

      {userOrders.length === 0 ? (
        <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>No Orders Yet</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
            Once you place an order, it will appear here.
          </p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {userOrders.map((order) => (
            <div key={order._id} className="card" style={{ padding: 'var(--spacing-lg)' }}>
              {/* Order Header */}
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h4>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <span style={{ 
                  padding: '0.35rem 1rem', 
                  borderRadius: '999px', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: `${getStatusColor(order.status)}20`,
                  color: getStatusColor(order.status)
                }}>
                  {order.status?.toUpperCase()}
                </span>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center" style={{ padding: '0.5rem 0' }}>
                    <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#f1f5f9', 
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.product?.title || 'Product'}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          Qty: {item.quantity} × ${item.price?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600 }}>
                      ${(item.quantity * item.price)?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center" style={{ paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 500 }}>Total</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  ${order.total?.toFixed(2)} {order.currency || 'USD'}
                </span>
              </div>

              {/* Payment Info */}
              {order.payment && (
                <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Payment: {order.payment.method} • {order.payment.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
