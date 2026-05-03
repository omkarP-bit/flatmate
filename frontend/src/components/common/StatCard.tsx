import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  progress?: number;
}

export default function StatCard({ label, value, sub, valueColor, progress }: StatCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.value, color: valueColor ?? 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
      {progress !== undefined && (
        <div style={styles.bar}>
          <div style={{ ...styles.fill, width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', padding: '0.9rem 1rem' },
  label: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5 },
  value: { fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' },
  sub:   { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 },
  bar:   { height: 4, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden', marginTop: 7 },
  fill:  { height: '100%', background: '#ccff00', borderRadius: 99, transition: 'width 0.4s' },
};