export default function BulkActionBar({ count, onMarkResolved, onAssign, onDelete, onClear, agentNames = [] }) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-3 px-5 py-3 bg-dark-900/95 backdrop-blur-xl border border-dark-600/30 rounded-2xl shadow-2xl shadow-black/40">
        <span className="text-white text-sm font-semibold mr-1">
          {count} selected
        </span>
        <div className="w-px h-5 bg-dark-600/50" />
        <button
          onClick={onMarkResolved}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Resolve
        </button>
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-all cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Assign
          </button>
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
            <div className="bg-dark-900 border border-dark-700/50 rounded-xl shadow-xl p-1 min-w-[140px]">
              {agentNames.map((a) => (
                <button
                  key={a}
                  onClick={() => onAssign(a)}
                  className="w-full text-left px-3 py-2 text-xs text-dark-300 hover:text-white hover:bg-dark-700/60 rounded-lg transition-colors cursor-pointer"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
        <div className="w-px h-5 bg-dark-600/50" />
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-dark-400 hover:text-white hover:bg-dark-700/40 transition-all cursor-pointer"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
