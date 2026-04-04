import { useState } from 'react';
import { useAgents } from '../hooks/useAgents';
import ConfirmDialog from '../components/ConfirmDialog';

const COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500',
];

export default function AgentsPage() {
  const { agents, addAgent, updateAgent, deleteAgent } = useAgents();
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Agent' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      if (editingAgent) {
        await updateAgent({ ...editingAgent, ...form });
      } else {
        await addAgent(form);
      }
      setForm({ name: '', email: '', role: 'Agent' });
      setShowForm(false);
      setEditingAgent(null);
    } catch {
      // error handled by hook
    }
  };

  const startEdit = (agent) => {
    setEditingAgent(agent);
    setForm({ name: agent.name, email: agent.email || '', role: agent.role || 'Agent' });
    setShowForm(true);
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Agents</h1>
          <p className="text-dark-500 text-sm">Manage your support team</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingAgent(null); setForm({ name: '', email: '', role: 'Agent' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Agent
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 animate-fade-in">
          <h3 className="text-white text-sm font-semibold mb-4">
            {editingAgent ? 'Edit Agent' : 'Add New Agent'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Name *</label>
              <input
                value={form.name}
                onChange={set('name')}
                placeholder="Agent name"
                required
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Email *</label>
              <input
                value={form.email}
                onChange={set('email')}
                placeholder="agent@company.com"
                type="email"
                required
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Role</label>
              <select value={form.role} onChange={set('role')} className="glass-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none">
                <option className="bg-dark-900">Agent</option>
                <option className="bg-dark-900">Senior Agent</option>
                <option className="bg-dark-900">Lead Agent</option>
                <option className="bg-dark-900">Manager</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingAgent(null); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-white bg-dark-800 border border-dark-600/30 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 transition-all cursor-pointer"
            >
              {editingAgent ? 'Update' : 'Add Agent'}
            </button>
          </div>
        </form>
      )}

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <div key={agent.email || i} className="glass-card p-5 group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                {(agent.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">{agent.name}</h3>
                <p className="text-dark-500 text-xs truncate">{agent.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400 text-xs px-2 py-1 rounded-md bg-dark-800/60">{agent.role || 'Agent'}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(agent)}
                  className="p-1.5 rounded-lg hover:bg-dark-700/60 text-dark-400 hover:text-accent-blue transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setConfirmDelete(agent)}
                  className="p-1.5 rounded-lg hover:bg-dark-700/60 text-dark-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-16">
          <p className="text-dark-500 text-sm">No agents yet. Add your first agent above.</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Agent"
        message={`Are you sure you want to remove ${confirmDelete?.name || 'this agent'}?`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={async () => {
          if (confirmDelete) await deleteAgent(confirmDelete.email);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
