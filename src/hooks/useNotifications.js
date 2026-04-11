import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'ticket_notifications';
const MAX_NOTIFICATIONS = 50;

// Plays a subtle "ding" sound using the browser's native Web Audio API
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Frequency glides from A5 to A6 briefly to create a "ding"
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    
    // Sharp attack and quick fade out for a notification tone
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore errors (e.g., if browser blocks autoplay before user interacts)
  }
};

/**
 * useNotifications — detects new tickets, assignment changes, and status changes
 * by comparing current tickets with the previous snapshot. Notifications are
 * persisted in localStorage so they survive page refreshes.
 */
export function useNotifications(tickets) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const prevTicketsRef = useRef(null);
  const hasInitialized = useRef(false);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
    } catch {
      // ignore storage errors
    }
  }, [notifications]);

  // Compare tickets on each update to detect changes
  useEffect(() => {
    if (!tickets || tickets.length === 0) return;

    // Skip the very first load to avoid flooding notifications
    if (!hasInitialized.current) {
      prevTicketsRef.current = new Map(tickets.map(t => [t.id, t]));
      hasInitialized.current = true;
      return;
    }

    const prevMap = prevTicketsRef.current;
    if (!prevMap) return;

    const newNotifs = [];
    const now = new Date().toISOString();

    for (const ticket of tickets) {
      const prev = prevMap.get(ticket.id);

      if (!prev) {
        // New ticket
        newNotifs.push({
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'new_ticket',
          ticketId: ticket.id,
          subject: ticket.subject,
          message: `New ticket: "${ticket.subject}"`,
          timestamp: now,
          read: false,
        });
      } else {
        // Check if assigned to current user
        if (
          user?.name &&
          ticket.agent &&
          ticket.agent.toLowerCase() === user.name.toLowerCase() &&
          (!prev.agent || prev.agent.toLowerCase() !== user.name.toLowerCase())
        ) {
          newNotifs.push({
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'assigned',
            ticketId: ticket.id,
            subject: ticket.subject,
            message: `Ticket "${ticket.subject}" assigned to you`,
            timestamp: now,
            read: false,
          });
        }

        // Check status changes
        if (prev.status !== ticket.status && ticket.status === 'Resolved') {
          newNotifs.push({
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'resolved',
            ticketId: ticket.id,
            subject: ticket.subject,
            message: `Ticket "${ticket.subject}" resolved`,
            timestamp: now,
            read: false,
          });
        }
      }
    }

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev].slice(0, MAX_NOTIFICATIONS));
      
      // Play in-app sound
      playNotificationSound();

      // Browser push notification (if permission granted)
      if (Notification.permission === 'granted') {
        for (const n of newNotifs) {
          try {
            new Notification('Skillected Support', {
              body: n.message,
              icon: '/logo.png',
              tag: n.id,
            });
          } catch {
            // Notifications not supported in this context
          }
        }
      }
    }

    prevTicketsRef.current = new Map(tickets.map(t => [t.id, t]));
  }, [tickets, user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPermission,
  };
}
