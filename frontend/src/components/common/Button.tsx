import React from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline';
type ButtonSize    = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: '#ccff00', color: '#000', border: 'none', fontWeight: 500 },
  ghost:   { background: 'transparent', color: '#5a5a58', border: '0.5px solid rgba(0,0,0,0.12)' },
  danger:  { background: 'transparent', color: '#b91c1c', border: '0.5px solid #fca5a5' },
  outline: { background: 'transparent', color: '#0e0e0e', border: '0.5px solid rgba(0,0,0,0.2)' },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 28, padding: '0 12px', fontSize: 12, borderRadius: 7 },
  md: { height: 34, padding: '0 16px', fontSize: 13, borderRadius: 10 },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, cursor: 'pointer', fontFamily: 'var(--font-sans)',
        transition: 'opacity 0.15s',
        opacity: disabled || loading ? 0.5 : 1,
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...style,
      }}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {loading ? 'Loading…' : children}
    </button>
  );
}