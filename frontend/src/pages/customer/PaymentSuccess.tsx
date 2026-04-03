import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function PaymentSuccess() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-success-500">Payment successful</h2>
      <p className="mt-2 text-slate-600">Your payment was processed. A confirmation has been sent to your email.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/"><Button variant="ghost">Go home</Button></Link>
        <Link to="/customer/products/1"><Button>Continue shopping</Button></Link>
      </div>
    </div>
  );
}