import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { products } from '../services/api';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

export default function Home() {
  const { isSignedIn } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // Check if user has order history
  const hasOrderHistory = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      return orders.length > 0;
    } catch {
      return false;
    }
  };

  // Calculate recommendation score for a product
  const calculateScore = (product, preferredCategories) => {
    let score = product.rating.rate * 10; // Base score from rating (0-50)
    
    // Boost score if in preferred category
    const categoryIndex = preferredCategories.indexOf(product.category);
    if (categoryIndex !== -1) {
      // Higher boost for more frequently purchased categories
      score += (preferredCategories.length - categoryIndex) * 5;
    }
    
    return score;
  };

  // Get personalized recommendations based on order history
  const getPersonalizedRecommendations = async () => {
    try {
      // Get user's orders from localStorage
      const orders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
      
      if (orders.length === 0) {
        return null; // No order history, return null to show best sellers
      }
      
      // Extract categories and purchased product IDs
      const purchasedCategories = {};
      const purchasedProductIds = new Set();
      
      orders.forEach(order => {
        order.items?.forEach(item => {
          const category = item.product?.category;
          if (category) {
            purchasedCategories[category] = (purchasedCategories[category] || 0) + item.quantity;
          }
          purchasedProductIds.add(item.product?._id);
        });
      });
      
      // Sort categories by purchase frequency
      const preferredCategories = Object.entries(purchasedCategories)
        .sort(([, a], [, b]) => b - a)
        .map(([cat]) => cat);
      
      console.log('Preferred categories:', preferredCategories);
      
      // Fetch all products
      const response = await products.list('');
      const items = response.items || (Array.isArray(response) ? response : []);
      
      // Filter and score products
      const recommendations = items
        .filter(p => p.rating && p.rating.rate) // Has rating
        .filter(p => !purchasedProductIds.has(p._id)) // Not already purchased
        .map(p => ({
          ...p,
          score: calculateScore(p, preferredCategories)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      console.log('Personalized recommendations:', recommendations);
      
      // If we got at least 1 recommendation, use it
      if (recommendations.length > 0) {
        return recommendations;
      }
      
      // Otherwise fall back to best sellers
      return null;
    } catch (err) {
      console.error('Error getting personalized recommendations:', err);
      return null;
    }
  };

  // Get best sellers (fallback)
  const getBestSellers = async () => {
    const response = await products.list('');
    const items = response.items || (Array.isArray(response) ? response : []);
    
    // Sort by rating and take top 3
    const topProducts = items
      .filter(p => p.rating && p.rating.rate)
      .sort((a, b) => b.rating.rate - a.rating.rate)
      .slice(0, 3);
    
    return topProducts;
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if we should show personalized recommendations
        const shouldPersonalize = isSignedIn && hasOrderHistory();
        
        if (shouldPersonalize) {
          console.log('Attempting to show personalized recommendations...');
          const personalizedItems = await getPersonalizedRecommendations();
          
          if (personalizedItems && personalizedItems.length > 0) {
            // Show personalized recommendations
            setFeaturedItems(personalizedItems);
            setIsPersonalized(true);
            console.log('Showing personalized recommendations');
          } else {
            // Fall back to best sellers
            const bestSellers = await getBestSellers();
            setFeaturedItems(bestSellers);
            setIsPersonalized(false);
            console.log('Falling back to best sellers');
          }
        } else {
          // Show best sellers for new/unsigned users
          const bestSellers = await getBestSellers();
          setFeaturedItems(bestSellers);
          setIsPersonalized(false);
          console.log('Showing best sellers (no order history)');
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [isSignedIn]);

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

      {/* Featured Collection / Personalized Recommendations */}
      <section>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>
              {isPersonalized ? 'Recommended For You' : 'Featured Collection'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {isPersonalized ? 'Based on your purchase history' : 'Top rated products'}
            </p>
          </div>
          <Link to="/products" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
            View All &rarr;
          </Link>
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
