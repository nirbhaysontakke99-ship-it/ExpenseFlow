import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { downloadUserDataCSV } from '@/services/exportService';
import { FileText, Download } from 'lucide-react';

export interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadUserDataCSV();
      onClose();
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export My Financial Data">
      <div className="py-4 space-y-4 text-xs text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Export Local Data to CSV
          </h4>
          <p className="text-slate-500 mt-1 max-w-xs mx-auto">
            Includes transactions, monthly budgets, savings goals, and recurring rules. Works completely offline.
          </p>
        </div>

        <Button
          variant="emerald"
          fullWidth
          size="lg"
          onClick={handleExport}
          disabled={isExporting}
          leftIcon={<Download className="w-4 h-4" />}
        >
          {isExporting ? 'Preparing CSV...' : 'Download CSV File'}
        </Button>
      </div>
    </Modal>
  );
};
