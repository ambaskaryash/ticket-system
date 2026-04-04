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
 */
export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const toastIdRef = useRef(0);
  const pollRef = useRef(null);

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
  const fetchTickets = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError(null);
        const data = await getTickets();

        const ticketList = Array.isArray(data)
          ? data
          : Array.isArray(data?.tickets)
            ? data.tickets
            : Array.isArray(data?.data)
              ? data.data
              : [];

        // Differential cross-check: Detect specifically *new* incoming tickets during polling
        if (silent && tickets.length > 0) {
          // get IDs we already have locally
          const existingIds = new Set(tickets.map(t => t.id || t.ID));
          const newIncoming = ticketList.filter(t => !existingIds.has(t.id || t.ID));
          
          if (newIncoming.length > 0) {
            addToast(`🔔 ${newIncoming.length} new ticket(s) received from server!`, 'success');
          }
        }

        setTickets(ticketList);
      } catch (err) {
        setError(err.message);
        if (!silent) addToast(err.message, 'error');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
    : tickets.filter((t) => {
        const archived = t.archived || t.Archived;
        return !archived || archived === 'false' || archived === false;
      });

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
        // Refetch to get the real ID
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
        prev.map((t) =>
          t.id === ticketId || t.ID === ticketId ? { ...t, ...updates } : t
        )
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
      setTickets((prev) => prev.filter((t) => (t.id || t.ID) !== ticketId));

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
        prev.map((t) =>
          (t.id || t.ID) === ticketId ? { ...t, archived: true, Archived: true } : t
        )
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
        prev.map((t) =>
          ids.includes(t.id || t.ID) ? { ...t, ...updates } : t
        )
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

  /* ── Computed stats ── */
  const stats = {
    total: activeTickets.length,
    open: activeTickets.filter(
      (t) => (t.status || t.Status || '').toLowerCase() === 'open'
    ).length,
    inProgress: activeTickets.filter(
      (t) => (t.status || t.Status || '').toLowerCase().replace(/[\s_-]/g, '') === 'inprogress'
    ).length,
    resolved: activeTickets.filter(
      (t) => (t.status || t.Status || '').toLowerCase() === 'resolved'
    ).length,
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
