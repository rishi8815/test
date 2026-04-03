import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function PaymentFailure() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-error-500">Payment failed</h2>
      <p className="mt-2 text-slate-600">Your payment could not be completed. Please try again or use a different method.</p>
      <div className="mt-6 flex gap-3">
        <Link to="/"><Button variant="ghost">Go home</Button></Link>
        <Link to="/customer/checkout"><Button>Retry payment</Button></Link>
      </div>
    </div>
  );
}