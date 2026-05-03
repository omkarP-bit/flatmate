import { useEffect, useState } from 'react';
import React from 'react';
import './App.css';
import { useAuthStore } from './store/authStore';
import { useRoomStore } from './store/roomStore';
import { useExpenseStore } from './store/expenseStore';

import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Room from './pages/Room';

type Page = 'dashboard' | 'expenses' | 'payments' | 'history' | 'profile' | 'room';

function getInitialPage(): string {
  const path = window.location.pathname;
  if (path === '/callback') return 'callback';
  if (path === '/login')    return 'login';
  return 'dashboard';
}

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { fetchMyRooms, activeRoomId } = useRoomStore();
  const { fetchExpenses, fetchMyBalance, fetchSuggestions } = useExpenseStore();

  const [page, setPage] = useState<string>(getInitialPage);

  // On auth → load rooms
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyRooms();
    }
  }, [isAuthenticated]);

  // On active room change → load expenses + balance
  useEffect(() => {
    if (activeRoomId) {
      fetchExpenses(activeRoomId);
      fetchMyBalance(activeRoomId);
      fetchSuggestions(activeRoomId);
    }
  }, [activeRoomId]);

  // Unauthenticated routes
  if (page === 'callback') return <Callback onSuccess={() => setPage('dashboard')} />;
  if (!isAuthenticated)    return <Login />;

  const renderPage = () => {
    switch (page as Page) {
      case 'dashboard': return <Dashboard onNavigate={p => setPage(p)} />;
      case 'expenses':  return <Expenses />;
      case 'payments':  return <Payments />;
      case 'profile':   return <Profile />;
      case 'room':      return <Room />;
      default:          return <Dashboard onNavigate={p => setPage(p)} />;
    }
  };

  return (
    <div style={styles.app}>
      <Sidebar activePage={page as Page} onNavigate={p => setPage(p)} />
      <div style={styles.main}>
        {renderPage()}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app:  { display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
};

