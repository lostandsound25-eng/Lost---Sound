'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function RecoverPage() {
  const [status, setStatus] = useState('initializing');
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    async function runRecovery() {
      if (!supabase) {
        setStatus('error');
        addLog("Supabase client not initialized.");
        return;
      }

      setStatus('running');
      addLog("Starting Yogyakarta Hotel (Day 3/5) photo optimization...");

      const entryId = "79704f59-d1aa-4c77-b6bb-c71fbe5bfc90";
      const tripId = "fa31fe5e-ff15-4b38-86ea-0afd99eeb7ae";

      // 1. Fetch the entry
      addLog(`Fetching database entry: ${entryId}...`);
      const { data: entry, error: fetchErr } = await supabase
        .from('trip_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (fetchErr) {
        setStatus('error');
        addLog(`Error fetching entry: ${fetchErr.message || fetchErr.toString()}`);
        return;
      }

      addLog(`Found entry: "${entry.title}"`);

      function base64ToBlob(base64DataUrl) {
        const parts = base64DataUrl.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
      }

      const updatedData = {};
      let needsUpdate = false;

      // Migrate photo_url
      if (entry.photo_url && entry.photo_url.startsWith('data:image/')) {
        addLog("Uploading main photo to storage...");
        try {
          const blob = base64ToBlob(entry.photo_url);
          const path = `${tripId}/${entry.id}_url_thumb.jpg`;
          const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, blob, { contentType: "image/jpeg", upsert: true });
          if (uploadErr) throw uploadErr;
          
          const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(path);
          updatedData.photo_url = publicUrl;
          needsUpdate = true;
          addLog(`Main photo uploaded successfully: ${publicUrl.substring(0, 60)}...`);
        } catch (e) {
          setStatus('error');
          addLog(`Failed to upload main photo: ${e.message || e.toString()}`);
          return;
        }
      }

      // Migrate photo_urls
      if (Array.isArray(entry.photo_urls) && entry.photo_urls.some(url => url && url.startsWith('data:image/'))) {
        addLog("Uploading photo_urls array...");
        const nextUrls = [];
        let index = 0;
        let modified = false;
        for (const url of entry.photo_urls) {
          if (url && url.startsWith('data:image/')) {
            try {
              const blob = base64ToBlob(url);
              const path = `${tripId}/${entry.id}_${index}_thumb.jpg`;
              const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, blob, { contentType: "image/jpeg", upsert: true });
              if (uploadErr) throw uploadErr;
              
              const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(path);
              nextUrls.push(publicUrl);
              modified = true;
              needsUpdate = true;
              addLog(`Uploaded thumbnail index ${index}: ${publicUrl.substring(0, 60)}...`);
            } catch (e) {
              setStatus('error');
              addLog(`Failed to upload thumbnail index ${index}: ${e.message || e.toString()}`);
              return;
            }
          } else {
            nextUrls.push(url);
          }
          index++;
        }
        if (modified) {
          updatedData.photo_urls = nextUrls;
        }
      }

      // Migrate photo_urls_full
      if (Array.isArray(entry.photo_urls_full) && entry.photo_urls_full.some(url => url && url.startsWith('data:image/'))) {
        addLog("Uploading photo_urls_full array...");
        const nextFullUrls = [];
        let index = 0;
        let modified = false;
        for (const url of entry.photo_urls_full) {
          if (url && url.startsWith('data:image/')) {
            try {
              const blob = base64ToBlob(url);
              const path = `${tripId}/${entry.id}_${index}_full.jpg`;
              const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, blob, { contentType: "image/jpeg", upsert: true });
              if (uploadErr) throw uploadErr;
              
              const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(path);
              nextFullUrls.push(publicUrl);
              modified = true;
              needsUpdate = true;
              addLog(`Uploaded full-res image index ${index}: ${publicUrl.substring(0, 60)}...`);
            } catch (e) {
              setStatus('error');
              addLog(`Failed to upload full-res image index ${index}: ${e.message || e.toString()}`);
              return;
            }
          } else {
            nextFullUrls.push(url);
          }
          index++;
        }
        if (modified) {
          updatedData.photo_urls_full = nextFullUrls;
        }
      }

      if (needsUpdate) {
        addLog("Saving updated URLs to the database entry...");
        updatedData.has_photo = true;
        const { error: updateErr } = await supabase
          .from('trip_entries')
          .update(updatedData)
          .eq('id', entryId);

        if (updateErr) {
          setStatus('error');
          addLog(`Error saving to database: ${updateErr.message || updateErr.toString()}`);
          return;
        }

        setStatus('success');
        addLog("Optimization complete! The entry is fully cleaned up.");
      } else {
        setStatus('success');
        addLog("No base64 data found to clean up. Entry is already clean!");
      }
    }

    runRecovery();
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      margin: '40px auto',
      padding: '24px',
      backgroundColor: '#f9fafb',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb'
    }}>
      <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#111827' }}>
        Database Photo Optimization
      </h1>
      
      <div style={{
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: 'bold',
        marginBottom: '20px',
        backgroundColor: 
          status === 'success' ? '#def7ec' :
          status === 'error' ? '#fde8e8' : '#e1effe',
        color:
          status === 'success' ? '#03543f' :
          status === 'error' ? '#9b1c1c' : '#1e429f'
      }}>
        Status: {status.toUpperCase()}
      </div>

      <div style={{
        backgroundColor: '#1f2937',
        color: '#f9fafb',
        fontFamily: 'monospace',
        padding: '16px',
        borderRadius: '8px',
        minHeight: '200px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{log}</div>
        ))}
      </div>

      {status === 'success' && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#4b5563', fontSize: '14px' }}>
            The database size has been optimized. You can close this page and return to the app.
          </p>
          <a href={`/tracker/trip/fa31fe5e-ff15-4b38-86ea-0afd99eeb7ae`} style={{
            display: 'inline-block',
            backgroundColor: '#6b21a8',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            marginTop: '8px'
          }}>
            Return to Trip
          </a>
        </div>
      )}
    </div>
  );
}
