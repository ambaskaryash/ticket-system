import { sanitizeText } from './sanitize';

/**
 * Normalize a raw ticket object from the API into a consistent shape.
 * Eliminates all `t.id || t.ID` fallback patterns across the codebase.
 *
 * Every component should use the normalized field names:
 *   id, name, email, subject, description, status, priority,
 *   agent, createdAt, archived, attachment
 */
export function normalizeTicket(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    // Preserve the raw object for any unhandled fields
    ...raw,

    // ── Normalized fields ──
    id: raw.id || raw.ID || '',
    name: sanitizeText(raw.name || raw.Name || raw.userName || ''),
    email: sanitizeText(raw.email || raw.Email || ''),
    subject: sanitizeText(raw.subject || raw.Subject || ''),
    description: sanitizeText(
      raw.description || raw.Description || raw.message || raw.Message || ''
    ),
    status: normalizeStatus(raw.status || raw.Status || 'Open'),
    priority: normalizePriority(raw.priority || raw.Priority || 'Medium'),
    agent: sanitizeText(raw.agent || raw.Agent || raw.assignedAgent || ''),
    createdAt: raw.createdAt || raw.CreatedAt || raw.timestamp || raw.Timestamp || '',
    archived: toBool(raw.archived || raw.Archived),
    attachment: raw.attachment || raw.Attachment || null,
    attachmentName: raw.attachmentName || raw.AttachmentName || '',
    attachmentMimeType: raw.attachmentMimeType || raw.AttachmentMimeType || '',
    phone: sanitizeText(raw.phone || raw.Phone || ''),
    course: sanitizeText(raw.course || raw.Course || ''),
    batchTiming: sanitizeText(raw.batchTiming || raw.BatchTiming || ''),
  };
}

/**
 * Normalize an array of raw tickets.
 */
export function normalizeTickets(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.tickets)
      ? data.tickets
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return list.map(normalizeTicket).filter(Boolean);
}

/**
 * Normalize a raw agent object from the API.
 */
export function normalizeAgent(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    ...raw,
    name: sanitizeText(raw.name || raw.Name || ''),
    email: sanitizeText(raw.email || raw.Email || ''),
    role: sanitizeText(raw.role || raw.Role || 'Agent'),
  };
}

/**
 * Normalize an array of raw agents.
 */
export function normalizeAgents(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.agents)
      ? data.agents
      : [];

  return list.map(normalizeAgent).filter(Boolean);
}

/**
 * Normalize a raw note object.
 */
export function normalizeNote(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    ...raw,
    author: sanitizeText(raw.author || raw.Author || 'Admin'),
    message: sanitizeText(raw.message || raw.Message || ''),
    timestamp: raw.timestamp || raw.Timestamp || '',
  };
}

/**
 * Normalize an array of raw notes.
 */
export function normalizeNotes(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.notes)
      ? data.notes
      : [];

  return list.map(normalizeNote).filter(Boolean);
}

/* ── Internal helpers ── */

/**
 * Normalize status string to one of: 'Open', 'In Progress', 'Resolved'
 */
function normalizeStatus(s) {
  const key = (s || '').toLowerCase().replace(/[\s_-]/g, '');
  if (key === 'inprogress') return 'In Progress';
  if (key === 'resolved') return 'Resolved';
  if (key === 'open') return 'Open';
  // Return the original capitalized if unknown
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Normalize priority string to one of: 'Low', 'Medium', 'High', 'Critical'
 */
function normalizePriority(p) {
  const key = (p || '').toLowerCase();
  const map = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
  return map[key] || 'Medium';
}

/**
 * Coerce various truthy/falsy representations to boolean.
 */
function toBool(val) {
  if (val === true || val === 'true' || val === 1 || val === '1') return true;
  return false;
}
