import { useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import ConfirmDialog from '../components/ConfirmDialog';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500',
];

export default function TemplatesPage() {
  const { templates, addTemplate, deleteTemplate, loading } = useTemplates();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || form.content === '<p><br></p>') return;

    setIsSubmitting(true);
    try {
      await addTemplate(form);
      setForm({ title: '', content: '' });
      setShowForm(false);
    } catch (err) {
      alert(`Error saving template: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Canned Responses</h1>
          <p className="text-dark-500 text-sm">Manage your email reply templates</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ title: '', content: '' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 animate-fade-in">
          <h3 className="text-white text-sm font-semibold mb-4">Add New Template</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Title / Subject *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Password Reset Instructions"
                required
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-dark-400 text-xs font-medium uppercase tracking-wider block mb-1.5">Rich Text Content *</label>
              <div className="!text-dark-900 bg-white rounded-xl overflow-hidden border border-dark-600/30">
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={(val) => setForm({ ...form, content: val })}
                  placeholder="Type your beautifully formatted template here..."
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'clean']
                    ]
                  }}
                  className="h-40 pb-12"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => { setShowForm(false); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-white bg-dark-800 border border-dark-600/30 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.title || !form.content || form.content === '<p><br></p>'}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-indigo hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
           <span className="w-8 h-8 rounded-full border-2 border-accent-blue/30 border-t-accent-blue animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, i) => (
            <div key={template.id} className="glass-card flex flex-col group h-full">
              {/* Header Box */}
              <div className={`p-4 rounded-t-2xl border-b border-white/10 ${COLORS[i % COLORS.length]} bg-opacity-10`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-white font-semibold text-base truncate">{template.title}</h3>
                    <p className="text-white/60 text-xs mt-1 font-mono uppercase tracking-wider">{template.id}</p>
                  </div>
                  <button
                     onClick={() => setConfirmDelete(template)}
                     className="p-2 -mr-2 -mt-2 rounded-full bg-black/20 hover:bg-red-500/80 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Body Box */}
              <div className="p-4 flex-1 prose-sm prose-invert text-dark-300 max-h-48 overflow-y-auto"
                   dangerouslySetInnerHTML={{ __html: template.content }} />
            </div>
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="text-center py-16">
          <p className="text-dark-500 text-sm">No templates yet. Add your first canned response above.</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete the template "${confirmDelete?.title}"?`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={async () => {
          if (confirmDelete) {
            try {
               await deleteTemplate(confirmDelete.id);
            } catch (err) {
               alert(`Failed to delete: ${err.message}`);
            }
          }
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
