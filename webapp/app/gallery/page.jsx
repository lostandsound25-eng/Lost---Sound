'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState(null);

  // Fetch photos directly from WordPress REST API
  useEffect(() => {
    async function fetchWordPressGallery() {
      try {
        setLoading(true);
        const res = await fetch(
          'https://public-api.wordpress.com/rest/v1.1/sites/lostandsoundtravel.wordpress.com/posts?number=100'
        );
        if (!res.ok) throw new Error(`WordPress API HTTP error ${res.status}`);
        const data = await res.json();
        
        const photos = [];
        const seenUrls = new Set();

        (data.posts || []).forEach(post => {
          const cleanPostTitle = post.title
            ? post.title.replace(/&#8217;/g, "'").replace(/&amp;/g, "&").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
            : 'Lost & Sound Moment';

          // 1. Featured image
          if (post.featured_image && !seenUrls.has(post.featured_image)) {
            seenUrls.add(post.featured_image);
            photos.push({
              id: `wp-feat-${post.ID}`,
              title: cleanPostTitle,
              caption: post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '').trim() : '',
              url: post.featured_image,
              date: post.date,
              postSlug: post.slug,
              postTitle: cleanPostTitle
            });
          }

          // 2. Extract embedded photos & alt/caption text from post content
          const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/gi;
          let match;
          let imgIdx = 0;
          while ((match = imgRegex.exec(post.content)) !== null) {
            imgIdx++;
            const imgTag = match[0];
            const src = match[1];

            // Filter out gravatars, emojis, and duplicate URLs
            if (
              src && 
              !src.includes('gravatar.com') && 
              !src.includes('s.w.org') && 
              !src.includes('avatar') &&
              !seenUrls.has(src)
            ) {
              seenUrls.add(src);
              const altMatch = imgTag.match(/alt="([^"]*)"/i);
              const altText = altMatch ? altMatch[1].trim() : '';

              photos.push({
                id: `wp-img-${post.ID}-${imgIdx}`,
                title: altText || cleanPostTitle,
                caption: altText || '',
                url: src,
                date: post.date,
                postSlug: post.slug,
                postTitle: cleanPostTitle
              });
            }
          }
        });

        setItems(photos);
      } catch (err) {
        console.error('Error fetching WordPress gallery media:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWordPressGallery();
  }, []);

  // Filter items by search query (title, caption, post title)
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.caption && item.caption.toLowerCase().includes(q)) ||
      (item.postTitle && item.postTitle.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '120px 24px 80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ 
              color: 'var(--color-orange)', 
              fontWeight: 800, 
              fontSize: '0.85rem', 
              letterSpacing: '2px', 
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px'
            }}>
              Live Photo Feed
            </span>
            
            <h1 style={{ 
              fontSize: '3rem', 
              fontFamily: 'var(--font-heading)', 
              color: 'var(--color-purple)', 
              marginBottom: '12px',
              lineHeight: 1.15
            }}>
              Travel Gallery
            </h1>
            
            <p style={{ 
              fontSize: '1.15rem', 
              color: '#666', 
              maxWidth: '600px', 
              margin: '0 auto 2rem auto',
              lineHeight: 1.6
            }}>
              Moments, landscapes, and stories captured on the road, automatically updating live from our travels.
            </p>

            {/* Search Input */}
            <div style={{
              position: 'relative',
              maxWidth: '420px',
              margin: '0 auto'
            }}>
              <Search style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
                width: '18px',
                height: '18px'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos, places & captions..."
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '30px',
                  border: '1.5px solid rgba(133, 58, 81, 0.15)',
                  backgroundColor: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  color: '#111827'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '24px' 
            }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div 
                  key={n} 
                  style={{ 
                    height: '280px', 
                    borderRadius: '20px', 
                    backgroundColor: '#E5E7EB', 
                    animation: 'pulse 1.5s infinite ease-in-out' 
                  }} 
                />
              ))}
            </div>
          )}

          {/* Empty Search State */}
          {!loading && filteredItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <ImageIcon size={48} style={{ color: 'var(--color-orange)', opacity: 0.5, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)', marginBottom: '8px' }}>
                No photos found
              </h3>
              <p style={{ fontSize: '0.95rem' }}>
                Try searching for a different destination or keyword.
              </p>
            </div>
          )}

          {/* Live WordPress Photo Grid */}
          {!loading && filteredItems.length > 0 && (
            <motion.div 
              layout
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '24px' 
              }}
            >
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setActiveItem(item)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      position: 'relative',
                      height: '320px',
                      backgroundColor: '#E5E7EB',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />

                    {/* Gradient Overlay & Details on Hover */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.15) 60%, rgba(0,0,0,0) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'flex-end',
                      padding: '20px',
                      color: 'white',
                      transition: 'opacity 0.3s ease'
                    }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        color: 'var(--color-golden)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        marginBottom: '4px'
                      }}>
                        <Calendar size={12} />
                        {formatDate(item.date)}
                      </span>

                      <h3 style={{
                        fontSize: '1.25rem',
                        fontFamily: 'var(--font-heading)',
                        color: 'white',
                        margin: '0 0 6px 0',
                        lineHeight: 1.25
                      }}>
                        {item.title}
                      </h3>

                      {item.caption && (
                        <p style={{
                          fontSize: '0.82rem',
                          color: 'rgba(255, 255, 255, 0.85)',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4
                        }}>
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'transform 0.2s'
                }}
              >
                <X size={20} />
              </button>

              {/* Image Preview Container */}
              <div style={{ 
                backgroundColor: '#111827', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                maxHeight: '65vh',
                overflow: 'hidden'
              }}>
                <img
                  src={activeItem.url}
                  alt={activeItem.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Caption & Metadata Footer */}
              <div style={{ padding: '24px', backgroundColor: 'white', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h2 style={{
                    fontSize: '1.6rem',
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--color-purple)',
                    margin: 0
                  }}>
                    {activeItem.title}
                  </h2>
                  
                  {activeItem.date && (
                    <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600, flexShrink: 0, marginLeft: '12px' }}>
                      {formatDate(activeItem.date)}
                    </span>
                  )}
                </div>

                {activeItem.caption && (
                  <p style={{ fontSize: '1rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    {activeItem.caption}
                  </p>
                )}

                {activeItem.postSlug && (
                  <Link
                    href={`/blog/${activeItem.postSlug}`}
                    onClick={() => setActiveItem(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--color-orange)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textDecoration: 'none'
                    }}
                  >
                    Read Story: {activeItem.postTitle} <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
