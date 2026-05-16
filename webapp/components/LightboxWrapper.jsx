'use client';
import { useState, useEffect } from 'react';

export default function LightboxWrapper({ html }) {
  const [lightboxImage, setLightboxImage] = useState(null);

  const handleImageClick = (e) => {
    // Check if clicked element is an image
    if (e.target.tagName === 'IMG') {
      e.preventDefault(); // Prevent navigating if the image is wrapped in a link
      e.stopPropagation(); // Stop event bubbling
      // WordPress sometimes puts the full resolution image in `data-large-file` or `data-orig-file`
      // We will try to use the highest res available, fallback to src
      const highResSrc = e.target.getAttribute('data-orig-file') || e.target.getAttribute('data-large-file') || e.target.src;
      setLightboxImage(highResSrc);
    }
  };

  useEffect(() => {
    // Add keyboard support for closing
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <div 
        onClick={handleImageClick}
        className="blog-content blog-content-interactive"
        style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#333' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Fullscreen Lightbox Overlay */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '20px'
          }}
        >
          <img 
            src={lightboxImage} 
            alt="Expanded view" 
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent click on image from closing, only click on background
          />
          <button
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '3rem',
              cursor: 'pointer',
              lineHeight: '1',
              padding: '10px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
