'use client';
import React, { useState, useEffect, useRef } from 'react';

// Icons as minimal inline SVGs
const MicIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const StarIcon = ({ filled }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke={filled ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

// Categories Setup
const CATEGORIES = ['Food & Drink', 'Transportation', 'Accommodation', 'Activities', 'Miscellaneous'];
const CATEGORY_COLORS = {
  'Food & Drink': '#F59E0B',
  'Transportation': '#3B82F6',
  'Accommodation': '#8B5CF6',
  'Activities': '#10B981',
  'Miscellaneous': '#6B7280'
};

// Simple Mock Currency Converter
const RATES = { PHP: 0.017, THB: 0.027, EUR: 1.08, JPY: 0.0065, USD: 1 };

export default function TrackerApp() {
  const [expenses, setExpenses] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'voice' or 'manual'
  
  // Trip State (Mocked for V1)
  const trip = { name: "Southeast Asia 2026", daysActive: 14, homeCurrency: 'USD', localCurrency: 'PHP' };

  useEffect(() => {
    // Load offline data
    const saved = localStorage.getItem('tracker_expenses');
    if (saved) setExpenses(JSON.parse(saved));
    setIsMounted(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tracker_expenses', JSON.stringify(expenses));
    }
  }, [expenses, isMounted]);

  const addExpense = (newExpense) => {
    const expense = {
      ...newExpense,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      amountUSD: newExpense.amount * (RATES[newExpense.currency] || 1)
    };
    setExpenses(prev => [expense, ...prev]);
    setActiveModal(null);
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Calculations
  const today = new Date().toLocaleDateString();
  const todaysExpenses = expenses.filter(e => new Date(e.timestamp).toLocaleDateString() === today);
  const todayTotal = todaysExpenses.reduce((sum, e) => sum + e.amountUSD, 0);
  
  const tripTotal = expenses.reduce((sum, e) => sum + e.amountUSD, 0);
  const dailyAverage = tripTotal / trip.daysActive || 0;

  if (!isMounted) return <div style={{ minHeight: '100vh', background: '#f8f9fa' }} />;

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      position: 'relative',
      fontFamily: 'var(--font-body), system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{ padding: '40px 24px 20px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>
          {trip.name}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '4px' }}>Today's Spend</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              ${todayTotal.toFixed(2)}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Daily Avg</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#4B5563' }}>${dailyAverage.toFixed(2)}</p>
          </div>
        </div>
      </header>

      {/* Main Content Scrollable */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: '120px' }}>
        
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#9CA3AF' }}>
            <p style={{ fontSize: '1.1rem' }}>No expenses logged yet.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Tap the mic to add your first expense.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Recent</h3>
            
            {expenses.map(expense => (
              <div key={expense.id} style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ width: '4px', height: '100%', backgroundColor: CATEGORY_COLORS[expense.category], position: 'absolute', left: 0, top: 0 }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>{expense.note || expense.category}</span>
                    {expense.worthIt && <StarIcon filled />}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{expense.category}</span>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
                    ${expense.amountUSD.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                    {expense.amount} {expense.currency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        zIndex: 100
      }}>
        <button 
          onClick={() => setActiveModal('manual')}
          style={{
            width: '56px', height: '56px',
            borderRadius: '50%',
            backgroundColor: 'white',
            color: 'var(--color-purple)',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <PlusIcon />
        </button>

        <button 
          onClick={() => setActiveModal('voice')}
          style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-purple)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
          onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MicIcon />
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'manual' && <ManualEntryModal onClose={() => setActiveModal(null)} onSave={addExpense} trip={trip} />}
      {activeModal === 'voice' && <VoiceEntryModal onClose={() => setActiveModal(null)} onSave={addExpense} trip={trip} />}
    </div>
  );
}

// --- MANUAL ENTRY MODAL ---
function ManualEntryModal({ onClose, onSave, trip }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [worthIt, setWorthIt] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    onSave({
      amount: parseFloat(amount),
      currency: trip.localCurrency,
      category,
      note,
      worthIt
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white', width: '100%', maxWidth: '480px',
        borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
        padding: '24px', animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Quick Add</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9CA3AF' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #E5E7EB', paddingBottom: '8px' }}>
            <span style={{ fontSize: '2rem', color: '#6B7280', marginRight: '8px' }}>{trip.localCurrency}</span>
            <input 
              type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00" autoFocus
              style={{ flex: 1, border: 'none', fontSize: '2.5rem', fontWeight: 700, outline: 'none', width: '100%' }}
            />
          </div>

          <input 
            type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder="What was it for?"
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '1.1rem', outline: 'none' }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(cat => (
              <button 
                key={cat} type="button" onClick={() => setCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', border: '1px solid',
                  fontSize: '0.9rem', fontWeight: 500,
                  backgroundColor: category === cat ? CATEGORY_COLORS[cat] : 'white',
                  borderColor: category === cat ? CATEGORY_COLORS[cat] : '#E5E7EB',
                  color: category === cat ? 'white' : '#4B5563',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#FFFBEB', borderRadius: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={worthIt} onChange={e => setWorthIt(e.target.checked)} style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '1.1rem', color: '#92400E', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StarIcon filled={worthIt} /> Mark as "Worth It"
            </span>
          </label>

          <button type="submit" style={{
            padding: '18px', backgroundColor: 'var(--color-purple)', color: 'white',
            borderRadius: '16px', fontSize: '1.2rem', fontWeight: 700, border: 'none', marginTop: '8px'
          }}>
            Save Expense
          </button>
        </form>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// --- VOICE ENTRY MODAL ---
function VoiceEntryModal({ onClose, onSave, trip }) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    // Fake the speech recognition for rapid prototyping if API not supported,
    // or we can just use a text input to simulate speech in the prototype.
    // Real implementation would use window.SpeechRecognition.
  }, []);

  // Simple Regex Parser
  const handleParse = (text) => {
    let worthIt = false;
    let modifiedText = text.toLowerCase();
    
    if (modifiedText.includes('worth it')) {
      worthIt = true;
      modifiedText = modifiedText.replace('worth it', '').trim();
    }

    const amountMatch = modifiedText.match(/\\d+(\\.\\d{1,2})?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;

    let currency = trip.localCurrency;
    if (modifiedText.includes('usd') || modifiedText.includes('dollar')) currency = 'USD';
    
    let category = 'Miscellaneous';
    if (/(latte|coffee|tacos|breakfast|dinner|lunch|food|meal|beer|drink|water|cafe)/.test(modifiedText)) category = 'Food & Drink';
    else if (/(ferry|bus|grab|taxi|flight|train|scooter|gas|fuel|ride)/.test(modifiedText)) category = 'Transportation';
    else if (/(hostel|hotel|stay|airbnb|room)/.test(modifiedText)) category = 'Accommodation';
    else if (/(surf|massage|tour|ticket|museum|hike|guide|rental)/.test(modifiedText)) category = 'Activities';

    let note = text;
    if (amountMatch) note = note.replace(amountMatch[0], '');
    note = note.replace(/(worth it|pesos|peso|baht|euro|euros|yen)/ig, '').trim();

    setParsedData({ amount, currency, category, note, worthIt });
  };

  const handleSimulateVoice = (e) => {
    const text = e.target.value;
    setTranscript(text);
    handleParse(text);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem' }}>×</button>
      </div>

      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', animation: 'pulse 2s infinite' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-purple)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MicIcon />
        </div>
      </div>

      <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 400, marginBottom: '40px' }}>
        Listening...
      </h2>

      {/* Simulator input for prototype testing */}
      <input 
        type="text" 
        value={transcript}
        onChange={handleSimulateVoice}
        placeholder="Type here to simulate voice (e.g. '300 pesos latte worth it')"
        autoFocus
        style={{
          width: '90%', maxWidth: '400px', padding: '16px', borderRadius: '12px',
          border: 'none', fontSize: '1.2rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', outline: 'none'
        }}
      />

      {parsedData && parsedData.amount > 0 && (
        <div style={{ marginTop: '40px', backgroundColor: 'white', borderRadius: '24px', padding: '24px', width: '90%', maxWidth: '400px', animation: 'slideUp 0.3s ease-out' }}>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Parsed Result</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            {parsedData.amount} {parsedData.currency}
          </div>
          <div style={{ fontSize: '1.1rem', color: '#4B5563', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {parsedData.note || parsedData.category} 
            {parsedData.worthIt && <StarIcon filled />}
          </div>
          <div style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: CATEGORY_COLORS[parsedData.category], color: 'white', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
            {parsedData.category}
          </div>

          <button 
            onClick={() => onSave(parsedData)}
            style={{ width: '100%', padding: '16px', backgroundColor: '#111827', color: 'white', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, border: 'none', marginTop: '24px' }}
          >
            Confirm & Save
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); } }
      `}</style>
    </div>
  );
}
