import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { Card } from '../components/ui/Card';

type Txn = { id: string; date: string; amount: number; status: 'pending'|'approved'|'rejected' };

export default function Transactions() {
  const [items, setItems] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all'|'pending'|'approved'|'rejected'>('all');

  useEffect(() => {
    api
      .get('/reseller/transactions')
      .then((res) => setItems(res.data?.data ?? []))
      .catch(() => setError('Unable to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((t) => filter === 'all' ? true : t.status === filter);

  return (
    <div>
      <div className="row" style={{ marginBottom: 16 }}>
        {(['all','pending','approved','rejected'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn ${filter===f ? 'btn-primary' : 'btn-ghost'}`}>{f}</button>
        ))}
      </div>
      {loading && <Loader text="Loading transactions..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-muted" style={{ fontSize: 14 }}>No transactions.</div>
      )}
      <div className="stack-sm">
        {filtered.map((t) => (
          <Card key={t.id}>
            <div className="row-between">
              <div className="text-muted" style={{ fontSize: 14 }}>{new Date(t.date).toLocaleString()}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>€{t.amount.toLocaleString()}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.status==='approved' ? 'var(--success)' : t.status==='rejected' ? 'var(--error)' : 'var(--warning)' }}>{t.status}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}