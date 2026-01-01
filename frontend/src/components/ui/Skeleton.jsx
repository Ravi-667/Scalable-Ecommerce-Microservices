import React from 'react';

/**
 * Shadcn-style Skeleton component for loading states.
 * Features smooth pulse animation similar to Shadcn/UI.
 */
export default function Skeleton({ 
  className = '', 
  style = {}, 
  variant = 'text',
  width,
  height,
  rounded,
  ...props 
}) {
  const baseStyle = {
    display: 'block',
    backgroundColor: 'hsl(210 40% 96.1%)',
    borderRadius: rounded || (variant === 'circular' ? '50%' : variant === 'rectangular' ? 'var(--radius-md)' : 'var(--radius-sm)'),
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
    ...style
  };

  return (
    <div 
      className={`skeleton-pulse ${className}`} 
      style={baseStyle}
      {...props}
    />
  );
}

/**
 * Product Card Skeleton - matches actual product card layout exactly
 */
export function ProductCardSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Image placeholder - matches 200px height of real cards */}
      <Skeleton 
        variant="rectangular" 
        height="200px" 
        style={{ borderRadius: 0 }}
      />
      
      {/* Content area */}
      <div style={{ padding: 'var(--spacing-md)' }}>
        {/* Title */}
        <Skeleton 
          height="1.25rem" 
          width="85%" 
          style={{ marginBottom: '0.75rem' }}
        />
        
        {/* Description - two lines */}
        <Skeleton 
          height="0.875rem" 
          width="100%" 
          style={{ marginBottom: '0.5rem' }}
        />
        <Skeleton 
          height="0.875rem" 
          width="70%" 
          style={{ marginBottom: '1.25rem' }}
        />
        
        {/* Price and button row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton 
            height="1.5rem" 
            width="4rem"
          />
          <Skeleton 
            height="2.25rem" 
            width="4.5rem" 
            rounded="var(--radius-md)"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Filter Sidebar Skeleton
 */
export function FilterSkeleton() {
  return (
    <div>
      {/* Filter title */}
      <Skeleton height="1.25rem" width="60%" style={{ marginBottom: '1rem' }} />
      
      {/* Category items */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton 
          key={i} 
          height="2rem" 
          style={{ marginBottom: '0.5rem' }}
        />
      ))}
    </div>
  );
}

/**
 * Product Detail Skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
      {/* Image */}
      <Skeleton variant="rectangular" height="400px" rounded="var(--radius-lg)" />
      
      {/* Details */}
      <div>
        <Skeleton height="2.5rem" width="80%" style={{ marginBottom: '1rem' }} />
        <Skeleton height="1rem" width="30%" style={{ marginBottom: '2rem' }} />
        <Skeleton height="1rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton height="1rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton height="1rem" width="60%" style={{ marginBottom: '2rem' }} />
        <Skeleton height="3rem" width="8rem" style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Skeleton height="3rem" width="10rem" rounded="var(--radius-md)" />
          <Skeleton height="3rem" width="8rem" rounded="var(--radius-md)" />
        </div>
      </div>
    </div>
  );
}
