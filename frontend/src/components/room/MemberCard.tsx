import { RoomMember } from '../../types/room.types';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';

interface Props {
  member: RoomMember;
  isRequesterAdmin: boolean;
  onRemove?: (userId: string) => void;
  onPromote?: (userId: string) => void;
}

export default function MemberCard({ member, isRequesterAdmin, onRemove, onPromote }: Props) {
  const { user } = useAuthStore();
  const isMe = member.user_id === user?.id;
  const isAdmin = member.role === 'admin';

  return (
    <div style={s.row}>
      <Avatar
        name={member.name ?? member.user_id}
        userId={member.user_id}
        avatarUrl={member.avatar_url}
        size={36}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.name}>
          {member.name ?? member.user_id}
          {isMe && <span style={s.youTag}> (you)</span>}
        </div>
        <div style={s.email}>{member.email ?? ''}</div>
        <div style={s.joined}>
          Joined {new Date(member.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      <div style={s.right}>
        <Badge label={isAdmin ? 'Admin' : 'Member'} variant={isAdmin ? 'warning' : 'neutral'} />
        {isRequesterAdmin && !isMe && (
          <div style={s.actions}>
            {!isAdmin && onPromote && (
              <button style={s.iconBtn} title="Make admin" onClick={() => onPromote(member.user_id)}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M6.5 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6.5 9l-3 1.5.5-3.5L1.5 4.5 5 4z"/>
                </svg>
              </button>
            )}
            {onRemove && (
              <button style={{ ...s.iconBtn, ...s.iconBtnDanger }} title="Remove member" onClick={() => onRemove(member.user_id)}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2 3h9M5 3V2h3v1M10 3l-.7 8H3.7L3 3"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  row:           { display: 'flex', alignItems: 'center', gap: 12, padding: '0.7rem 0', borderBottom: '0.5px solid var(--border-light)' },
  name:          { fontSize: 13, fontWeight: 500 },
  youTag:        { color: 'var(--text-tertiary)', fontWeight: 400 },
  email:         { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 },
  joined:        { fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 },
  right:         { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  actions:       { display: 'flex', gap: 5 },
  iconBtn:       { width: 28, height: 28, borderRadius: 'var(--r-md)', border: '0.5px solid var(--border-light)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' },
  iconBtnDanger: { borderColor: '#fca5a5', color: 'var(--text-danger)' },
};

import React from 'react';