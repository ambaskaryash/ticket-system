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
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600',
    blue: 'from-accent-blue to-accent-indigo',
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onCancel()}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-overlay-in"
    >
      <div className="w-full max-w-sm bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            confirmColor === 'red' ? 'bg-red-500/15' : 'bg-amber-500/15'
          }`}>
            <svg
              className={`w-7 h-7 ${confirmColor === 'red' ? 'text-red-400' : 'text-amber-400'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
          <p className="text-dark-400 text-sm">{message}</p>
        </div>
        <div className="p-4 border-t border-dark-700/50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-dark-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-600/30 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${colorMap[confirmColor] || colorMap.red} hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              confirmLabel || 'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
