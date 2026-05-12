'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { parseExpense, getCategoryEmoji } from '../../utils/trackerParser';

export default function NomadTracker() {
  const [expenses, setExpenses] = useState([]);
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  // Initialize and load from LocalStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ls_nomad_expenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    }
  }, []);

  // Save to LocalStorage whenever expenses change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('ls_nomad_expenses', JSON.stringify(expenses));
    }
  }, [expenses, mounted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const lastCategory = localStorage.getItem('ls_lastCategory') || 'other';
    const parsed = parseExpense(input, lastCategory);

    if (!parsed) return;

    const newExpense = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...parsed
    };

    setExpenses([newExpense, ...expenses]);
    localStorage.setItem('ls_lastCategory', parsed.category);
    setInput('');
    inputRef.current?.focus();
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalToday = expenses
    .filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amount, 0);

  if (!mounted) return null;

  return (
    <main style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--color-bg)', 
      color: 'var(--color-text)',
      paddingBottom: '100px'
    }}>
      
      <section style={{ 
        backgroundColor: 'var(--color-purple)', 
        color: 'white', 
        padding: '80px 24px 60px',
        borderRadius: '0 0 60px 60px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(133, 58, 81, 0.1)'
      }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <Link href="/" style={{ opacity: 0.8, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'white', marginBottom: '30px', display: 'inline-block' }}>
            ← Back to Lost & Sound
          </Link>
          <p style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.8rem', opacity: 0.7, marginBottom: '10px' }}>
            Today's Spend
          </p>
          <h1 style={{ fontSize: '5rem', fontWeight: 900, margin: 0, color: 'var(--color-golden)' }}>
            ${totalToday.toFixed(2)}
          </h1>
        </div>
      </section>

      <section className="container" style={{ maxWidth: '600px', marginTop: '-40px' }}>
        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Log something... (e.g. 15 lunch)"
            style={{ 
              width: '100%', 
              padding: '24px 30px', 
              borderRadius: '30px', 
              border: 'none', 
              fontSize: '1.25rem', 
              backgroundColor: 'white',
              color: 'var(--color-purple)',
              outline: 'none',
              boxShadow: '0 15px 45px rgba(0,0,0,0.1)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600
            }}
            autoFocus
          />
          <button 
            type="submit"
            style={{ 
              position: 'absolute', 
              right: '10px', 
              top: '10px', 
              bottom: '10px',
              backgroundColor: 'var(--color-orange)',
              color: 'white',
              border: 'none',
              borderRadius: '22px',
              padding: '0 25px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </form>
      </section>

      <section className="container" style={{ maxWidth: '600px', marginTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Recent Activity</h2>
          <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>{expenses.length} logs</span>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-card" style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '25px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'var(--color-bg)', 
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {getCategoryEmoji(expense.category)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-purple)' }}>
                    {expense.note || expense.category}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5, textTransform: 'capitalize' }}>
                    {new Date(expense.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {expense.category}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-orange)' }}>
                  ${expense.amount.toFixed(2)}
                </div>
                <button 
                  onClick={() => deleteExpense(expense.id)}
                  style={{ background: 'none', border: 'none', color: '#ff4444', opacity: 0.3, cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {expenses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 24px', opacity: 0.5 }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌍</div>
              <h3 style={{ marginBottom: '10px' }}>Ready for adventure?</h3>
              <p>Your logged expenses will show up here.</p>
            </div>
          )}
        </div>
      </section>

      <footer style={{ marginTop: '60px', textAlign: 'center', padding: '0 24px' }}>
        <p style={{ 
          fontSize: '0.9rem', 
          opacity: 0.6, 
          maxWidth: '400px', 
          margin: '0 auto',
          lineHeight: '1.6',
          fontStyle: 'italic'
        }}>
          "Keep going." — Data is stored locally on this device.
        </p>
      </footer>
    </main>
  );
}
