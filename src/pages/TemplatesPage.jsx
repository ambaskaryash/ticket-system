import { useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import ConfirmDialog from '../components/ConfirmDialog';
import Breadcrumbs from '../components/Breadcrumbs';
import { GridList, GridListItem } from '../components/GridList';
import { FadeIn } from '../components/FadeIn';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ACCENT_COLORS = [
  'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-pink-600',
];

const inputClasses = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-neutral-950 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-2 focus:outline-neutral-950 sm:text-sm/6";

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
    <div className="space-y-8 animate-fade-in">
      <Breadcrumbs />

      {/* Header */}
      <FadeIn>
        <div className="flex items-end justify-between">
          <div>
            <span className="block font-display text-base font-semibold text-neutral-950">Content</span>
            <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">Canned Responses</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setForm({ title: '', content: '' }); }}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 transition cursor-pointer"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Template
          </button>
        </div>
      </FadeIn>

      {/* Add Form */}
      {showForm && (
        <FadeIn>
          <form onSubmit={handleSubmit} className="rounded-3xl ring-1 ring-neutral-950/5 bg-white p-6">
            <h3 className="font-display text-base font-semibold text-neutral-950 mb-6">Add New Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm/6 font-medium text-neutral-950">Title / Subject *</label>
                <div className="mt-2">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Password Reset Instructions"
                    required
                    className={inputClasses}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm/6 font-medium text-neutral-950">Rich Text Content *</label>
                <div className="mt-2 text-neutral-950 bg-white rounded-xl overflow-hidden ring-1 ring-neutral-950/10 focus-within:ring-neutral-950 transition-all">
                  <ReactQuill
                    theme="snow"
                    value={form.content}
                    onChange={(val) => setForm({ ...form, content: val })}
                    placeholder="Type your template here..."
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
                onClick={() => setShowForm(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-950 bg-white ring-1 ring-neutral-300 ring-inset shadow-xs hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !form.title || !form.content || form.content === '<p><br></p>'}
                className="rounded-full bg-neutral-950 px-6 py-2 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </FadeIn>
      )}

      {/* Templates Grid — Studio GridList */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="size-8 rounded-full border-2 border-neutral-200 border-t-neutral-950 animate-spin" />
        </div>
      ) : (
        <GridList>
          {templates.map((template, i) => (
            <GridListItem
              key={template.id}
              title={template.title}
              subtitle={template.id}
              accent={ACCENT_COLORS[i % ACCENT_COLORS.length]}
              className="group"
              actions={
                <button
                  onClick={() => setConfirmDelete(template)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                  title="Delete"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              }
            >
              <div
                className="prose-sm text-neutral-500 line-clamp-3 italic"
                dangerouslySetInnerHTML={{ __html: template.content }}
              />
            </GridListItem>
          ))}
        </GridList>
      )}

      {!loading && templates.length === 0 && (
        <FadeIn>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
              <svg className="size-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-neutral-950 mb-1">No templates yet</h3>
            <p className="text-sm text-neutral-600">Add your first canned response above.</p>
          </div>
        </FadeIn>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={async () => {
          if (confirmDelete) {
            try { await deleteTemplate(confirmDelete.id); } catch (err) { alert(`Failed: ${err.message}`); }
          }
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
