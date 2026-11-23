import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { STORAGE_KEYS } from '../utils/constants';
import { notifyDataChange } from '../hooks/useUserData';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'consent_denied' || errorParam === 'access_denied') {
        setError('Google sign-in was cancelled. Please try again.');
      } else if (errorParam === 'invalid_oauth_state') {
        setError('Security check failed (invalid state). Please try again.');
      } else {
        setError(`Sign-in error: ${decodeURIComponent(errorParam)}`);
      }
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    // Initiate Google OAuth 2.0 flow via backend
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:3001';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleUsernameLogin = async (e) => {
    e.preventDefault();
    const trimmed = userName.trim();
    if (!trimmed) {
      setError('Please enter a username.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.data?.token) {
        localStorage.setItem('moodbeats:token', data.data.token);
      }
      localStorage.setItem(STORAGE_KEYS.USER_NAME, data.data?.user?.userName || trimmed);
      notifyDataChange();
      navigate('/dashboard');
    } catch (err) {
      // If backend is offline or unconfigured, allow local login
      localStorage.setItem(STORAGE_KEYS.USER_NAME, trimmed);
      notifyDataChange();
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="workspace-page" style={{ maxWidth: '480px', margin: '40px auto' }}>
      <section className="workspace-panel" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--workspace-amber, #e5a93c)' }}>
            <i className="fas fa-wave-square" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 8px 0' }}>Welcome to MoodBeats</h1>
          <p style={{ color: 'var(--workspace-text-muted, #94a3b8)', margin: 0, fontSize: '14px' }}>
            Sign in to synchronize your study sessions, goals, and focus analytics.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="fas fa-circle-exclamation" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          {/* Google "G" SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: 'var(--workspace-border, #334155)'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--workspace-border, #334155)' }} />
          <span style={{ padding: '0 12px', fontSize: '12px', color: 'var(--workspace-text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            or continue as guest
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--workspace-border, #334155)' }} />
        </div>

        {/* Username Login Form */}
        <form onSubmit={handleUsernameLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="login-username" style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--workspace-text, #f1f5f9)' }}>
              Username
            </label>
            <input
              id="login-username"
              type="text"
              className="workspace-select"
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="e.g. Alex"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={loading}
              maxLength={60}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/dashboard" style={{ fontSize: '13px', color: 'var(--workspace-text-muted, #94a3b8)', textDecoration: 'none' }}>
            Skip to Dashboard &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Login;
