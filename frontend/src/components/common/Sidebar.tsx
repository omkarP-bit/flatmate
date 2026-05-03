import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import Avatar from './Avatar';

type Page = 'dashboard' | 'expenses' | 'payments' | 'history' | 'profile' | 'room';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NAV = [
  { id: 'dashboard' as Page, label: 'Dashboard',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> },
  { id: 'expenses' as Page, label: 'Expenses',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h12M2 8h8M2 11h5"/></svg> },
  { id: 'payments' as Page, label: 'Payments',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12M3 7l5-5 5 5"/></svg> },
  { id: 'history' as Page, label: 'History',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg> },
];

const ROOM_COLORS = ['#ccff00','#7F77DD','#EF9F27','#378ADD','#639922'];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { user } = useAuthStore();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoBox}>F</div>
        <span style={styles.logoName}>Flatmate</span>
      </div>

      <div style={styles.section}>Menu</div>
      {NAV.map(item => (
        <div key={item.id} style={{ ...styles.navItem, ...(activePage === item.id ? styles.active : {}) }}
          onClick={() => onNavigate(item.id)}>
          <span style={{ opacity: activePage === item.id ? 1 : 0.5, display: 'flex' }}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div style={{ ...styles.section, marginTop: '0.5rem' }}>My rooms</div>
      {rooms.map((room, i) => (
        <div key={room.id}
          style={{ ...styles.roomItem, ...(activeRoomId === room.id ? styles.active : {}) }}
          onClick={() => setActiveRoom(room.id)}>
          <div style={{ ...styles.dot, background: ROOM_COLORS[i % ROOM_COLORS.length] }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
        </div>
      ))}
      <div style={styles.roomAdd} onClick={() => onNavigate('room')}>
        <div style={styles.dotEmpty} />
        + Join or create
      </div>

      <div style={styles.userRow}>
        {user && <Avatar name={user.name} userId={user.id} avatarUrl={user.avatar_url} size={30} />}
        <div style={{ minWidth: 0 }}>
          <div style={styles.userName}>{user?.name ?? 'Loading…'}</div>
          <div style={styles.userEmail}>{user?.email ?? ''}</div>
        </div>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: { width: 'var(--sidebar-w)', background: 'var(--bg-primary)', borderRight: '0.5px solid var(--border-light)', display: 'flex', flexDirection: 'column', padding: '1.25rem 0', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 1.25rem 1.25rem', borderBottom: '0.5px solid var(--border-light)', marginBottom: '0.5rem' },
  logoBox: { width: 32, height: 32, background: '#ccff00', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#000' },
  logoName: { fontSize: 15, fontWeight: 600 },
  section: { padding: '0.85rem 1.1rem 0.35rem', fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 0.85rem', margin: '0 0.5rem 1px', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--text-secondary)', cursor: 'pointer' },
  active: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 500 },
  roomItem: { display: 'flex', alignItems: 'center', gap: 9, padding: '0.4rem 0.85rem', margin: '0 0.5rem 1px', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  dotEmpty: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0, border: '1px dashed var(--border-mid)' },
  roomAdd: { display: 'flex', alignItems: 'center', gap: 9, padding: '0.4rem 0.85rem', margin: '0 0.5rem', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-tertiary)', cursor: 'pointer' },
  userRow: { marginTop: 'auto', borderTop: '0.5px solid var(--border-light)', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: 10 },
  userName: { fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};

import React from 'react';