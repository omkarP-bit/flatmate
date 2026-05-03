import React from 'react';
export default function Login() {
  const cognitoDomain  = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId       = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const redirectUri    = import.meta.env.VITE_REDIRECT_URI ?? `${window.location.origin}/callback`;

  const handleLogin = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id:     clientId,
      redirect_uri:  redirectUri,
      scope:         'openid email profile',
      identity_provider: 'Google',
    });
    window.location.href = `${cognitoDomain}/oauth2/authorize?${params}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>F</div>
          <span style={styles.logoName}>Flatmate</span>
        </div>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Sign in to manage your flat expenses and settle up with flatmates.</p>
        <button style={styles.googleBtn} onClick={handleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8L6 33.3C9.3 39.6 16.1 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Continue with Google
        </button>
        <p style={styles.terms}>By signing in you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f4f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '2.5rem 2rem', width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' },
  logoBox: { width: 36, height: 36, background: '#ccff00', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#000' },
  logoName: { fontSize: 18, fontWeight: 600 },
  heading: { fontSize: 24, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.02em' },
  sub: { fontSize: 14, color: '#5a5a58', lineHeight: 1.5, marginBottom: '1.75rem' },
  googleBtn: { width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' },
  terms: { fontSize: 11, color: '#9a9a98', marginTop: '1rem', textAlign: 'center', lineHeight: 1.5 },
};

