import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

type ProfileData = { id: string; name: string; email: string };
type SettingsData = { notifications: boolean };

export default function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [settings, setSettings] = useState<SettingsData>({ notifications: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/reseller/me'),
      api.get('/reseller/settings'),
    ]).then(([p, s]) => {
      setProfile(p.data?.data ?? null);
      setSettings(s.data?.data ?? { notifications: true });
    }).catch(() => setError('Unable to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      await api.put('/reseller/me', { name: profile.name });
      await api.put('/reseller/settings', settings);
      // Reflect changes in the header/AuthContext immediately
      updateUser({ name: profile.name });
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;
  if (error) return <ErrorState message={error} />;
  if (!profile) return <div className="text-muted" style={{ fontSize: 14 }}>Profile unavailable.</div>;

  return (
    <form onSubmit={onSave} className="card stack" style={{ maxWidth: 600 }}>
      <div>
        <h2 className="title-lg">Profile</h2>
        <div className="stack-sm" style={{ marginTop: 12 }}>
          <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Email" value={profile.email} disabled />
        </div>
      </div>
      <div>
        <h2 className="title-lg">Settings</h2>
        <label className="row" style={{ marginTop: 12 }}>
          <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })} />
          <span style={{ fontSize: 14, color: '#334155' }}>Email notifications</span>
        </label>
      </div>
      <Button type="submit" loading={saving}>Save changes</Button>
    </form>
  );
}
