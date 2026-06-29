'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, ArrowLeft, Trash2, ShieldAlert, Film, Image as ImageIcon, CheckCircle, Database } from 'lucide-react';

export default function AdminGalleryPortal() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form states
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('gold');

  // Action states
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Storage Stats states
  const [storageBytes, setStorageBytes] = useState(0);
  const [galleryItems, setGalleryItems] = useState([]);

  // Authenticate Admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user?.email !== 'lostandsound25@gmail.com') {
        router.push('/admin');
      } else {
        setSession(session);
        loadStats();
      }
      setLoading(false);
    });
  }, []);

  // Fetch upload statistics & existing list
  const loadStats = async () => {
    try {
      // 1. Fetch entries list
      const { data: dbItems } = await supabase
        .from('gallery_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (dbItems) setGalleryItems(dbItems);

      // 2. Fetch storage bucket objects & summarize size
      const { data: files, error } = await supabase.storage.from('gallery').list();
      if (!error && files) {
        const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
        setStorageBytes(totalSize);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  // Browser-side image compression using Canvas
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.82); // 82% quality compress
        };
      };
    });
  };

  // Inspect video length before uploading
  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 10.5) {
          reject(new Error('Video must be 10 seconds or shorter.'));
        } else {
          resolve();
        }
      };
      video.onerror = () => reject(new Error('Failed to load video metadata.'));
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setError(null);
    setSuccess(false);

    try {
      if (selected.type.startsWith('video/')) {
        await validateVideoDuration(selected);
      }
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
    } catch (err) {
      setError(err.message);
      e.target.value = ''; // Reset input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a photo or video to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      let fileToUpload = file;

      // Automatically compress image if it is photo type
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file);
      }

      // Generate unique file path
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload media to storage bucket 'gallery'
      const { error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);

      // Write database entry
      const cleanTags = tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const { error: dbErr } = await supabase.from('gallery_entries').insert({
        title: title.trim(),
        location: location.trim(),
        notes: notes.trim(),
        tags: cleanTags,
        dominant_color: color,
        media_type: file.type.startsWith('video/') ? 'video' : 'image',
        media_url: publicUrl
      });

      if (dbErr) throw dbErr;

      // Reset form states
      setFile(null);
      setFilePreview(null);
      setTitle('');
      setLocation('');
      setNotes('');
      setTags('');
      setSuccess(true);
      loadStats(); // Reload metrics & list
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${item.title}"?`)) return;

    try {
      // 1. Delete from database
      const { error: dbErr } = await supabase.from('gallery_entries').delete().eq('id', item.id);
      if (dbErr) throw dbErr;

      // 2. Extract path from URL and delete from storage
      // media_url format: https://.../object/public/gallery/uploads/12345_file.jpg
      const urlParts = item.media_url.split('/gallery/');
      if (urlParts.length > 1) {
        const storagePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('gallery').remove([storagePath]);
      }

      loadStats(); // Refresh
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6ED' }}>
        <p style={{ color: 'var(--color-purple)', fontWeight: 800 }}>Loading Portal Security...</p>
      </div>
    );
  }

  // Storage metric calculation variables (out of 1 GB quota)
  const maxStorageBytes = 1024 * 1024 * 1024; // 1 GB
  const storagePercentage = Math.min(((storageBytes / maxStorageBytes) * 100), 100).toFixed(2);
  const storageUsedMB = (storageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F6ED', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header navigation bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--color-purple)', fontWeight: 700, fontSize: '0.95rem' }}>
            <ArrowLeft size={16} /> Admin Portal
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', backgroundColor: 'rgba(133,58,81,0.1)', color: 'var(--color-purple)', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
              Authorized: {session?.user?.email}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          {/* Upload Form Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(133, 58, 81, 0.08)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-purple)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' }}>
              <Upload size={20} /> Add Travel Moment
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Dropzone File Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Media (Photo or Video &lt; 10s)</label>
                <div style={{
                  border: '2px dashed rgba(133,58,81,0.2)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(133,58,81,0.01)',
                  position: 'relative',
                  cursor: 'pointer'
                }} onClick={() => document.getElementById('media-upload-input').click()}>
                  <input 
                    id="media-upload-input"
                    type="file" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {filePreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      {file.type.startsWith('video/') ? (
                        <video src={filePreview} muted style={{ maxHeight: '120px', borderRadius: '12px', objectFit: 'contain' }} />
                      ) : (
                        <img src={filePreview} alt="Preview" style={{ maxHeight: '120px', borderRadius: '12px', objectFit: 'contain' }} />
                      )}
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-golden)', fontWeight: 700 }}>
                        {file.type.startsWith('video/') ? <Film size={12} style={{ display: 'inline', marginRight: '4px' }} /> : <ImageIcon size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                        {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div style={{ color: '#9CA3AF' }}>
                      <Upload size={32} style={{ margin: '0 auto 10px auto', color: 'var(--color-purple)', opacity: 0.6 }} />
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>Click or drag to select file</p>
                      <p style={{ fontSize: '0.72rem', marginTop: '4px', opacity: 0.8 }}>Images compressed on the fly. Videos must be &le; 10s.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Volcanic cloud sea at Bromo"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', fontSize: '0.92rem' }}
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mount Bromo, Indonesia"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', fontSize: '0.92rem' }}
                  required
                />
              </div>

              {/* Color Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dominant Hue</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', fontSize: '0.92rem', backgroundColor: 'white' }}
                >
                  <option value="gold">🟡 Gold / Yellow / Sunset Orange</option>
                  <option value="blue">🔵 Blue / Water / Sky</option>
                  <option value="green">🟢 Green / Nature / Jungle</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags (comma-separated)</label>
                <input 
                  type="text" 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. coffee, bali, cafe"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', fontSize: '0.92rem' }}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description Notes</label>
                <textarea 
                  rows={3}
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. The Coconut Americano was to DIE FOR..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', fontSize: '0.92rem', resize: 'vertical' }}
                />
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', color: '#DC2626', fontSize: '0.85rem', fontWeight: 600 }}>
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '12px', color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle size={16} />
                  <span>Travel moment published successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="btn btn-primary"
                style={{
                  padding: '12px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Compressing & Uploading...' : 'Publish to Gallery'}
              </button>

            </form>
          </div>

          {/* Storage & Published List Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Storage Usage monitor */}
            <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(133, 58, 81, 0.08)' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Database size={16} /> Storage Space (Supabase)
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4B5563', marginBottom: '8px', fontWeight: 700 }}>
                <span>{storageUsedMB} MB of 1024 MB Used</span>
                <span>{storagePercentage}%</span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '10px', backgroundColor: '#F3F4F6', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${storagePercentage}%`, height: '100%', backgroundColor: 'var(--color-purple)', borderRadius: '5px', transition: 'width 0.4s ease' }} />
              </div>
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '8px', margin: 0, lineHeight: 1.4 }}>
                Keep assets lightweight. High-resolution images are scaled down automatically, and video clips must not exceed 10 seconds.
              </p>
            </div>

            {/* List of published items with delete capability */}
            <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(133, 58, 81, 0.08)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Published Items ({galleryItems.length})
              </h3>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '400px',
                paddingRight: '4px'
              }}>
                {galleryItems.length === 0 ? (
                  <p style={{ color: '#9CA3AF', fontSize: '0.88rem', textAlign: 'center', marginTop: '40px' }}>No items published in the gallery yet.</p>
                ) : (
                  galleryItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', border: '1px solid #F3F4F6', borderRadius: '14px' }}>
                      {/* Media Icon/Thumbnail */}
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#E5E7EB', flexShrink: 0 }}>
                        {item.media_type === 'video' ? (
                          <video src={item.media_url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={item.media_url} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      
                      {/* Title & Location details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#374151', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                          {item.location}
                        </span>
                      </div>

                      {/* Delete Action button */}
                      <button
                        onClick={() => handleDelete(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '8px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Delete permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
