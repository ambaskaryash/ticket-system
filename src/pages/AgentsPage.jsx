import { useState } from 'react';
import { useAgents } from '../hooks/useAgents';
import ConfirmDialog from '../components/ConfirmDialog';

const COLORS = [
  'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-pink-600',
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
          <h1 className="text-2xl sm:text-4xl font-semibold text-neutral-950 tracking-tight">Agents</h1>
          <p className="text-neutral-400 text-xs sm:text-sm font-medium uppercase tracking-widest mt-1">Manage your support team</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingAgent(null); setForm({ name: '', email: '', role: 'Agent' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white rounded-full bg-neutral-950 text-white shadow-xs hover:bg-neutral-800 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Agent
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl ring-1 ring-neutral-950/5 bg-white p-5 animate-fade-in">
          <h3 className="text-neutral-950 text-sm font-semibold uppercase tracking-widest mb-4">
            {editingAgent ? 'Edit Agent Details' : 'Register New Agent'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Name *</label>
              <input
                value={form.name}
                onChange={set('name')}
                placeholder="Agent name"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
              />
            </div>
            <div>
              <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Email *</label>
              <input
                value={form.email}
                onChange={set('email')}
                placeholder="agent@company.com"
                type="email"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 "
              />
            </div>
            <div>
              <label className="text-neutral-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Role</label>
              <select value={form.role} onChange={set('role')} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 cursor-pointer">
                <option className="bg-neutral-900">Agent</option>
                <option className="bg-neutral-900">Senior Agent</option>
                <option className="bg-neutral-900">Lead Agent</option>
                <option className="bg-neutral-900">Manager</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingAgent(null); }}
              className="px-6 py-2 rounded-xl text-sm font-bold text-neutral-500 hover:text-neutral-950 bg-white border border-neutral-200 shadow-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 rounded-xl text-sm font-bold text-white rounded-full bg-neutral-950 text-white shadow-xs hover:bg-neutral-800 transition-all cursor-pointer"
            >
              {editingAgent ? 'Update Agent' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      )}

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <div key={agent.email || i} className="rounded-3xl ring-1 ring-neutral-950/5 bg-white p-5 group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xl font-semibold shadow-md transform transition-transform group-hover:scale-105 group-hover:rotate-3`}>
                {(agent.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-neutral-950 font-bold text-sm truncate">{agent.name}</h3>
                <p className="text-neutral-400 text-xs truncate font-medium">{agent.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-md bg-blue-50">{agent.role || 'Agent'}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(agent)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-neutral-400 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setConfirmDelete(agent)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
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
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-neutral-50 flex items-center justify-center mb-4 border border-neutral-200">
            <svg className="w-10 h-10 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-neutral-400 text-sm font-medium">No agents yet. Add your first agent above.</p>
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
