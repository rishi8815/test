import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/ui/ErrorState';

export default function Register() {
  const { signup, verifySignup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const onSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signup(name, email, password);
      if (res) {
        setStep(2);
        if (res.otp) {
          setDevOtp(res.otp);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifySignup(email, otp);
      nav('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 className="title-lg">
        {step === 1 ? 'Create your reseller account' : 'Verify your email'}
      </h2>
      {error && <ErrorState message={error} />}

      {step === 1 ? (
        <form onSubmit={onSubmitDetails} className="stack" style={{ marginTop: 16 }}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="form-group">
            <div className="row-between" style={{ marginBottom: 6 }}>
              <span className="label">Password</span>
              <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <Button type="submit" loading={loading} style={{ width: '100%' }}>Sign up</Button>
          <p className="text-muted" style={{ marginTop: 16, fontSize: 14 }}>Already have an account? <Link to="/login" className="nav-link" style={{ color: 'var(--pink)' }}>Login</Link></p>
        </form>
      ) : (
        <form onSubmit={onVerifyOTP} className="stack" style={{ marginTop: 16 }}>
          <p className="text-muted">Please enter the 6-digit OTP sent to your email.</p>
          <Input 
            label="OTP Code" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            required 
            maxLength={6}
          />
          {devOtp && (
            <div style={{ padding: '8px 12px', border: '1px dashed var(--border)', borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
              <span style={{ fontWeight: 'bold' }}>[DEV MODE] OTP:</span> <code style={{ color: 'var(--pink)', fontSize: 14 }}>{devOtp}</code>
            </div>
          )}
          <Button type="submit" loading={loading} style={{ width: '100%' }}>Verify & Finish</Button>
          <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setStep(1)}>
            Back to edit details
          </button>
        </form>
      )}
    </div>
  );
}