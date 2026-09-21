import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { setPinLock, disablePinLock, isPinLockEnabled } from '@/services/securityService';
import { Lock, ShieldCheck } from 'lucide-react';

export interface PinLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPinStateChanged: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  onClose,
  onPinStateChanged,
}) => {
  const isEnabled = isPinLockEnabled();

  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be 4 to 6 numeric digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PIN confirmation does not match');
      return;
    }

    await setPinLock(pin);
    onPinStateChanged();
    onClose();
  };

  const handleDisable = () => {
    disablePinLock();
    onPinStateChanged();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEnabled ? 'Manage App PIN Lock' : 'Enable App PIN Lock'}
    >
      <div className="space-y-4">
        {isEnabled ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                App Lock is Currently Active
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your ExpenseFlow financial data is secured with a Web Crypto SHA-256 PIN hash.
              </p>
            </div>
            <Button variant="danger" fullWidth onClick={handleDisable}>
              Disable PIN Lock
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSavePin} className="space-y-3 text-xs">
            <div className="text-center pb-2">
              <Lock className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <p className="text-slate-500">Create a 4–6 digit numeric PIN to lock your app.</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Enter PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3 py-2 text-center text-lg font-mono tracking-widest rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Confirm PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3 py-2 text-center text-lg font-mono tracking-widest rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {error && <p className="text-red-600 font-bold text-center">{error}</p>}

            <Button variant="emerald" fullWidth size="lg" type="submit">
              Save & Enable Lock
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
