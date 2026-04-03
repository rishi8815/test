import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { api } from '../lib/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = (location.state as { email?: string; otp?: string }) || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.put('/auth/reset-password', { email, otp, password });
      setSuccess('Your password has been successfully reset. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) return null;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 className="title-lg">Set New Password</h2>
      <p className="text-muted" style={{ marginTop: 8, marginBottom: 24 }}>
        OTP verified for {email}. Please enter your new password below.
      </p>

      {error && <ErrorState message={error} />}
      {success && (
        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {success}
        </div>
      )}

      {!success ? (
        <form onSubmit={onSubmit} className="stack">
          <Input 
            label="New Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <Input 
            label="Confirm Password" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Reset Password
          </Button>
        </form>
      ) : (
        <div className="stack" style={{ marginTop: 16 }}>
          <Link to="/login">
            <Button variant="primary" style={{ width: '100%' }}>Go to Login Now</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
