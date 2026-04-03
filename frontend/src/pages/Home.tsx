import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAttribution } from '../hooks/useAttribution';

export default function Home() {
  const { resellerId } = useAttribution();
  return (
    <div className="container">
      <div className="section" style={{ textAlign: 'center' }}>
        <h1 className="title-xl" style={{ marginTop: 0 }}>Grow with Beam</h1>
        <p className="text-muted" style={{ marginTop: 16, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>A trustworthy, modern affiliate platform. Join as a reseller, share your unique links, and earn from verified conversions.</p>
        <div className="actions" style={{ marginTop: 24 }}>
          <Link to="/signup"><Button variant="primary">I Want to Start Winning</Button></Link>
          <Link to={resellerId ? `/products?ref=${resellerId}` : '/products'}><Button variant="ghost">Browse Products</Button></Link>
        </div>
        {resellerId && (
          <div className="text-muted" style={{ marginTop: 12, fontSize: 12 }}>Attribution active for reseller: {resellerId}</div>
        )}
      </div>
      <div className="grid-3 section">
        <div className="card">
          <div className="title-lg">Clear Earnings</div>
          <p className="text-muted" style={{ marginTop: 8, fontSize: 14 }}>All commissions and rules are calculated by the backend and displayed transparently.</p>
        </div>
        <div className="card">
          <div className="title-lg">Trustworthy Flow</div>
          <p className="text-muted" style={{ marginTop: 8, fontSize: 14 }}>We persist attribution across product pages and checkout to ensure fairness.</p>
        </div>
        <div className="card">
          <div className="title-lg">Professional UI</div>
          <p className="text-muted" style={{ marginTop: 8, fontSize: 14 }}>Experience a seamless and intuitive interface designed to empower your affiliate journey with real-time insights and professional tools.</p>
        </div>
      </div>
    </div>
  );
}