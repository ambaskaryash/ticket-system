export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const config = {
    success: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/30',
      icon: (
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: 'from-red-500/20 to-red-600/10',
      border: 'border-red-500/30',
      icon: (
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    info: {
      bg: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/30',
      icon: (
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const c = config[toast.type] || config.info;

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${c.bg} border ${c.border} backdrop-blur-xl shadow-xl animate-toast-in min-w-[280px] max-w-[400px]`}
    >
      {c.icon}
      <span className="text-sm text-dark-200 flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-dark-500 hover:text-white transition-colors cursor-pointer p-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
