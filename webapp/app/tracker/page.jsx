'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { parseExpense, getCategoryEmoji } from '@/utils/trackerParser';

export default function Tracker() {
  const [expenses, setExpenses] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from cache first for speed
    const cached = localStorage.getItem('ls_expenses');
    if (cached) setExpenses(JSON.parse(cached));
    
    if (supabase) {
      fetchExpenses();
    }
  }, []);

  const fetchExpenses = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', today)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setExpenses(data);
      localStorage.setItem('ls_expenses', JSON.stringify(data));
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const lastCategory = localStorage.getItem('ls_lastCategory') || 'other';
    const parsed = parseExpense(input, lastCategory);

    if (!parsed) {
      alert("Oops! Try something like '15 lunch' or '5 coffee'");
      return;
    }

    // Save locally immediately (Optimistic)
    const tempId = Date.now().toString();
    const optimisticExpense = { id: tempId, created_at: new Date().toISOString(), ...parsed };
    const updatedExpenses = [optimisticExpense, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem('ls_expenses', JSON.stringify(updatedExpenses));
    localStorage.setItem('ls_lastCategory', parsed.category);
    setInput('');

    // Sync to Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ 
          amount: parsed.amount,
          category: parsed.category,
          subcategories: parsed.subcategories,
          note: parsed.note,
          raw_input: parsed.raw_input,
          date: new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) {
        console.error(error);
        // If error, revert local state
        setExpenses(expenses);
      } else if (data) {
        // Replace optimistic entry with real one
        setExpenses(prev => prev.map(e => e.id === tempId ? data[0] : e));
      }
    }
  };

  const totalToday = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-purple)', color: 'white', padding: '100px 0 120px' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        
        {/* Header Stats */}
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', opacity: 0.6, marginBottom: '10px' }}>Today's Spend</p>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 800, margin: 0 }}>${totalToday.toFixed(2)}</h1>
        </header>

        {/* Input Area */}
        <div style={{ marginBottom: '40px' }}>
          <form onSubmit={handleSubmit}>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 15 dinner or 5.50 coffee"
              style={{ 
                width: '100%', 
                padding: '24px', 
                borderRadius: '25px', 
                border: 'none', 
                fontSize: '1.2rem', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
              autoFocus
            />
          </form>
        </div>

        {/* Breakdown List */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {expenses.map(expense => (
            <div key={expense.id} style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '20px', 
              borderRadius: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>{getCategoryEmoji(expense.category)}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{expense.note || expense.category}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5 }}>{expense.category}</p>
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                ${expense.amount.toFixed(2)}
              </div>
            </div>
          ))}

          {expenses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.4 }}>
              <p>Nothing tracked today yet.</p>
            </div>
          )}
        </div>

      </div>

      {/* Floating Brand Footer */}
      <footer style={{ position: 'fixed', bottom: '30px', left: 0, right: 0, textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', opacity: 0.3, letterSpacing: '3px', textTransform: 'uppercase' }}>Lost & Sound Nomad Tracker</p>
      </footer>
    </main>
  );
}
