import { useState, useEffect, useCallback } from 'react';
import { getTemplates as apiGetTemplates, addTemplate as apiAddTemplate, deleteTemplate as apiDeleteTemplate } from '../utils/api';

export function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We could leverage the same toast approach if needed or just handle state.
  // For simplicity, we manage state locally here.

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetTemplates();
      setTemplates(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addTemplate = useCallback(async (templateData) => {
    try {
      // Optimistic update
      const tempId = `TEMP-${Date.now()}`;
      const newTemplate = { id: tempId, title: templateData.title, content: templateData.content };
      setTemplates((prev) => [...prev, newTemplate]);

      const result = await apiAddTemplate(templateData);
      
      // Update with real ID from server
      setTemplates((prev) => prev.map(t => t.id === tempId ? { ...t, id: result.id } : t));
      return result;
    } catch (err) {
      // Revert on error
      setTemplates((prev) => prev.filter(t => !String(t.id).startsWith('TEMP-')));
      throw err;
    }
  }, []);

  const deleteTemplate = useCallback(async (id) => {
    const previousTemplates = [...templates];
    setTemplates((prev) => prev.filter(t => t.id !== id));
    try {
      await apiDeleteTemplate(id);
    } catch (err) {
      setTemplates(previousTemplates);
      throw err;
    }
  }, [templates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    addTemplate,
    deleteTemplate
  };
}
