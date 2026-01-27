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

  // Check if user has order history (Async)
  const hasOrderHistory = async () => {
    try {
      const { items } = await orders.list(); // Fetch from Backend
      return items && items.length > 0;
    } catch {
      return false;
    }
  };

  // Calculate recommendation score for a product
  const calculateScore = (product, preferredCategories) => {
    let score = product.rating.rate * 10; // Base score
    
    // Boost score if in preferred category
    const categoryIndex = preferredCategories.indexOf(product.category);
    if (categoryIndex !== -1) {
      // Massive efficiency boost (+50) to ensure preferences win
      score += (preferredCategories.length - categoryIndex) * 50;
    }
    
    return score;
  };

  // Get personalized recommendations based on order history
  const getPersonalizedRecommendations = async () => {
    try {
      // 1. Fetch User Orders (Backend)
      const { items: myOrders } = await orders.list();
      
      if (!myOrders || myOrders.length === 0) {
        return null; 
      }
      
      // 2. Fetch All Products (FakeStore) to resolve categories
      const response = await products.list('');
      const allProducts = response.items || [];
      const productMap = new Map(allProducts.map(p => [p._id, p]));

      // 3. Analyze Purchase History
      const purchasedCategories = {};
      const purchasedProductIds = new Set();
      
      myOrders.forEach(order => {
        order.items?.forEach(item => {
          // Robustly find product details
          const productDetail = item.product?._id ? productMap.get(item.product._id) : null;
          // Fallback: use title matching if ID mismatch (Double safety for Hybrid)
          
          const category = productDetail?.category || item.product?.category; // item.product.category might be undefined in backend snapshot
          
          if (category) {
            purchasedCategories[category] = (purchasedCategories[category] || 0) + item.quantity;
          }
          if (item.product?._id) purchasedProductIds.add(item.product._id);
        });
      });
      
      // 4. Determine Preferences
      const preferredCategories = Object.entries(purchasedCategories)
        .sort(([, a], [, b]) => b - a)
        .map(([cat]) => cat);
      
      console.log('Preferred categories:', preferredCategories);
      
      // 5. Score & Filter
      const recommendations = allProducts
        .filter(p => p.rating && p.rating.rate)
        .filter(p => !purchasedProductIds.has(p._id))
        .map(p => ({
          ...p,
          score: calculateScore(p, preferredCategories)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      console.log('Personalized recommendations:', recommendations);
      
      return recommendations.length > 0 ? recommendations : null;

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
        let shouldPersonalize = false;
        if (isSignedIn) {
          shouldPersonalize = await hasOrderHistory();
        }
        
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
