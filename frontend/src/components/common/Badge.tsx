type BadgeVariant = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'lime';

const VARIANTS: Record<BadgeVariant, { bg: string; color: string }> = {
  neutral: { bg: '#f0f0ee', color: '#5a5a58' },
  success: { bg: '#dcfce7', color: '#1a6b3a' },
  danger:  { bg: '#fee2e2', color: '#b91c1c' },
  warning: { bg: '#fef3c7', color: '#92400e' },
  info:    { bg: '#dbeafe', color: '#1e40af' },
  lime:    { bg: 'rgba(204,255,0,0.15)', color: '#4d6000' },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const v = VARIANTS[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 9999,
      fontSize: 11, fontWeight: 500,
      background: v.bg, color: v.color,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}