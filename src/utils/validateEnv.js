/**
 * Validates required environment variables on app startup.
 * Crashes early with clear error messages instead of silent failures.
 */
export function validateEnv() {
  const errors = [];

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl || apiUrl === 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
    errors.push('VITE_API_BASE_URL is not configured. Set it in your .env file.');
  }

  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (!recaptchaKey) {
    console.warn(
      '[ENV] VITE_RECAPTCHA_SITE_KEY is not set. reCAPTCHA will not work on the submit form.'
    );
  }

  if (errors.length > 0) {
    console.error(
      '╔══════════════════════════════════════════╗\n' +
      '║   ENVIRONMENT CONFIGURATION ERROR        ║\n' +
      '╚══════════════════════════════════════════╝\n\n' +
      errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n') +
      '\n\nSee .env.example for required variables.\n'
    );
    // Don't crash in development — show warning banner instead
    if (import.meta.env.PROD) {
      throw new Error('Missing required environment variables. See console for details.');
    }
  }
}
