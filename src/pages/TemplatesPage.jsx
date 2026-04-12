import { useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import ConfirmDialog from '../components/ConfirmDialog';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const COLORS = [
  'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-pink-600',
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
          <h1 className="text-2xl sm:text-4xl font-semibold text-neutral-950 tracking-tight">Canned Responses</h1>
          <p className="text-neutral-400 text-xs sm:text-sm font-medium uppercase tracking-widest mt-1">Manage your email reply templates</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ title: '', content: '' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white rounded-full bg-neutral-950 text-white shadow-xs hover:bg-neutral-800 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm animate-fade-in">
          <h3 className="text-neutral-950 text-sm font-semibold uppercase tracking-widest mb-4">Add New Template</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-neutral-500 text-xs font-bold uppercase tracking-widest block mb-1.5 pl-1">Title / Subject *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Password Reset Instructions"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6 w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-neutral-500 text-xs font-bold uppercase tracking-widest block mb-1.5 pl-1">Rich Text Content *</label>
              <div className="!text-neutral-950 bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm focus-within:shadow-md transition-shadow">
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

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => { setShowForm(false); }}
              className="px-6 py-2 rounded-xl text-sm font-bold text-neutral-500 hover:text-neutral-950 bg-white border border-neutral-200 shadow-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.title || !form.content || form.content === '<p><br></p>'}
              className="px-8 py-2 rounded-xl text-sm font-bold text-white rounded-full bg-neutral-950 text-white shadow-xs hover:bg-neutral-800 transition-all disabled:opacity-50 cursor-pointer"
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
            <div key={template.id} className="bg-white rounded-2xl border border-neutral-200 flex flex-col group h-full shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Header Box */}
              <div className={`p-5 rounded-t-2xl border-b border-neutral-100 bg-gradient-to-br from-gray-50/50 to-transparent`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${COLORS[i % COLORS.length]}`} />
                      <h3 className="text-neutral-950 font-bold text-base truncate">{template.title}</h3>
                    </div>
                    <p className="text-neutral-400 text-[10px] font-semibold uppercase tracking-widest">{template.id}</p>
                  </div>
                  <button
                     onClick={() => setConfirmDelete(template)}
                     className="p-2 -mr-1 -mt-1 rounded-xl bg-neutral-50 hover:bg-red-50 text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-neutral-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Body Box */}
              <div className="p-5 flex-1 prose-sm text-neutral-600 max-h-48 overflow-y-auto italic line-clamp-4"
                   dangerouslySetInnerHTML={{ __html: template.content }} />
            </div>
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-neutral-50 flex items-center justify-center mb-4 border border-neutral-200">
            <svg className="w-10 h-10 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11h-6V5a1 1 0 00-1-1H7a1 1 0 00-1 1v6H4a1 1 0 00-1 1v2a1 1 0 001 1h2v6a1 1 0 001 1h4a1 1 0 001-1v-6h6a1 1 0 001-1v-2a1 1 0 00-1-1z" />
            </svg>
          </div>
          <p className="text-neutral-400 text-sm font-medium">No templates yet. Add your first canned response above.</p>
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
