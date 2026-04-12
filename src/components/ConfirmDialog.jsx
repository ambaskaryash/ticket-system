import { useState, useRef, useCallback } from 'react';

export default function ConfirmDialog({ isOpen, title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }, [onConfirm]);

  if (!isOpen) return null;

  const colorMap = {
    red: 'bg-red-600 hover:bg-red-500',
    amber: 'bg-amber-600 hover:bg-amber-500',
    blue: 'bg-neutral-950 hover:bg-neutral-800',
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onCancel()}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-950/50 animate-overlay-in"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white ring-1 ring-neutral-950/5 shadow-xl animate-fade-in overflow-hidden">
        <div className="p-8 text-center">
          {/* Icon */}
          <div className={`mx-auto size-12 rounded-full flex items-center justify-center mb-5 ${
            confirmColor === 'red' ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <svg
              className={`size-6 ${confirmColor === 'red' ? 'text-red-600' : 'text-amber-600'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-neutral-950">{title}</h3>
          <p className="mt-2 text-sm text-neutral-600">{message}</p>
        </div>
        <div className="px-8 pb-8 flex gap-3 sm:flex-row-reverse">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-xs ${colorMap[confirmColor] || colorMap.red} disabled:opacity-50 transition cursor-pointer`}
          >
            {loading ? (
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              confirmLabel || 'Confirm'
            )}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
