import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/ui/ErrorState';

export default function Register() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(name, email, password);
      nav('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 className="title-lg">Create your reseller account</h2>
      {error && <ErrorState message={error} />}
      <form onSubmit={onSubmit} className="stack" style={{ marginTop: 16 }}>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {/* Password with show/hide toggle */}
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
      </form>
      <p className="text-muted" style={{ marginTop: 16, fontSize: 14 }}>Already have an account? <Link to="/login" className="nav-link" style={{ color: 'var(--pink)' }}>Login</Link></p>
    </div>
  );
}