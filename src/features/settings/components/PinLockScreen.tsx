import React, { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { verifyPin, checkLockoutStatus } from '@/services/securityService';
import { Lock, ShieldAlert } from 'lucide-react';

export interface PinLockScreenProps {
  onUnlocked: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlocked }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isLockedOut, remainingSeconds } = checkLockoutStatus();
    if (isLockedOut) {
      setError(`Too many failed attempts. Try again in ${remainingSeconds}s.`);
      return;
    }

    if (!pin || isVerifying) return;
    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        onUnlocked();
      } else {
        const lockout = checkLockoutStatus();
        if (lockout.isLockedOut) {
          setError(`Too many failed attempts. Locked for ${lockout.remainingSeconds}s.`);
        } else {
          setError('Incorrect PIN. Please try again.');
        }
        setPin('');
      }
    } catch (err) {
      console.error(err);
      setError('Verification error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-xs space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your PIN to unlock ExpenseFlow</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-2xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-emerald-500"
            autoFocus
          />

          {error && (
            <div className="p-2.5 bg-red-950/80 border border-red-900 rounded-xl text-xs text-red-300 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="emerald"
            size="lg"
            fullWidth
            disabled={!pin || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Unlock App'}
          </Button>
        </form>
      </div>
    </div>
  );
};
