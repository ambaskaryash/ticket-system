const BASE_URL =
  'https://script.google.com/macros/s/AKfycbz6Sby8lq9o30bqRIyOm8eYMwhjCbATbeqGweZYGBaaRZj48-HIUa1uw5dDa48zeGeb/exec';

/**
 * Generic fetch wrapper with error handling + timeout
 * Google Apps Script deployments redirect (302) and require
 * `redirect: 'follow'` (the default). CORS should work if the
 * GAS app returns proper headers — but if the endpoint isn't configured
 * for CORS we gracefully handle errors.
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

    // GAS sometimes returns JSONP or wrapped response
    try {
      return JSON.parse(text);
    } catch {
      // Try to extract JSON from potential wrapper
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
 * GET all tickets
 */
export async function getTickets() {
  const data = await request(`${BASE_URL}?action=getTickets`);
  return data;
}

/**
 * GET single ticket by ID
 */
export async function getTicketById(id) {
  const data = await request(`${BASE_URL}?action=getTicketById&id=${encodeURIComponent(id)}`);
  return data;
}

/**
 * POST update a ticket
 * GAS web apps usually need Content-Type: text/plain for POST to avoid
 * preflight CORS requests. The payload goes in the body as JSON string.
 */
export async function updateTicket(payload) {
  const data = await request(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateTicket', ...payload }),
  });
  return data;
}
