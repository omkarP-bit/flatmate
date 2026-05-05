import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/userApi';

export function useAuth() {
  const { user, token, isAuthenticated, setUser, clearAuth } = useAuthStore();

  const refreshUser = async () => {
    try {
      const updated = await userApi.getMe();
      setUser(updated);
      return updated;
    } catch {
      return null;
    }
  };

  const signOut = () => {
    clearAuth();
    const domain   = import.meta.env.VITE_COGNITO_DOMAIN;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logout   = `${window.location.origin}/login`;
    window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logout)}`;
  };

  return { user, token, isAuthenticated, refreshUser, signOut };
}