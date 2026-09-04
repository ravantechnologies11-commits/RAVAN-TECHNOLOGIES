import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemTitle?: string;
  itemType?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemTitle,
  itemType = 'record',
  isDeleting = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-body">
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a192f] border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 relative"
      >
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-white">
              Delete {itemType} Permanently?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              This action cannot be undone. The record will be permanently deleted from the Supabase database.
            </p>
          </div>
        </div>

        {itemTitle && (
          <div className="p-3 bg-[#07111e] rounded-lg border border-slate-800 text-xs font-mono text-slate-300 mb-6 truncate">
            Target: <span className="text-rose-300 font-bold">{itemTitle}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-950 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'DELETING...' : 'DELETE PERMANENTLY'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
