interface LoaderProps {
  size?: number;
  fullPage?: boolean;
}

export default function Loader({ size = 24, fullPage = false }: LoaderProps) {
  const spinner = (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(0,0,0,0.08)`,
      borderTop: `2px solid #ccff00`,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.8)',
        zIndex: 999,
      }}>
        {spinner}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {spinner}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}