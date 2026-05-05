import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/userApi';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

type Section = 'profile' | 'notifications' | 'payment' | 'activity';

const NAV: Array<{ id: Section; label: string }> = [
  { id: 'profile',       label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'payment',       label: 'Payment info' },
  { id: 'activity',      label: 'Activity log' },
];

export default function Profile() {
  const { user, refreshUser, signOut } = useAuth();
  const [active,  setActive]  = useState<Section>('profile');
  const [name,    setName]    = useState(user?.name ?? '');
  const [phone,   setPhone]   = useState(user?.phone ?? '');
  const [upi,     setUpi]     = useState(user?.upi_id ?? '');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [notifs,  setNotifs]  = useState({ newExpense: true, paymentReceived: true, smartReminders: true, weekly: false });

  const saveProfile = async () => {
    setSaving(true);
    try {
      await userApi.updateMe({ name, phone, upi_id: upi });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const saveUpi = async () => {
    setSaving(true);
    try {
      await userApi.updateMe({ upi_id: upi });
      await refreshUser();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.page}>
      <header style={s.topbar}>
        <div style={s.topLeft}>
          <span style={s.breadcrumb}>Account</span>
          <span style={s.sep}>/</span>
          <span style={s.pageTitle}>Profile & settings</span>
        </div>
        {saved && <span style={s.savedTag}>Saved!</span>}
      </header>

      <div style={s.content}>

        {/* Settings nav */}
        <div style={s.settingsNav}>
          {NAV.map(n => (
            <div key={n.id} onClick={() => setActive(n.id)}
              style={{ ...s.navItem, ...(active === n.id ? s.navItemActive : {}) }}>
              {n.label}
            </div>
          ))}
          <div style={s.navDivider} />
          <div style={{ ...s.navItem, color: 'var(--text-danger)', cursor: 'pointer' }}
            onClick={signOut}>
            Sign out
          </div>
        </div>

        {/* Panels */}
        <div style={s.panels}>

          {/* Profile */}
          <div style={s.card}>
            <div style={s.cardTitle}>Your profile</div>
            <div style={s.avatarSection}>
              {user && <Avatar name={user.name} userId={user.id} avatarUrl={user.avatar_url} size={60} />}
              <div style={{ flex: 1 }}>
                <div style={s.avName}>{user?.name}</div>
                <div style={s.avEmail}>{user?.email}</div>
                <div style={s.avMeta}>Member since {user ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</div>
              </div>
              <button style={s.uploadBtn}>Change photo</button>
            </div>
            <div style={s.twoFields}>
              <div style={s.field}><label style={s.label}>Full name</label>
                <input style={s.input} value={name} onChange={e => setName(e.target.value)} /></div>
              <div style={s.field}><label style={s.label}>Email</label>
                <input style={{ ...s.input, background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }} value={user?.email ?? ''} readOnly />
                <span style={s.hint}>Managed via Google OAuth · Cognito</span></div>
            </div>
            <div style={{ ...s.field, marginTop: '0.75rem' }}>
              <label style={s.label}>Phone</label>
              <input style={s.input} value={phone} placeholder="+91 98765 43210" onChange={e => setPhone(e.target.value)} />
            </div>
            <div style={s.btnRow}>
              <Button variant="primary" loading={saving} onClick={saveProfile}>Save profile</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
          </div>

          {/* Payment info */}
          <div style={s.card}>
            <div style={s.cardTitle}>Payment info</div>
            <p style={s.cardDesc}>Your UPI ID is shown to flatmates when they need to pay you.</p>
            <div style={s.field}>
              <label style={s.label}>UPI ID</label>
              <input style={s.input} value={upi} placeholder="yourname@okaxis" onChange={e => setUpi(e.target.value)} />
              <span style={s.hint}>Shown to flatmates on the Payments screen</span>
            </div>
            <div style={{ marginTop: '0.85rem' }}>
              <Button variant="primary" loading={saving} onClick={saveUpi}>Save UPI ID</Button>
            </div>
          </div>

          {/* Notifications */}
          <div style={s.card}>
            <div style={s.cardTitle}>Notifications</div>
            {[
              { key: 'newExpense',       label: 'New expense added',   desc: 'When a flatmate adds an expense that includes you' },
              { key: 'paymentReceived',  label: 'Payment received',    desc: 'When someone marks a payment to you as sent' },
              { key: 'smartReminders',  label: 'Smart reminders',     desc: 'AI-powered nudges for recurring expenses' },
              { key: 'weekly',          label: 'Weekly summary',      desc: 'A weekly digest of your balances' },
            ].map((n, i, arr) => (
              <div key={n.key} style={{ ...s.toggleRow, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  <div style={s.toggleLabel}>{n.label}</div>
                  <div style={s.toggleDesc}>{n.desc}</div>
                </div>
                <label style={s.toggle}>
                  <input type="checkbox" checked={notifs[n.key as keyof typeof notifs]}
                    onChange={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key as keyof typeof notifs] }))}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: 9999,
                    background: notifs[n.key as keyof typeof notifs] ? '#ccff00' : 'var(--bg-tertiary)',
                    border: `0.5px solid ${notifs[n.key as keyof typeof notifs] ? '#ccff00' : 'var(--border-mid)'}`,
                    transition: 'background 0.2s',
                  }}>
                    <span style={{
                      position: 'absolute', width: 14, height: 14, borderRadius: '50%',
                      left: notifs[n.key as keyof typeof notifs] ? 19 : 3, top: 2.5,
                      background: notifs[n.key as keyof typeof notifs] ? '#000' : '#fff',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>

          {/* Auth info */}
          <div style={s.card}>
            <div style={s.cardTitle}>Authentication</div>
            <div style={s.cognitoBadge}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ccff00', flexShrink: 0 }} />
              Signed in via Google OAuth · AWS Cognito
            </div>
            <div style={s.field}>
              <label style={s.label}>Account ID (Cognito sub)</label>
              <input style={{ ...s.input, background: 'var(--bg-secondary)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }} value={user?.id ?? ''} readOnly />
            </div>
          </div>

          {/* Danger zone */}
          <div style={s.dangerZone}>
            <div style={s.dzTitle}>Delete account</div>
            <div style={s.dzDesc}>Permanently deletes your profile and removes you from all rooms. Expenses you created remain.</div>
            <Button variant="danger">Delete my account</Button>
          </div>

        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' },
  topbar:      { height: 54, background: 'var(--bg-primary)', borderBottom: '0.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0 },
  topLeft:     { display: 'flex', alignItems: 'center', gap: 10 },
  breadcrumb:  { fontSize: 13, color: 'var(--text-tertiary)' },
  sep:         { color: 'var(--border-mid)' },
  pageTitle:   { fontSize: 15, fontWeight: 500 },
  savedTag:    { fontSize: 12, background: 'var(--bg-success)', color: 'var(--text-success)', padding: '4px 12px', borderRadius: 9999, fontWeight: 500 },
  content:     { padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.1rem', alignItems: 'start' },
  settingsNav: { background: 'var(--bg-primary)', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: '1.25rem' },
  navItem:     { padding: '0.5rem 0.75rem', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' },
  navItemActive:{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 500 },
  navDivider:  { height: '0.5px', background: 'var(--border-light)', margin: '4px 0' },
  panels:      { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  card:        { background: 'var(--bg-primary)', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: '1.25rem' },
  cardTitle:   { fontSize: 13.5, fontWeight: 600, marginBottom: '0.85rem' },
  cardDesc:    { fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: '0.85rem' },
  avatarSection:{ display: 'flex', alignItems: 'center', gap: '1.1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', padding: '1rem', marginBottom: '1rem' },
  avName:      { fontSize: 16, fontWeight: 500 },
  avEmail:     { fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 },
  avMeta:      { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 },
  uploadBtn:   { background: 'transparent', border: '0.5px solid var(--border-mid)', borderRadius: 'var(--r-md)', height: 30, padding: '0 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' },
  twoFields:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  field:       { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: '0.75rem' },
  label:       { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 },
  input:       { height: 34, padding: '0 10px', borderRadius: 'var(--r-md)', border: '0.5px solid var(--border-mid)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', width: '100%' },
  hint:        { fontSize: 11, color: 'var(--text-tertiary)' },
  btnRow:      { display: 'flex', gap: 8, marginTop: '0.85rem' },
  toggleRow:   { display: 'flex', alignItems: 'center', padding: '0.65rem 0', borderBottom: '0.5px solid var(--border-light)' },
  toggleLabel: { fontSize: 13, fontWeight: 500 },
  toggleDesc:  { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 },
  toggle:      { position: 'relative', width: 36, height: 20, flexShrink: 0, cursor: 'pointer', display: 'block' },
  cognitoBadge:{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--bg-secondary)', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-md)', padding: '5px 12px', fontSize: 12, color: 'var(--text-secondary)', marginBottom: '0.85rem' },
  dangerZone:  { border: '0.5px solid #fca5a5', borderRadius: 'var(--r-lg)', padding: '1.25rem', background: '#FCEBEB' },
  dzTitle:     { fontSize: 14, fontWeight: 500, color: 'var(--text-danger)', marginBottom: 5 },
  dzDesc:      { fontSize: 12, color: 'var(--text-danger)', opacity: 0.75, lineHeight: 1.5, marginBottom: '0.85rem' },
};

import React from 'react';