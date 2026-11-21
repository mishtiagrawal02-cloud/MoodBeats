import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STORAGE_KEYS } from '../utils/constants';
import { notifyDataChange } from '../hooks/useUserData';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Finalizing Google sign-in…');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      return;
    }

    if (!token) {
      setError('No authentication token received from Google callback.');
      return;
    }

    try {
      // Decode JWT payload (standard base64url decode without extra libraries)
      const parts = token.split('.');
      if (parts.length >= 2) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);

        // Store JWT token
        localStorage.setItem('moodbeats:token', token);

        // Update display name
        if (payload.userName) {
          localStorage.setItem(STORAGE_KEYS.USER_NAME, payload.userName);
        }

        // Store avatar if present
        if (payload.avatarUrl) {
          localStorage.setItem('moodbeats:avatarUrl', payload.avatarUrl);
        }
        if (payload.email) {
          localStorage.setItem('moodbeats:email', payload.email);
        }

        // Notify other hooks in the app
        notifyDataChange();
        setStatusMessage('Sign-in successful! Redirecting to your dashboard…');

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        throw new Error('Malformed JWT token.');
      }
    } catch (err) {
      console.error('[AuthCallback] Failed to process token:', err);
      setError('Failed to process authentication session.');
    }
  }, [searchParams, navigate]);

  return (
    <main className="workspace-page" style={{ maxWidth: '440px', margin: '80px auto', textAlign: 'center' }}>
      <section className="workspace-panel" style={{ padding: '36px 24px' }}>
        {error ? (
          <div>
            <div style={{ fontSize: '36px', color: '#f87171', marginBottom: '16px' }}>
              <i className="fas fa-circle-xmark" />
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Authentication Failed</h2>
            <p style={{ color: 'var(--workspace-text-muted, #94a3b8)', fontSize: '14px', marginBottom: '24px' }}>
              {error}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/login', { replace: true })}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '36px', color: 'var(--workspace-amber, #e5a93c)', marginBottom: '16px' }}>
              <i className="fas fa-spinner fa-spin" />
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Signing you in</h2>
            <p style={{ color: 'var(--workspace-text-muted, #94a3b8)', fontSize: '14px', margin: 0 }}>
              {statusMessage}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default AuthCallback;
