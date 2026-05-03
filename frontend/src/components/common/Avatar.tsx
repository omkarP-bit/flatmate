import { getAvatarColors, getInitials } from '../../utils/avatarHelpers';

interface AvatarProps {
  name: string;
  userId?: string;
  avatarUrl?: string;
  size?: number;
}

export default function Avatar({ name, userId, avatarUrl, size = 32 }: AvatarProps) {
  const { bg, color } = getAvatarColors(userId ?? name);
  const initials = getInitials(name);
  const fontSize = size * 0.34;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 600, flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}