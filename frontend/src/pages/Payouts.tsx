import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { Card } from '../components/ui/Card';

type Payout = { id: string; date: string; amount: number; status: 'processing'|'paid'|'failed' };

export default function Payouts() {
  const [items, setItems] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/reseller/payouts')
      .then((res) => setItems(res.data?.data ?? []))
      .catch(() => setError('Unable to load payouts'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading && <Loader text="Loading payouts..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && items.length === 0 && (
        <div className="text-muted" style={{ fontSize: 14 }}>No payouts yet.</div>
      )}
      <div className="stack-sm">
        {items.map((p) => (
          <Card key={p.id}>
            <div className="row-between">
              <div className="text-muted" style={{ fontSize: 14 }}>{new Date(p.date).toLocaleString()}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>€{p.amount.toLocaleString()}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: p.status==='paid' ? 'var(--success)' : p.status==='failed' ? 'var(--error)' : 'var(--warning)' }}>{p.status}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}