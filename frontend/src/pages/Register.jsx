import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, setToken } from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const r = await auth.register({ name, email, password });
      setToken(r.token);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.body?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-lg)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>Create Account</h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--spacing-md)',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} className="flex" style={{ flexDirection: 'column' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Full Name</label>
            <input 
              type="text" 
              required
              placeholder="John Doe" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
            <input 
              type="email" 
              required
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              required
              placeholder="Create a password (min 6 chars)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
            Sign Up
          </button>
        </form>

        <p style={{ marginTop: 'var(--spacing-md)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
