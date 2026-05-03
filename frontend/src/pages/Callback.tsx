import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/userApi';
import Loader from '../components/common/Loader';

interface CallbackProps {
  onSuccess: () => void;
}

export default function Callback({ onSuccess }: CallbackProps) {
  const { setToken, setUser } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) { window.location.href = '/login'; return; }

    exchangeCode(code);
  }, []);

  const exchangeCode = async (code: string) => {
    try {
      const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
      const clientId      = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const redirectUri   = import.meta.env.VITE_REDIRECT_URI ?? `${window.location.origin}/callback`;

      const body = new URLSearchParams({
        grant_type:   'authorization_code',
        client_id:    clientId,
        redirect_uri: redirectUri,
        code,
      });

      const res = await fetch(`${cognitoDomain}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const tokens = await res.json();
      if (!tokens.id_token) throw new Error('No id_token returned');

      setToken(tokens.id_token);

      // Decode JWT payload to get name + email
      const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
      const user = await userApi.createOrGet({ name: payload.name ?? payload.email, email: payload.email });
      setUser(user);

      onSuccess();
    } catch (err) {
      console.error('Auth callback failed:', err);
      window.location.href = '/login';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader size={32} />
        <p style={{ color: '#5a5a58', fontSize: 14 }}>Signing you in…</p>
      </div>
    </div>
  );
}