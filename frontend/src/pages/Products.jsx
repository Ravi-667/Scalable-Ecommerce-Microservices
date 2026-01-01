import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../services/api';
import Skeleton, { ProductCardSkeleton, FilterSkeleton } from '../components/ui/Skeleton';
import RangeSlider from '../components/ui/RangeSlider';

export default function Products() {
  const [allItems, setAllItems] = useState([]); // Store all items for client-side filtering
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Fetch categories on mount
  useEffect(() => {
    products.getCategories()
      .then(cats => setCategories(cats || []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Fetch products when category changes
  const fetchProducts = (category = 'all') => {
    setLoading(true);
    
    const fetchFn = category !== 'all' 
      ? products.getByCategory(category)
      : products.list('');
    
    fetchFn
      .then((r) => {
        const data = r.items || (Array.isArray(r) ? r : []);
        setAllItems(data);
      })
      .catch((err) => {
        console.error("Failed to fetch products", err);
        setAllItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  // Filter items by search and price (client-side)
  const filteredItems = useMemo(() => {
    return allItems.filter(p => {
      // Search filter
      const matchesSearch = !q || 
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.description?.toLowerCase().includes(q.toLowerCase());
      
      // Price filter
      const price = p.price || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      return matchesSearch && matchesPrice;
    });
  }, [allItems, q, priceRange]);

  const handleSearch = () => {
    // Search is applied via useMemo, just trigger re-render
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setQ(''); // Clear search when changing category
  };

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
  };

  // Get counts per category
  const getCategoryCount = (category) => {
    if (category === 'all') return 20;
    const counts = {
      "electronics": 6,
      "jewelery": 4,
      "men's clothing": 4,
      "women's clothing": 6
    };
    return counts[category] || 0;
  };

  // Calculate price range from products
  const priceStats = useMemo(() => {
    if (allItems.length === 0) return { min: 0, max: 1000 };
    const prices = allItems.map(p => p.price || 0);
    return {
      min: 0,
      max: Math.ceil(Math.max(...prices) / 10) * 10 // Round up to nearest 10
    };
  }, [allItems]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--spacing-xl)' }}>
      {/* Filter Sidebar */}
      <aside className="filter-sidebar">
        {/* Categories */}
        <div className="filter-group">
          <div className="filter-title">Categories</div>
          
          {categoriesLoading ? (
            <FilterSkeleton />
          ) : (
            <>
              <div 
                className={`filter-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('all')}
              >
                <span>All Products</span>
                <span className="filter-count">20</span>
              </div>
              
              {categories.map(cat => (
                <div 
                  key={cat}
                  className={`filter-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                  <span className="filter-count">{getCategoryCount(cat)}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Price Range Slider */}
        <div className="filter-group">
          <div className="filter-title">Price Range</div>
          <RangeSlider
            min={0}
            max={priceStats.max || 1000}
            step={5}
            value={priceRange}
            onChange={handlePriceChange}
            formatLabel={(v) => `$${v}`}
          />
        </div>

        {/* Reset Filters */}
        <button 
          className="btn" 
          style={{ 
            width: '100%', 
            marginTop: 'var(--spacing-sm)',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem'
          }}
          onClick={() => {
            setSelectedCategory('all');
            setPriceRange([0, priceStats.max || 1000]);
            setQ('');
          }}
        >
          Reset Filters
        </button>
      </aside>

      {/* Main Content */}
      <main>
        {/* Header with Search */}
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {selectedCategory === 'all' ? 'All Products' : (
                <span style={{ textTransform: 'capitalize' }}>{selectedCategory}</span>
              )}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {loading ? 'Loading...' : `${filteredItems.length} products`}
            </p>
          </div>
          
          <div className="flex" style={{ maxWidth: '350px' }}>
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search products..." 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            />
            <button 
              onClick={handleSearch} 
              className="btn btn-primary"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {loading ? (
            // Skeleton Loading
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            filteredItems.length > 0 ? filteredItems.map((p) => (
              <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
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
                  {p.images && p.images[0] ? (
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '3rem' }}>🛍️</span>
                  )}
                </div>
                
                {/* Product Info */}
                <div style={{ padding: 'var(--spacing-md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {p.category && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      textTransform: 'uppercase', 
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.05em',
                      marginBottom: '0.5rem'
                    }}>
                      {p.category}
                    </span>
                  )}
                  
                  <Link 
                    to={`/products/${p._id}`} 
                    style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 600, 
                      marginBottom: '0.5rem', 
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {p.title}
                  </Link>
                  
                  {p.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#eab308' }}>★</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {p.rating.rate} ({p.rating.count})
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      ${p.price?.toFixed(2)}
                    </span>
                    <Link to={`/products/${p._id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                      View
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  No products found
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Try adjusting your filters or price range
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { 
                    setQ(''); 
                    setSelectedCategory('all'); 
                    setPriceRange([0, priceStats.max || 1000]);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
