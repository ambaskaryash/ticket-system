/* ═══════════════════════════════════════
   SLA CONFIGURATION & HELPERS
   ═══════════════════════════════════════ */

// SLA deadlines in hours per priority
const SLA_HOURS = {
  critical: 4,
  high: 8,
  medium: 24,
  low: 48,
};

/**
 * Calculate SLA status for a ticket
 * @returns {{ label, hoursLeft, percent, status: 'ok' | 'warning' | 'breach' }}
 */
export function getSLAStatus(ticket) {
  const status = (ticket.status || ticket.Status || '').toLowerCase().replace(/[\s_-]/g, '');
  if (status === 'resolved') {
    return { label: 'Resolved', hoursLeft: null, percent: 100, status: 'resolved' };
  }

  const priority = (ticket.priority || ticket.Priority || 'medium').toLowerCase();
  const createdAt = ticket.createdAt || ticket.CreatedAt || ticket.timestamp || ticket.Timestamp;

  if (!createdAt) {
    return { label: 'No date', hoursLeft: null, percent: 0, status: 'unknown' };
  }

  const created = new Date(createdAt);
  if (isNaN(created.getTime())) {
    return { label: 'Invalid date', hoursLeft: null, percent: 0, status: 'unknown' };
  }

  const slaMs = (SLA_HOURS[priority] || 24) * 60 * 60 * 1000;
  const elapsed = Date.now() - created.getTime();
  const remaining = slaMs - elapsed;
  const hoursLeft = remaining / (60 * 60 * 1000);
  const percent = Math.min(100, Math.max(0, (elapsed / slaMs) * 100));

  if (remaining <= 0) {
    const overdueMins = Math.abs(remaining) / 60000;
    const overdueStr = overdueMins >= 60
      ? `${Math.floor(overdueMins / 60)}h overdue`
      : `${Math.floor(overdueMins)}m overdue`;
    return { label: overdueStr, hoursLeft, percent: 100, status: 'breach' };
  }

  if (hoursLeft <= (SLA_HOURS[priority] || 24) * 0.25) {
    // Less than 25% time remaining
    const h = Math.floor(hoursLeft);
    const m = Math.floor((hoursLeft - h) * 60);
    return { label: `${h}h ${m}m left`, hoursLeft, percent, status: 'warning' };
  }

  const h = Math.floor(hoursLeft);
  const m = Math.floor((hoursLeft - h) * 60);
  return { label: `${h}h ${m}m left`, hoursLeft, percent, status: 'ok' };
}

export { SLA_HOURS };
