import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

export default function Modal({ title, onClose, children, footer, width = 520 }: ModalProps) {
  return (
    <div
      style={styles.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ ...styles.modal, maxWidth: width }}>
        <div style={styles.header}>
          <span style={styles.title}>{title}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.body}>{children}</div>
        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: '1rem',
  },
  modal: {
    background: 'var(--bg-primary)',
    border: '0.5px solid var(--border-light)',
    borderRadius: 'var(--r-xl)',
    width: '100%',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '0.5px solid var(--border-light)',
  },
  title: { fontSize: 15, fontWeight: 600 },
  closeBtn: {
    width: 28, height: 28,
    borderRadius: 'var(--r-md)',
    border: '0.5px solid var(--border-light)',
    background: 'transparent', cursor: 'pointer',
    fontSize: 15, color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: {
    padding: '1.1rem 1.25rem',
    maxHeight: '70vh', overflowY: 'auto',
  },
  footer: {
    padding: '0.85rem 1.25rem',
    borderTop: '0.5px solid var(--border-light)',
    display: 'flex', justifyContent: 'flex-end', gap: 8,
  },
};