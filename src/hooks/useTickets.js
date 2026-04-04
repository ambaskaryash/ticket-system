import { useState, useEffect, useCallback, useRef } from 'react';
import { getTickets, updateTicket as apiUpdateTicket } from '../utils/api';

/**
 * Custom hook for ticket state management with optimistic updates
 */
export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  /* ── Toast helpers ── */
  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Fetch tickets ── */
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTickets();

      // Handle different response shapes
      const ticketList = Array.isArray(data)
        ? data
        : Array.isArray(data?.tickets)
          ? data.tickets
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setTickets(ticketList);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  /* ── Optimistic update ── */
  const updateTicket = useCallback(
    async (ticketId, updates) => {
      // Snapshot for rollback
      const previousTickets = [...tickets];

      // Optimistic UI
      setTickets((prev) =>
        prev.map((t) =>
          (t.id === ticketId || t.ID === ticketId)
            ? { ...t, ...updates }
            : t
        )
      );

      try {
        await apiUpdateTicket({ id: ticketId, ...updates });
        addToast('Ticket updated successfully', 'success');
      } catch (err) {
        // Rollback
        setTickets(previousTickets);
        addToast(`Update failed: ${err.message}`, 'error');
        throw err;
      }
    },
    [tickets, addToast]
  );

  /* ── Computed stats ── */
  const stats = {
    total: tickets.length,
    open: tickets.filter(
      (t) => (t.status || t.Status || '').toLowerCase() === 'open'
    ).length,
    inProgress: tickets.filter(
      (t) => (t.status || t.Status || '').toLowerCase().replace(/[\s_-]/g, '') === 'inprogress'
    ).length,
    resolved: tickets.filter(
      (t) => (t.status || t.Status || '').toLowerCase() === 'resolved'
    ).length,
  };

  return {
    tickets,
    loading,
    error,
    stats,
    fetchTickets,
    updateTicket,
    toasts,
    addToast,
    removeToast,
  };
}

/**
 * Debounced search hook
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
