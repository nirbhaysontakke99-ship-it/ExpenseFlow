const HASH_KEY = 'ef_pin_hash';
const LOCKOUT_KEY = 'ef_pin_lockout_until';
const FAILED_ATTEMPTS_KEY = 'ef_pin_failed_attempts';

// In-memory fallback map for non-browser Node.js test environments
const memoryStorage = new Map<string, string>();

function getItem(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memoryStorage.get(key) || null;
}

function setItem(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  } else {
    memoryStorage.set(key, value);
  }
}

function removeItem(key: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  } else {
    memoryStorage.delete(key);
  }
}

/**
 * Derives a secure SHA-256 hash representation of a PIN using browser Web Crypto API.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`ef_salt_${pin}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function isPinLockEnabled(): boolean {
  return Boolean(getItem(HASH_KEY));
}

export async function setPinLock(pin: string): Promise<void> {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN must be 4 to 6 numeric digits');
  }
  const hash = await hashPin(pin);
  setItem(HASH_KEY, hash);
  removeItem(FAILED_ATTEMPTS_KEY);
  removeItem(LOCKOUT_KEY);
}

export function disablePinLock(): void {
  removeItem(HASH_KEY);
  removeItem(FAILED_ATTEMPTS_KEY);
  removeItem(LOCKOUT_KEY);
}

export function checkLockoutStatus(): { isLockedOut: boolean; remainingSeconds: number } {
  const lockoutUntilStr = getItem(LOCKOUT_KEY);
  if (!lockoutUntilStr) return { isLockedOut: false, remainingSeconds: 0 };

  const lockoutUntil = parseInt(lockoutUntilStr, 10);
  const now = Date.now();

  if (now < lockoutUntil) {
    const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
    return { isLockedOut: true, remainingSeconds };
  }

  // Lockout expired
  removeItem(LOCKOUT_KEY);
  setItem(FAILED_ATTEMPTS_KEY, '0');
  return { isLockedOut: false, remainingSeconds: 0 };
}

export async function verifyPin(pin: string): Promise<boolean> {
  const { isLockedOut } = checkLockoutStatus();
  if (isLockedOut) return false;

  const storedHash = getItem(HASH_KEY);
  if (!storedHash) return true;

  const inputHash = await hashPin(pin);

  if (inputHash === storedHash) {
    setItem(FAILED_ATTEMPTS_KEY, '0');
    return true;
  }

  // Increment failed attempts
  const attempts = parseInt(getItem(FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
  setItem(FAILED_ATTEMPTS_KEY, attempts.toString());

  if (attempts >= 5) {
    // Lockout for 30 seconds
    const lockoutUntil = Date.now() + 30 * 1000;
    setItem(LOCKOUT_KEY, lockoutUntil.toString());
  }

  return false;
}
