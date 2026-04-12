import { useState } from 'react';
import { useAgents } from '../hooks/useAgents';
import ConfirmDialog from '../components/ConfirmDialog';
import Breadcrumbs from '../components/Breadcrumbs';
import { GridList, GridListItem } from '../components/GridList';
import { FadeIn } from '../components/FadeIn';

const ACCENT_COLORS = [
  'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-pink-600',
];

const inputClasses = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6";

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
    <div className="space-y-8 animate-fade-in">
      <Breadcrumbs />

      {/* Header */}
      <FadeIn>
        <div className="flex items-end justify-between">
          <div>
            <span className="block font-display text-base font-semibold text-neutral-950">Team</span>
            <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">Agents</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingAgent(null); setForm({ name: '', email: '', role: 'Agent' }); }}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition cursor-pointer"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Agent
          </button>
        </div>
      </FadeIn>

      {/* Add/Edit Form */}
      {showForm && (
        <FadeIn>
          <form onSubmit={handleSubmit} className="rounded-3xl ring-1 ring-neutral-950/5 bg-white p-6">
            <h3 className="font-display text-base font-semibold text-neutral-950 mb-6">
              {editingAgent ? 'Edit Agent Details' : 'Register New Agent'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm/6 font-medium text-neutral-950">Name *</label>
                <div className="mt-2">
                  <input value={form.name} onChange={set('name')} placeholder="Agent name" required className={inputClasses} />
                </div>
              </div>
              <div>
                <label className="block text-sm/6 font-medium text-neutral-950">Email *</label>
                <div className="mt-2">
                  <input value={form.email} onChange={set('email')} placeholder="agent@company.com" type="email" required className={inputClasses} />
                </div>
              </div>
              <div>
                <label className="block text-sm/6 font-medium text-neutral-950">Role</label>
                <div className="mt-2">
                  <select value={form.role} onChange={set('role')} className={`${inputClasses} cursor-pointer`}>
                    <option>Agent</option>
                    <option>Senior Agent</option>
                    <option>Lead Agent</option>
                    <option>Manager</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingAgent(null); }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-neutral-950 px-6 py-2 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition cursor-pointer"
              >
                {editingAgent ? 'Update Agent' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        </FadeIn>
      )}

      {/* Agent Grid — Studio GridList */}
      <GridList>
        {agents.map((agent, i) => (
          <GridListItem
            key={agent.email || i}
            title={agent.name}
            subtitle={agent.email || 'No email'}
            accent={ACCENT_COLORS[i % ACCENT_COLORS.length]}
            className="group"
            actions={
              <>
                <button
                  onClick={() => startEdit(agent)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                  title="Edit"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setConfirmDelete(agent)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                  title="Delete"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            }
          >
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {agent.role || 'Agent'}
            </span>
          </GridListItem>
        ))}
      </GridList>

      {agents.length === 0 && (
        <FadeIn>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
              <svg className="size-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-neutral-950 mb-1">No agents yet</h3>
            <p className="text-sm text-neutral-600">Add your first agent above.</p>
          </div>
        </FadeIn>
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
