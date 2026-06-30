'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, ShieldAlert, Film, Image as ImageIcon, CheckCircle, Database, LogOut, Key, Mail, Lock } from 'lucide-react';

export default function AdminPortal() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Navigation / View states
  // 'login' = Sign-in form
  // 'forgot' = Request password reset email
  // 'reset_password' = Enter new password (triggered by recovery email link)
  // 'dashboard' = Travel gallery upload & stats panel
  const [view, setView] = useState('login');

  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  // Gallery Upload form states
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('gold');

  // Upload action states
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Storage Stats states
  const [storageBytes, setStorageBytes] = useState(0);
  const [galleryItems, setGalleryItems] = useState([]);

  // Load Auth Session and listen for password recovery events
  useEffect(() => {
    if (!supabase) {
      setAuthError("Supabase client not initialized. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in webapp/.env.local and restart your Next.js development server (e.g. stop it with Ctrl+C and run npm run dev again).");
      setLoading(false);
      return;
    }

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user?.email === 'lostandsound25@gmail.com') {
          setSession(session);
          setView('dashboard');
          loadGalleryStats().catch(err => {
            console.error("loadGalleryStats failed:", err);
          });
        } else {
          setView('login');
        }
        setLoading(false);
      }).catch(err => {
        console.error("getSession failed:", err);
        setAuthError("Failed to fetch auth session: " + (err.message || err));
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        
        if (event === 'PASSWORD_RECOVERY') {
          setView('reset_password');
        } else if (session && session.user?.email === 'lostandsound25@gmail.com') {
          setView('dashboard');
          loadGalleryStats().catch(err => {
            console.error("loadGalleryStats onAuthStateChange failed:", err);
          });
        } else {
          setView('login');
        }
      });

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    } catch (err) {
      console.error("Auth init crash:", err);
      setAuthError("Auth initialization crash: " + (err.message || err));
      setLoading(false);
    }
  }, []);

  // Fetch upload statistics & existing list
  const loadGalleryStats = async () => {
    try {
      // 1. Fetch gallery items
      const { data: dbItems } = await supabase
        .from('gallery_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (dbItems) setGalleryItems(dbItems);

      // 2. Fetch storage bucket objects & sum size
      const { data: files, error } = await supabase.storage.from('gallery').list();
      if (!error && files) {
        const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
        setStorageBytes(totalSize);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  // Sign in handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    
    if (error) {
      setAuthError(error.message);
      setLoading(false);
    } else if (data.session?.user?.email !== 'lostandsound25@gmail.com') {
      await supabase.auth.signOut();
      setAuthError('Unauthorized email address.');
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('login');
    setFile(null);
    setFilePreview(null);
  };

  // Request password reset email handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthSuccess('Password reset link sent to your email inbox!');
    }
    setLoading(false);
  };

  // Change password handler (recovery flow)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
    } else {
      setAuthSuccess('Password updated successfully! Welcome to your dashboard.');
      setView('dashboard');
      loadGalleryStats();
      setLoading(false);
    }
  };

  // Browser-side image compression
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
          }, 'image/jpeg', 0.82);
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

    setUploadError(null);
    setUploadSuccess(false);

    try {
      if (selected.type.startsWith('video/')) {
        await validateVideoDuration(selected);
      }
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
    } catch (err) {
      setUploadError(err.message);
      e.target.value = '';
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a photo or video to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      let fileToUpload = file;

      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file);
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);

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

      setFile(null);
      setFilePreview(null);
      setTitle('');
      setLocation('');
      setNotes('');
      setTags('');
      setUploadSuccess(true);
      loadGalleryStats();
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${item.title}"?`)) return;

    try {
      const { error: dbErr } = await supabase.from('gallery_entries').delete().eq('id', item.id);
      if (dbErr) throw dbErr;

      const urlParts = item.media_url.split('/gallery/');
      if (urlParts.length > 1) {
        const storagePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('gallery').remove([storagePath]);
      }

      loadGalleryStats();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6ED', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-purple)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>Loading Portal Security...</p>
        {authError && (
          <div style={{ maxWidth: '500px', padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '16px', color: '#DC2626', fontSize: '0.9rem', fontWeight: 600, marginTop: '16px', lineHeight: 1.5 }}>
            {authError}
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: LOGIN FORM ---
  if (view === 'login') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6ED', padding: '1.5rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(133,58,81,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-purple)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Admin Portal</h1>
            <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>Sign in to manage your Travel Mosaic Gallery.</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none' }}
                  placeholder="lostandsound25@gmail.com"
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <button 
                  type="button"
                  onClick={() => { setAuthError(null); setAuthSuccess(null); setView('forgot'); }}
                  style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-golden)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Forgot?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none' }}
                  placeholder="••••••••"
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              </div>
            </div>
            
            {authError && (
              <div style={{ padding: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 600 }}>
                {authError}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700 }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW: FORGOT PASSWORD REQUEST ---
  if (view === 'forgot') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6ED', padding: '1.5rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(133,58,81,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-purple)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Reset Password</h1>
            <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>Enter your email to receive a secure password recovery link.</p>
          </div>
          
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none' }}
                  placeholder="lostandsound25@gmail.com"
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              </div>
            </div>
            
            {authError && (
              <div style={{ padding: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 600 }}>
                {authError}
              </div>
            )}

            {authSuccess && (
              <div style={{ padding: '10px', backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5', color: '#059669', borderRadius: '12px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 600 }}>
                {authSuccess}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700 }}
            >
              Send Reset Email
            </button>

            <button 
              type="button"
              onClick={() => { setAuthError(null); setAuthSuccess(null); setView('login'); }}
              style={{ padding: '10px', width: '100%', border: '1.5px solid #E5E7EB', color: '#6B7280', borderRadius: '12px', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW: CHOOSE NEW PASSWORD ---
  if (view === 'reset_password') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6ED', padding: '1.5rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(133,58,81,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-purple)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>New Password</h1>
            <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>Choose a secure new password for your admin account.</p>
          </div>
          
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none' }}
                  placeholder="Enter at least 6 characters"
                  required
                  minLength={6}
                />
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              </div>
            </div>
            
            {authError && (
              <div style={{ padding: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 600 }}>
                {authError}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700 }}
            >
              Update Password & Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW: MAIN TRAVEL GALLERY MANAGEMENT DASHBOARD ---
  const maxStorageBytes = 1024 * 1024 * 1024; // 1 GB free
  const storagePercentage = Math.min(((storageBytes / maxStorageBytes) * 100), 100).toFixed(2);
  const storageUsedMB = (storageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F6ED' }}>
      {/* Navbar deleted here because it is globally rendered in RootLayout (app/layout.jsx) */}

      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '4.5rem', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0 }}>Lost & Sound Admin</h1>
              <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700 }}>Authorized: {session?.user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                fontSize: '0.88rem', 
                fontWeight: 700, 
                color: '#EF4444', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          {/* Uploader Form Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(133, 58, 81, 0.08)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-purple)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' }}>
              <Upload size={20} /> Add Travel Moment
            </h2>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Dropzone file select */}
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
                  placeholder="e.g. Coconut americano in Bali"
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
                  placeholder="e.g. Ubud, Bali, Indonesia"
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

              {uploadError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', color: '#DC2626', fontSize: '0.85rem', fontWeight: 600 }}>
                  <ShieldAlert size={16} />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '12px', color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle size={16} />
                  <span>Published to Travel Mosaic successfully!</span>
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

          {/* Stats & Published Items List */}
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
                maxHeight: '420px',
                paddingRight: '4px'
              }}>
                {galleryItems.length === 0 ? (
                  <p style={{ color: '#9CA3AF', fontSize: '0.88rem', textAlign: 'center', marginTop: '40px' }}>No items published in the gallery yet.</p>
                ) : (
                  galleryItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', border: '1px solid #F3F4F6', borderRadius: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#E5E7EB', flexShrink: 0 }}>
                        {item.media_type === 'video' ? (
                          <video src={item.media_url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={item.media_url} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#374151', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                          {item.location}
                        </span>
                      </div>

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

      </main>
    </div>
  );
}
