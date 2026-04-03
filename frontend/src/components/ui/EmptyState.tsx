export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="empty-state">
      <div className="title-lg" style={{ marginBottom: 8 }}>{title}</div>
      {description && <div className="text-muted" style={{ fontSize: 14, maxWidth: 520, margin: '0 auto' }}>{description}</div>}
    </div>
  );
}