import { useEffect } from 'react';
import { STORAGE_KEYS, storage } from '../lib/storage';

export function useAttribution() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const reseller = url.searchParams.get('ref') || url.searchParams.get('reseller');
    if (reseller) {
      storage.set(STORAGE_KEYS.resellerId, reseller);
    }
  }, []);

  const resellerId = storage.get<string>(STORAGE_KEYS.resellerId);
  return { resellerId };
}