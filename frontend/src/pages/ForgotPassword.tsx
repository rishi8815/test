import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/ui/ErrorState';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const onSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess('If an account exists with that email, an OTP has been generated.');
      setStep(2);
      // In development, we show the OTP so the user can actually reset it without an email service
      if (res.data.otp) {
        setDevOtp(res.data.otp);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      // Redirect to reset password page with email and otp in state
      navigate('/reset-password', { state: { email, otp } });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 className="title-lg">Forgot Password</h2>
      <p className="text-muted" style={{ marginTop: 8, marginBottom: 24 }}>
        {step === 1 
          ? "Enter your email address and we'll send you a 6-digit OTP to reset your password."
          : `We've sent a 6-digit OTP to ${email}. Please enter it below.`}
      </p>

      {error && <ErrorState message={error} />}
      {success && (
        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {success}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={onSendOTP} className="stack">
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerifyOTP} className="stack">
          <Input 
            label="Enter 6-digit OTP" 
            type="text" 
            maxLength={6}
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            required 
          />
          {devOtp && (
            <div style={{ padding: '8px 12px', border: '1px dashed var(--border)', borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
              <span style={{ fontWeight: 'bold' }}>[DEV MODE] OTP:</span> <code style={{ color: 'var(--pink)', fontSize: 14 }}>{devOtp}</code>
            </div>
          )}
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Verify OTP
          </Button>
          <button 
            type="button" 
            className="btn btn-ghost" 
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => setStep(1)}
          >
            Back to Email
          </button>
        </form>
      )}

      <p className="text-muted" style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
        Remembered your password? <Link to="/login" style={{ color: 'var(--pink)', fontWeight: 600 }}>Login</Link>
      </p>
    </div>
  );
}
