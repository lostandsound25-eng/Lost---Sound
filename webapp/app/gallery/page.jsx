'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import { Camera, MapPin, Tag, RefreshCw, X, Play, Volume2, VolumeX } from 'lucide-react';

// Seeding standard mockup travel moments
const MOCK_GALLERY = [
  {
    id: 'mock-1',
    title: 'Coconut Americano Experience',
    location: 'Senja Kopi, Bali, Indonesia',
    notes: 'The Coconut americano was to DIE FOR. Smooth, creamy, and local coffee beans mixed with fresh coconut water.',
    tags: ['coffee', 'cafe', 'bali'],
    dominant_color: 'gold',
    media_type: 'image',
    media_url: '/assets/gallery/bali_cafe.jpg'
  },
  {
    id: 'mock-2',
    title: 'Volcanic Cloud Sea at Dawn',
    location: 'Mount Bromo, East Java, Indonesia',
    notes: 'Stood in freezing temperatures at 4:30 AM, but seeing the volcanic caldera peek through a golden sea of clouds was unforgettable.',
    tags: ['trekking', 'volcano', 'java'],
    dominant_color: 'gold',
    media_type: 'image',
    media_url: '/assets/gallery/bromo_sunrise.jpg'
  },
  {
    id: 'mock-3',
    title: 'Train Street Alleyways',
    location: 'Train Street, Hanoi, Vietnam',
    notes: 'Sipping egg coffee on tiny plastic stools while a giant green train squeezes past inches from your face. Intense and spectacular.',
    tags: ['train', 'city', 'vietnam'],
    dominant_color: 'green',
    media_type: 'image',
    media_url: '/assets/gallery/vietnam_train.jpg'
  },
  {
    id: 'mock-4',
    title: 'Koh Phi Phi Lagoon Exploration',
    location: 'Maya Bay Tour, Koh Phi Phi, Thailand',
    notes: 'Chartered a traditional wooden longtail boat. The water is so clear it feels like the boat is floating in mid-air.',
    tags: ['beach', 'island', 'thailand'],
    dominant_color: 'blue',
    media_type: 'image',
    media_url: '/assets/gallery/thailand_beach.jpg'
  },
  {
    id: 'mock-5',
    title: 'Tegalalang Emerald Terraces',
    location: 'Tegalalang Rice Fields, Bali, Indonesia',
    notes: 'Exploring the sweeping terraced valleys early in the morning before the crowd arrives. The shades of green are unreal.',
    tags: ['nature', 'trekking', 'bali'],
    dominant_color: 'green',
    media_type: 'image',
    media_url: '/assets/rice-terraces.jpg'
  },
  {
    id: 'mock-6',
    title: 'Deep Cottonwood Valley Trails',
    location: 'Cottonwood Canyon, Utah, USA',
    notes: 'Chasing the crisp golden foliage in the mountains. High-altitude air and giant red-rock peaks towering above.',
    tags: ['hiking', 'mountains', 'usa'],
    dominant_color: 'gold',
    media_type: 'image',
    media_url: '/assets/hj-cottonwood.jpg'
  },
  {
    id: 'mock-7',
    title: 'Tropical Ocean Sunset Breeze',
    location: 'Sunset Beach, Koh Lipe, Thailand',
    notes: 'Listening to the slow crash of waves as the tropical sun dips below the horizon. Absolute peace.',
    tags: ['beach', 'nature', 'ocean'],
    dominant_color: 'blue',
    media_type: 'video',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-ocean-1527-large.mp4'
  },
  {
    id: 'mock-8',
    title: 'Golden Hour Palm Sway',
    location: 'Nusa Penida Cliffs, Indonesia',
    notes: 'Wind blowing through giant coconut palms overlooking the dramatic limestone cliffs. Golden rays catching every leaf.',
    tags: ['nature', 'beach', 'sunset'],
    dominant_color: 'green',
    media_type: 'video',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-palm-trees-in-a-sunny-breeze-4182-large.mp4'
  }
];

// Helper to morph shapes with vertex continuity on hover
const getShapeStyle = (index, isHovered) => {
  const shapes = [
    // Hexagon (6 points) -> Square (6 points)
    {
      normal: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      hover: "polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)"
    },
    // Pentagon (5 points) -> Square (5 points)
    {
      normal: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
      hover: "polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)"
    },
    // Octagon (8 points) -> Square (8 points)
    {
      normal: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
      hover: "polygon(0% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 0% 100%, 0% 100%, 0% 0%)"
    },
    // Trapezoid (4 points) -> Square (4 points)
    {
      normal: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
      hover: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
    }
  ];
  const shape = shapes[index % shapes.length];
  return isHovered ? shape.hover : shape.normal;
};

const COLOR_PILLS = [
  { id: 'all', label: 'All Colors', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' },
  { id: 'blue', label: '🔵 Blues', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  { id: 'green', label: '🟢 Greens', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  { id: 'gold', label: '🟡 Golds/Oranges', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' }
];

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  
  // Lightbox options
  const [videoMuted, setVideoMuted] = useState(true);

  // Fetch gallery from Supabase
  useEffect(() => {
    async function fetchGallery() {
      try {
        const { data, error } = await supabase
          .from('gallery_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Parse tag string arrays safely if needed
          const formatted = data.map(d => ({
            ...d,
            tags: Array.isArray(d.tags) ? d.tags : (d.tags ? d.tags.split(',') : [])
          }));
          setItems(formatted);
        } else {
          // Fallback to beautiful default mock items
          setItems(MOCK_GALLERY);
        }
      } catch (e) {
        console.error('Failed to load gallery database, using fallback:', e);
        setItems(MOCK_GALLERY);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  // Collect all unique tags
  const allTags = ['all', ...Array.from(new Set(items.flatMap(item => item.tags || [])))];

  // Filter items based on active tags & colors
  const filteredItems = items.filter(item => {
    const matchTag = selectedTag === 'all' || item.tags?.includes(selectedTag);
    const matchColor = selectedColor === 'all' || item.dominant_color === selectedColor;
    return matchTag && matchColor;
  });

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '120px 24px 80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: 900, 
              color: 'var(--color-purple)', 
              marginBottom: '1rem', 
              fontFamily: 'var(--font-heading)' 
            }}>
              Travel Mosaic
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#555', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              A collection of raw travel snapshots and 10s video loops. Morphing layouts, organized by tags and hues.
            </p>
          </div>

          {/* Filter Bar */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '24px', 
            padding: '20px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
            border: '1px solid rgba(133, 58, 81, 0.08)',
            marginBottom: '3rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Tag Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Tag size={14} /> Tag:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      backgroundColor: selectedTag === tag ? 'var(--color-purple)' : '#F3F4F6',
                      color: selectedTag === tag ? 'white' : '#4B5563'
                    }}
                  >
                    #{tag === 'all' ? 'show-all' : tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <RefreshCw size={14} /> Hue:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {COLOR_PILLS.map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedColor(pill.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: selectedColor === pill.id ? `1.5px solid ${pill.color}` : '1.5px solid transparent',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      backgroundColor: pill.bg,
                      color: pill.color
                    }}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mosaic Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div style={{ border: '3px solid rgba(133,58,81,0.1)', borderTop: '3px solid var(--color-purple)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 20px', backgroundColor: 'white', borderRadius: '24px', border: '1px dashed rgba(133,58,81,0.2)' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-purple)', marginBottom: '0.5rem' }}>No travel moments match</h3>
                  <p style={{ color: '#666', fontSize: '0.95rem' }}>Try clearing your active category or color filters.</p>
                </div>
              ) : (
                <motion.div 
                  layout
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gridAutoRows: '260px',
                    gap: '20px',
                    marginTop: '20px'
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => {
                      const isHovered = hoveredIndex === index;
                      const clipPathValue = getShapeStyle(index, isHovered);

                      return (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => setActiveItem(item)}
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            backgroundColor: '#E5E7EB',
                            clipPath: clipPathValue,
                            WebkitClipPath: clipPathValue,
                            transition: 'clip-path 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), -webkit-clip-path 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.45s ease',
                            transform: isHovered ? 'scale(1.04) rotate(0.5deg)' : 'scale(1) rotate(0deg)',
                            zIndex: isHovered ? 10 : 1,
                            boxShadow: isHovered ? '0 20px 25px -5px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {/* Image Thumbnail */}
                          {item.media_type === 'image' && (
                            <img
                              src={item.media_url}
                              alt={item.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                pointerEvents: 'none',
                                userSelect: 'none'
                              }}
                            />
                          )}

                          {/* Video Thumbnail */}
                          {item.media_type === 'video' && (
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                              <video
                                src={item.media_url}
                                loop
                                muted
                                playsInline
                                autoPlay
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  pointerEvents: 'none',
                                  userSelect: 'none'
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '12px',
                                right: '12px',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                backdropFilter: 'blur(4px)'
                              }}>
                                <Play size={12} fill="white" />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}

          {/* Premium Glassmorphic App CTA */}
          <section style={{
            marginTop: '8rem',
            position: 'relative',
            borderRadius: '32px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'radial-gradient(circle at top left, var(--color-purple) 0%, #31151F 100%)',
            padding: '80px 40px',
            textAlign: 'center'
          }}>
            {/* Ambient Background Glows */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(242,174,48,0.15) 0%, rgba(242,174,48,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(133,58,81,0.3) 0%, rgba(133,58,81,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

            <div style={{ 
              maxWidth: '750px', 
              margin: '0 auto', 
              position: 'relative', 
              zIndex: 2,
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              padding: '48px 24px'
            }}>
              <h2 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 900, 
                color: 'white', 
                marginBottom: '1.5rem', 
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.5px',
                lineHeight: 1.2
              }}>
                Build Your Own Travel Mosaic
              </h2>
              <p style={{ 
                fontSize: '1.15rem', 
                color: 'rgba(255,255,255,0.85)', 
                marginBottom: '2.5rem', 
                lineHeight: 1.7,
                maxWidth: '600px',
                margin: '0 auto 2.5rem auto'
              }}>
                Capture your memories, map daily expenses, and automatically generate your own gorgeous, reshufflable travel mosaic on the go.
              </p>
              <Link 
                href="/tracker" 
                className="btn"
                style={{ 
                  backgroundColor: 'white', 
                  color: 'var(--color-purple)', 
                  padding: '16px 36px', 
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  borderRadius: '16px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'inline-block',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
                }}
              >
                Open Travel Tracker →
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* Glassmorphic Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0, left: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.82)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '920px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '85vh'
              }}
            >
              {/* Main Container */}
              <div style={{ display: 'flex', flex: 1, flexDirection: 'row', flexWrap: 'wrap', minHeight: 0 }}>
                
                {/* Media Pane */}
                <div style={{ 
                  flex: '1.2 1 450px', 
                  position: 'relative', 
                  backgroundColor: '#1E1B1D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '350px'
                }}>
                  {activeItem.media_type === 'image' ? (
                    <img
                      src={activeItem.media_url}
                      alt={activeItem.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '70vh' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <video
                        src={activeItem.media_url}
                        controls
                        autoPlay
                        loop
                        muted={videoMuted}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '70vh' }}
                      />
                      <button
                        onClick={() => setVideoMuted(!videoMuted)}
                        style={{
                          position: 'absolute',
                          bottom: '16px',
                          right: '16px',
                          border: 'none',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Details Pane */}
                <div style={{ 
                  flex: '0.8 1 320px', 
                  padding: '40px 32px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  backgroundColor: '#FAF9F6',
                  borderLeft: '1px solid rgba(133, 58, 81, 0.06)',
                  position: 'relative'
                }}>
                  {/* Close button inside panel for cleaner look */}
                  <button
                    onClick={() => setActiveItem(null)}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={20} />
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Header */}
                    <div>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-purple)', margin: 0, fontFamily: 'var(--font-heading)', lineHeight: 1.25 }}>
                        {activeItem.title}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-golden)', fontWeight: 700, fontSize: '0.92rem', marginTop: '8px' }}>
                        <MapPin size={14} />
                        {activeItem.location}
                      </div>
                    </div>

                    {/* Notes block */}
                    <div style={{ borderLeft: '3px solid var(--color-golden)', paddingLeft: '16px', marginTop: '10px' }}>
                      <p style={{ margin: 0, color: '#4B5563', fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{activeItem.notes}"
                      </p>
                    </div>
                  </div>

                  {/* Tags & Meta footer */}
                  <div style={{ borderTop: '1px solid rgba(133, 58, 81, 0.08)', paddingTop: '24px', marginTop: '30px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {activeItem.tags?.map(t => (
                        <span key={t} style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-purple)', backgroundColor: 'rgba(133, 58, 81, 0.06)', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>
                      <Camera size={12} /> Captured during our journeys
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
