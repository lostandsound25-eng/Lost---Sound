'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Fetch photos specifically from the dedicated WordPress Gallery page (slug: gallery)
  useEffect(() => {
    async function fetchWordPressGalleryPage() {
      try {
        setLoading(true);
        const res = await fetch(
          'https://public-api.wordpress.com/rest/v1.1/sites/lostandsoundtravel.wordpress.com/posts/slug:gallery'
        );
        if (!res.ok) throw new Error(`WordPress API HTTP error ${res.status}`);
        const post = await res.json();
        
        const photos = [];
        const seenUrls = new Set();

        if (post && post.content) {
          // Parse HTML content to extract figures/images and their captions
          const parser = new DOMParser();
          const doc = parser.parseFromString(post.content, 'text/html');
          
          // Find all figure/img elements inside the gallery post
          const figureElements = doc.querySelectorAll('figure.wp-block-image, .wp-block-gallery figure, figure');

          figureElements.forEach((fig, idx) => {
            const img = fig.querySelector('img');
            if (img) {
              let src = img.getAttribute('src') || img.getAttribute('data-orig-file') || img.getAttribute('data-large-file');
              if (src) {
                // Decode HTML entities in URL
                src = src.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
                
                // Get caption text from figcaption or alt attribute
                const captionEl = fig.querySelector('figcaption');
                const captionText = captionEl ? captionEl.textContent.trim() : (img.getAttribute('alt') || '');

                if (!seenUrls.has(src)) {
                  seenUrls.add(src);
                  photos.push({
                    id: `wp-gallery-${idx}`,
                    url: src,
                    caption: captionText,
                    title: captionText || 'Lost & Sound Moment'
                  });
                }
              }
            }
          });

          // Fallback: If figures weren't used, parse direct <img> tags
          if (photos.length === 0) {
            const imgs = doc.querySelectorAll('img');
            imgs.forEach((img, idx) => {
              const src = img.getAttribute('src');
              if (src && !src.includes('gravatar.com') && !src.includes('s.w.org') && !seenUrls.has(src)) {
                seenUrls.add(src);
                const alt = img.getAttribute('alt') || '';
                photos.push({
                  id: `wp-gallery-img-${idx}`,
                  url: src,
                  caption: alt,
                  title: alt || 'Lost & Sound Moment'
                });
              }
            });
          }
        }

        setItems(photos);
      } catch (err) {
        console.error('Error fetching WordPress gallery page:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWordPressGalleryPage();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '120px 24px 80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h1 style={{ 
              fontSize: '3.2rem', 
              fontFamily: 'var(--font-heading)', 
              color: 'var(--color-purple)', 
              marginBottom: '10px',
              lineHeight: 1.15
            }}>
              Gallery
            </h1>
            
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#666', 
              maxWidth: '500px', 
              margin: '0 auto',
              lineHeight: 1.5
            }}>
              The world through our cameras.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '24px' 
            }}>
              {[1, 2, 3].map(n => (
                <div 
                  key={n} 
                  style={{ 
                    height: '380px', 
                    borderRadius: '24px', 
                    backgroundColor: '#E5E7EB', 
                    animation: 'pulse 1.5s infinite ease-in-out' 
                  }} 
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <ImageIcon size={48} style={{ color: 'var(--color-orange)', opacity: 0.5, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)', marginBottom: '8px' }}>
                No photos in gallery yet
              </h3>
              <p style={{ fontSize: '0.95rem' }}>
                Photos uploaded to your WordPress Gallery page will appear here automatically.
              </p>
            </div>
          )}

          {/* Dedicated WordPress Gallery Photo Grid */}
          {!loading && items.length > 0 && (
            <motion.div 
              layout
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                gap: '28px' 
              }}
            >
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setActiveItem(item)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      position: 'relative',
                      height: '380px',
                      backgroundColor: '#F3F4F6',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(133, 58, 81, 0.08)'
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <img
                      src={item.url}
                      alt={item.caption || item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.5s ease',
                        transform: hoveredId === item.id ? 'scale(1.04)' : 'scale(1)'
                      }}
                    />

                    {/* Overlay Caption (Only shows on hover or touch) */}
                    {item.caption && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '28px 20px 20px 20px',
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.4) 70%, transparent 100%)',
                        color: 'white',
                        opacity: hoveredId === item.id ? 1 : 0,
                        transform: hoveredId === item.id ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'all 0.3s ease',
                        pointerEvents: 'none'
                      }}>
                        <p style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          margin: 0,
                          lineHeight: 1.4,
                          color: 'white',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          {item.caption}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </main>

      {/* Lightbox Modal (Click to View Full Photo & Caption) */}
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
                  justify: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <X size={20} />
              </button>

              {/* Full Image Preview */}
              <div style={{ 
                backgroundColor: '#111827', 
                display: 'flex', 
                alignItems: 'center', 
                justify: 'center',
                maxHeight: '70vh',
                overflow: 'hidden'
              }}>
                <img
                  src={activeItem.url}
                  alt={activeItem.caption || activeItem.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Caption Footer in Lightbox */}
              {activeItem.caption && (
                <div style={{ padding: '20px 24px', backgroundColor: 'white' }}>
                  <p style={{ fontSize: '1.05rem', color: 'var(--color-purple)', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                    {activeItem.caption}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
