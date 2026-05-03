'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewItinerary() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  
  // Days Array
  const [days, setDays] = useState([
    { title: '', location: '', description: '' }
  ]);

  const handleAddDay = () => {
    setDays([...days, { title: '', location: '', description: '' }]);
  };

  const handleDayChange = (index, field, value) => {
    const newDays = [...days];
    newDays[index][field] = value;
    setDays(newDays);
  };

  const handleRemoveDay = (index) => {
    const newDays = days.filter((_, i) => i !== index);
    setDays(newDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.from('itineraries').insert([
      {
        title,
        slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        destination,
        duration_days: parseInt(duration),
        description,
        content: { days },
        is_published: true
      }
    ]);

    if (error) {
      console.error('Error saving itinerary:', error);
      alert('Error saving itinerary. Check console.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-purple)', fontFamily: 'var(--font-heading)' }}>Create New Itinerary</h1>
          <button 
            onClick={() => router.push('/admin')}
            style={{ padding: '0.5rem 1rem', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: 500 }}
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Basic Info Section */}
          <div style={{ padding: '1.5rem', border: '1px solid #F3F4F6', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Basic Details</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }} placeholder="e.g. 7 Days in Sunny California" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>URL Slug</label>
                <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }} placeholder="e.g. california-road-trip" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Destination</label>
                <input required type="text" value={destination} onChange={e => setDestination(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }} placeholder="e.g. California, USA" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Duration (Days)</label>
                <input required type="number" value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }} placeholder="e.g. 7" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Short Description</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', minHeight: '100px' }} placeholder="A brief summary for the preview card..."></textarea>
            </div>
          </div>

          {/* Day by Day Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Day-by-Day Itinerary</h2>
              <button type="button" onClick={handleAddDay} style={{ color: 'var(--color-orange)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Another Day</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {days.map((day, index) => (
                <div key={index} style={{ padding: '1.5rem', border: '1px solid #E5E7EB', borderRadius: '12px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-12px', left: '16px', background: 'white', padding: '0 8px', fontWeight: 600, color: 'var(--color-purple)' }}>Day {index + 1}</div>
                  
                  {days.length > 1 && (
                    <button type="button" onClick={() => handleRemoveDay(index)} style={{ position: 'absolute', top: '16px', right: '16px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>Remove</button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Day Title</label>
                      <input type="text" value={day.title} onChange={e => handleDayChange(index, 'title', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }} placeholder="e.g. Arrival & Exploring" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Specific Location</label>
                      <input type="text" value={day.location} onChange={e => handleDayChange(index, 'location', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }} placeholder="e.g. Los Angeles" required />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Activities & Details</label>
                    <textarea value={day.description} onChange={e => handleDayChange(index, 'description', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', minHeight: '100px' }} placeholder="What are we doing today?..." required></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.125rem', fontWeight: 700, marginTop: '1rem' }}>
            {loading ? 'Saving...' : 'Publish Itinerary'}
          </button>
        </form>
      </div>
    </div>
  );
}
