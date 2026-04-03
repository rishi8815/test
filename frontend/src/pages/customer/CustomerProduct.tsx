import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { useAttribution } from '../../hooks/useAttribution';

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  currency?: 'EUR' | string;
  categories?: string[];
  longDescription?: string;
  related?: { id: string; name: string; price: number; currency?: string }[];
};

export default function CustomerProduct() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { resellerId } = useAttribution();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    api.get(`/customer/products/${id}`)
      .then((res) => setProduct(res.data?.data ?? null))
      .catch(() => {
        const devMock = String(import.meta.env.VITE_DEV_MOCK_API || '').toLowerCase() === 'true';
        if (devMock) {
          setProduct({ id: id || 'p1', name: 'Beam Premium', price: 499, description: 'Premium wallet subscription with perks tailored for customers.' });
        } else {
          setError('Unable to load product');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onCheckout = () => {
    if (!accepted) {
      setError('Please accept the Terms and conditions');
      return;
    }
    nav('/customer/checkout', { state: { productId: id, resellerId } });
  };

  if (loading) return <Loader text="Loading product..." />;
  if (error) return <ErrorState message={error} />;
  if (!product) return <div className="text-muted" style={{ fontSize: 14 }}>Product unavailable.</div>;

  const currencySymbol = '€';

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="title-lg">{product.name}</h1>
      <p className="text-muted" style={{ marginTop: 8 }}>{product.description}</p>
      <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
        {currencySymbol}{product.price.toLocaleString()}
      </div>

      {product.categories && product.categories.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {product.categories.map((c) => (
            <span key={c} style={{ fontSize: 12, background: '#F1F5F9', color: '#334155', padding: '4px 8px', borderRadius: 6 }}>{c}</span>
          ))}
        </div>
      )}

      <label className="row" style={{ marginTop: 16 }}>
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
        <span style={{ fontSize: 14, color: '#334155' }}>I accept the Terms and conditions</span>
      </label>

      <div style={{ marginTop: 16 }}>
        <Button onClick={onCheckout}>Add to Cart</Button>
      </div>

      {product.longDescription && (
        <div style={{ marginTop: 24 }}>
          <h3 className="title-md">Details</h3>
          <p className="text-muted" style={{ marginTop: 8, lineHeight: 1.6 }}>{product.longDescription}</p>
        </div>
      )}

      {product.related && product.related.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 className="title-md">Related products</h3>
          <div className="stack-sm" style={{ marginTop: 8 }}>
            {product.related.map((r) => (
              <div key={r.id} className="row-between" style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>€{r.price.toLocaleString()}</div>
                </div>
                <Button onClick={() => nav(`/customer/products/${r.id}`, { replace: true })}>Add to Cart</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {resellerId && <div className="text-muted" style={{ marginTop: 12, fontSize: 12 }}>CATEGORY: {product.categories?.join(', ') || '—'}</div>}
    </div>
  );
}
