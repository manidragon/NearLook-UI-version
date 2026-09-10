import React, { useState, useEffect, useRef } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const MAX_PULL = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh if we are at the very top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isRefreshing) return;
    const y = e.touches[0].clientY;
    
    // Only register downwards drag
    if (y > startY) {
      setCurrentY(y);
    } else {
      // If they scroll up, cancel drag
      setIsDragging(false);
      setStartY(0);
      setCurrentY(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const pullDistance = currentY - startY;
    if (pullDistance > MAX_PULL && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setStartY(0);
        setCurrentY(0);
      }
    } else {
      setStartY(0);
      setCurrentY(0);
    }
  };

  const pullDistance = Math.min(Math.max(currentY - startY, 0), MAX_PULL + 20);

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: '100%', position: 'relative' }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: pullDistance,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa',
          transition: isDragging ? 'none' : 'height 0.3s ease',
          zIndex: 10
        }}
      >
        {isRefreshing ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" style={{ borderTopColor: 'transparent' }}></div>
        ) : (
          pullDistance > 10 && (
            <div style={{ opacity: pullDistance / MAX_PULL, color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ transform: `rotate(${pullDistance >= MAX_PULL ? 180 : 0}deg)`, transition: 'transform 0.2s' }}>↓</span>
              {pullDistance >= MAX_PULL ? 'Release to refresh' : 'Pull down to refresh'}
            </div>
          )
        )}
      </div>
      
      <div style={{ 
        transform: `translateY(${isRefreshing ? MAX_PULL / 2 : pullDistance}px)`, 
        transition: isDragging ? 'none' : 'transform 0.3s ease' 
      }}>
        {children}
      </div>
    </div>
  );
}
