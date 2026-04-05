import DOMPurify from 'dompurify';

/**
 * Strips ALL HTML tags and returns plain text.
 * Use for ticket names, subjects, agent names, etc.
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return str ?? '';
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Allows a safe subset of HTML (bold, italic, links, lists).
 * Use for rich-text areas like descriptions if needed.
 */
export function sanitizeHTML(str) {
  if (typeof str !== 'string') return str ?? '';
  return DOMPurify.sanitize(str, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Recursively sanitize all string values in an object.
 * Applied at the API boundary to sanitize incoming data.
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeText(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
      clean[key] = sanitizeObject(value);
    }
    return clean;
  }
  return obj;
}
