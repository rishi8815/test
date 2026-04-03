import { STORAGE_KEYS, storage } from '../lib/storage';

export function seedDevStorage() {
  const enable = String(import.meta.env.VITE_DEV_SEED_AUTH || '').toLowerCase() === 'true';
  if (!enable) return;

  // Seed token (any non-empty string unlocks PrivateRoute)
  const existingToken = storage.get<string>(STORAGE_KEYS.token);
  if (!existingToken) {
    storage.set(STORAGE_KEYS.token, 'dev-local-token');
  }

  // Optional: seed reseller id if provided via env
  const reseller = import.meta.env.VITE_DEV_RESELLER_ID as string | undefined;
  if (reseller && !storage.get<string>(STORAGE_KEYS.resellerId)) {
    storage.set(STORAGE_KEYS.resellerId, reseller);
  }

  // Seed a mock user for display if dev mock mode is on
  const mockUser = {
    id: 'dev-user-1',
    name: 'Dev User',
    email: 'dev@local.test'
  };
  try {
    localStorage.setItem('beam_user', JSON.stringify(mockUser));
  } catch {/* noop */}
}