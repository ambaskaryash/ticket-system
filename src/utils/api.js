const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Generic fetch wrapper with error handling + timeout
 */
async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      ...options,
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Invalid JSON response from server');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/* ─── POST helper (text/plain to avoid CORS preflight) ─── */
function post(payload) {
  return request(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  });
}

/* ══════════════════════════════════════════════
   TICKET ENDPOINTS
   ══════════════════════════════════════════════ */

export async function getTickets() {
  return request(`${BASE_URL}?action=getTickets`);
}

export async function getTicketById(id) {
  return request(`${BASE_URL}?action=getTicketById&id=${encodeURIComponent(id)}`);
}

export async function createTicket(payload) {
  return post({ action: 'createTicket', ...payload });
}

export async function updateTicket(payload) {
  return post({ action: 'updateTicket', ...payload });
}

export async function deleteTicket(id) {
  return post({ action: 'deleteTicket', id });
}

export async function archiveTicket(id) {
  return post({ action: 'archiveTicket', id });
}

export async function bulkUpdateTickets(ids, updates) {
  return post({ action: 'bulkUpdate', ids, updates });
}

/* ══════════════════════════════════════════════
   NOTES ENDPOINTS
   ══════════════════════════════════════════════ */

export async function getNotes(ticketId) {
  return request(`${BASE_URL}?action=getNotes&ticketId=${encodeURIComponent(ticketId)}`);
}

export async function addNote(ticketId, note) {
  return post({ action: 'addNote', ticketId, ...note });
}

/* ══════════════════════════════════════════════
   AGENT ENDPOINTS
   ══════════════════════════════════════════════ */

export async function getAgents() {
  return request(`${BASE_URL}?action=getAgents`);
}

export async function addAgent(agent) {
  return post({ action: 'addAgent', ...agent });
}

export async function updateAgent(agent) {
  return post({ action: 'updateAgent', ...agent });
}

export async function deleteAgent(email) {
  return post({ action: 'deleteAgent', email });
}

/* ══════════════════════════════════════════════
   AUTH ENDPOINTS
   ══════════════════════════════════════════════ */

export async function login(credentials) {
  return post({ action: 'login', ...credentials });
}

export async function getUsers() {
  return request(`${BASE_URL}?action=getUsers`);
}
