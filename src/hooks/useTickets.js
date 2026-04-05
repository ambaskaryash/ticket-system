import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTickets,
  updateTicket as apiUpdateTicket,
  createTicket as apiCreateTicket,
  deleteTicket as apiDeleteTicket,
  archiveTicket as apiArchiveTicket,
  bulkUpdateTickets as apiBulkUpdate,
} from '../utils/api';

/**
 * Custom hook for ticket state management with optimistic updates,
 * auto-polling, CRUD operations, and bulk actions.
 *
 * NOTE: `getTickets()` now returns pre-normalized data from the API layer.
 * All tickets have consistent field names: id, name, email, subject,
 * description, status, priority, agent, createdAt, archived.
 */
export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const toastIdRef = useRef(0);
  const pollRef = useRef(null);
  const isFetchingRef = useRef(false);

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

  /* ── Fetch tickets (data arrives pre-normalized from API layer) ── */
  const fetchTickets = useCallback(
    async (silent = false) => {
      // Polling deduplication: skip if a fetch is already in-flight
      if (isFetchingRef.current && silent) return;

      try {
        isFetchingRef.current = true;
        if (!silent) setLoading(true);
        setError(null);

        const ticketList = await getTickets();

        // Detect new incoming tickets during polling
        if (silent && tickets.length > 0) {
          const existingIds = new Set(tickets.map((t) => t.id));
          const newIncoming = ticketList.filter((t) => !existingIds.has(t.id));

          if (newIncoming.length > 0) {
            addToast(`🔔 ${newIncoming.length} new ticket(s) received from server!`, 'success');
          }
        }

        setTickets(ticketList);
      } catch (err) {
        setError(err.message);
        if (!silent) addToast(err.message, 'error');
      } finally {
        isFetchingRef.current = false;
        if (!silent) setLoading(false);
      }
    },
    [addToast, tickets]
  );

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 10-Second Smart-Polling (Real-Time Simulation) ── */
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchTickets(true);
    }, 10000);
    return () => clearInterval(pollRef.current);
  }, [fetchTickets]);

  /* ── Filter active vs archived ── */
  const activeTickets = showArchived
    ? tickets
    : tickets.filter((t) => !t.archived);

  /* ── Create ticket ── */
  const createTicket = useCallback(
    async (ticketData) => {
      try {
        const newTicket = {
          ...ticketData,
          id: `TEMP-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: ticketData.status || 'Open',
        };
        setTickets((prev) => [newTicket, ...prev]);
        await apiCreateTicket(ticketData);
        addToast('Ticket created successfully', 'success');
        fetchTickets(true);
      } catch (err) {
        setTickets((prev) => prev.filter((t) => !String(t.id).startsWith('TEMP-')));
        addToast(`Create failed: ${err.message}`, 'error');
        throw err;
      }
    },
    [addToast, fetchTickets]
  );

  /* ── Optimistic update ── */
  const updateTicket = useCallback(
    async (ticketId, updates) => {
      const previousTickets = [...tickets];

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
      );

      try {
        await apiUpdateTicket({ id: ticketId, ...updates });
        addToast('Ticket updated successfully', 'success');
      } catch (err) {
        setTickets(previousTickets);
        addToast(`Update failed: ${err.message}`, 'error');
        throw err;
      }
    },
    [tickets, addToast]
  );

  /* ── Delete ticket ── */
  const deleteTicket = useCallback(
    async (ticketId) => {
      const previousTickets = [...tickets];
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));

      try {
        await apiDeleteTicket(ticketId);
        addToast('Ticket deleted', 'success');
      } catch (err) {
        setTickets(previousTickets);
        addToast(`Delete failed: ${err.message}`, 'error');
        throw err;
      }
    },
    [tickets, addToast]
  );

  /* ── Archive ticket ── */
  const archiveTicket = useCallback(
    async (ticketId) => {
      const previousTickets = [...tickets];
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, archived: true } : t))
      );

      try {
        await apiArchiveTicket(ticketId);
        addToast('Ticket archived', 'success');
      } catch (err) {
        setTickets(previousTickets);
        addToast(`Archive failed: ${err.message}`, 'error');
        throw err;
      }
    },
    [tickets, addToast]
  );

  /* ── Bulk update ── */
  const bulkUpdate = useCallback(
    async (ids, updates) => {
      const previousTickets = [...tickets];
      setTickets((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, ...updates } : t))
      );

      try {
        await apiBulkUpdate(ids, updates);
        addToast(`${ids.length} tickets updated`, 'success');
      } catch (err) {
        setTickets(previousTickets);
        addToast(`Bulk update failed: ${err.message}`, 'error');
        throw err;
      }
    },
    [tickets, addToast]
  );

  /* ── Computed stats (using normalized field names) ── */
  const stats = {
    total: activeTickets.length,
    open: activeTickets.filter((t) => t.status === 'Open').length,
    inProgress: activeTickets.filter((t) => t.status === 'In Progress').length,
    resolved: activeTickets.filter((t) => t.status === 'Resolved').length,
  };

  return {
    tickets: activeTickets,
    allTickets: tickets,
    loading,
    error,
    stats,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    archiveTicket,
    bulkUpdate,
    toasts,
    addToast,
    removeToast,
    showArchived,
    setShowArchived,
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
