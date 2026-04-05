import { normalizeTickets, normalizeTicket, normalizeAgents, normalizeNotes } from './normalize';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ══════════════════════════════════════════════
   REQUEST INFRASTRUCTURE
   ══════════════════════════════════════════════ */

/**
 * In-flight GET requests — used for deduplication.
 * Key = URL, Value = { promise, controller }
 */
const inflightRequests = new Map();

/**
 * Get auth token from localStorage (avoids circular dependency with useAuth).
 */
function getAuthToken() {
  try {
    const saved = localStorage.getItem('ticket_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed?.token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Generic fetch wrapper with error handling, timeout, and CORS-safe auth.
 *
 * NOTE: We intentionally do NOT send custom headers (like X-Auth-Token)
 * because Google Apps Script cannot handle CORS preflight (OPTIONS) requests.
 * Custom headers force the browser to send a preflight, which GAS rejects.
 * Instead, the auth token is passed via query parameters (GET) or body (POST).
 */
async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  // Only use CORS-safe headers — no custom headers to avoid preflight
  const headers = { ...options.headers };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
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

/**
 * Deduplicated GET request — prevents overlapping GET calls to the same URL.
 * If a request to the same URL is already in-flight, reuses that promise.
 */
async function deduplicatedGet(url) {
  if (inflightRequests.has(url)) {
    return inflightRequests.get(url).promise;
  }

  const promise = request(url).finally(() => {
    inflightRequests.delete(url);
  });

  inflightRequests.set(url, { promise });
  return promise;
}

/**
 * Retry a function with exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default 2)
 * @param {number} baseDelay - Base delay in ms (default 1000)
 */
async function retryWithBackoff(fn, maxRetries = 2, baseDelay = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Don't retry on client errors or abort
      if (err.message?.includes('HTTP 4') || err.name === 'AbortError') {
        throw err;
      }
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/* ─── Build GET URL with auth token (avoids custom headers) ─── */
function buildGetUrl(params) {
  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  const token = getAuthToken();
  if (token) {
    url.searchParams.set('token', token);
  }
  return url.toString();
}

/* ─── POST helper (text/plain to avoid CORS preflight) ─── */
function post(payload) {
  // Inject auth token into the POST body (not as a custom header)
  const token = getAuthToken();
  const body = token ? { ...payload, token } : payload;

  return request(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
  });
}

/* ══════════════════════════════════════════════
   TICKET ENDPOINTS
   ══════════════════════════════════════════════ */

export async function getTickets() {
  const data = await retryWithBackoff(() =>
    deduplicatedGet(buildGetUrl({ action: 'getTickets' }))
  );
  return normalizeTickets(data);
}

export async function getTicketById(id) {
  const data = await retryWithBackoff(() =>
    request(buildGetUrl({ action: 'getTicketById', id }))
  );
  return normalizeTicket(data);
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
  const data = await retryWithBackoff(() =>
    request(buildGetUrl({ action: 'getNotes', ticketId }))
  );
  return normalizeNotes(data);
}

export async function addNote(ticketId, note) {
  return post({ action: 'addNote', ticketId, ...note });
}

/* ══════════════════════════════════════════════
   AGENT ENDPOINTS
   ══════════════════════════════════════════════ */

export async function getAgents() {
  const data = await retryWithBackoff(() =>
    deduplicatedGet(buildGetUrl({ action: 'getAgents' }))
  );
  return normalizeAgents(data);
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
  return deduplicatedGet(buildGetUrl({ action: 'getUsers' }));
}
