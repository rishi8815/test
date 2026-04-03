export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}