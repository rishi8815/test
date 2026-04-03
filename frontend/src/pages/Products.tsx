import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { Card } from '../components/ui/Card';
import { Copy } from '../components/Copy';
import { QRCode } from '../components/QRCode';
import { PrivateRoute } from '../routes/PrivateRoute';
import { storage, STORAGE_KEYS } from '../lib/storage';

type Product = { id: string; name: string; price: number; description: string; currency?: string };

export default function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resellerId = storage.get<string>(STORAGE_KEYS.resellerId);
  const baseUrl = window.location.origin;

  useEffect(() => {
    api
      .get('/catalog/products')
      .then((res) => setItems(res.data?.data ?? []))
      .catch(() => setError('Unable to load products'))
      .finally(() => setLoading(false));
  }, []);

  const linkFor = useMemo(() => (id: string) => `${baseUrl}/customer/products/${id}${resellerId ? `?ref=${resellerId}` : ''}`,[baseUrl, resellerId]);

  return (
    <PrivateRoute>
      {loading && <Loader text="Loading products..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && items.length === 0 && (
        <div className="text-muted" style={{ fontSize: 14 }}>No products yet.</div>
      )}
      <div className="grid grid-2 gap-24">
        {items.map((p) => (
          <Card key={p.id}>
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="title-lg">{p.name}</div>
                <div className="text-muted" style={{ marginTop: 6, fontSize: 14 }}>{p.description}</div>
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>€{p.price.toLocaleString()}</div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
              <Copy text={linkFor(p.id)} />
              <QRCode value={linkFor(p.id)} size={96} />
            </div>
          </Card>
        ))}
      </div>
    </PrivateRoute>
  );
}
