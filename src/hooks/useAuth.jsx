import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

const ROLES = {
  admin: { label: 'Admin', level: 3 },
  agent: { label: 'Agent', level: 2 },
  viewer: { label: 'Viewer', level: 1 },
};

// Session idle timeout in milliseconds (default 30 minutes)
const SESSION_TIMEOUT_MS =
  (parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES, 10) || 30) * 60 * 1000;

// Activity events that reset the idle timer
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ticket_user');
      if (!saved) return null;

      const parsed = JSON.parse(saved);

      // Validate session hasn't expired
      if (parsed?.loginAt) {
        const lastActivity = parsed.lastActivity || parsed.loginAt;
        if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
          // Session expired — clear it
          localStorage.removeItem('ticket_user');
          return null;
        }
      }

      return parsed;
    } catch {
      localStorage.removeItem('ticket_user');
      return null;
    }
  });

  const timeoutRef = useRef(null);
  const activityRef = useRef(0);

  /* ── Session idle timeout ── */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ticket_user');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    activityRef.current = Date.now();

    // Persist last activity timestamp
    try {
      const saved = localStorage.getItem('ticket_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.lastActivity = Date.now();
        localStorage.setItem('ticket_user', JSON.stringify(parsed));
      }
    } catch {
      // Ignore storage errors
    }

    // Reset the timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.warn('[Auth] Session timed out due to inactivity.');
      logout();
    }, SESSION_TIMEOUT_MS);
  }, [logout]);

  // Set up activity listeners when user is logged in
  useEffect(() => {
    if (!user) return;

    // Start the idle timer
    resetIdleTimer();

    // Listen for activity
    const handler = () => resetIdleTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handler, { passive: true }));

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handler));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, resetIdleTimer]);

  const login = useCallback((userData) => {
    const u = { ...userData, loginAt: Date.now(), lastActivity: Date.now() };
    setUser(u);
    localStorage.setItem('ticket_user', JSON.stringify(u));
  }, []);

  /**
   * Get the auth token for API requests.
   * Returns null if not authenticated.
   */
  const getToken = useCallback(() => {
    return user?.token || null;
  }, [user]);

  const hasPermission = useCallback(
    (requiredRole) => {
      if (!user) return false;
      const userLevel = ROLES[user.role]?.level || 0;
      const requiredLevel = ROLES[requiredRole]?.level || 0;
      return userLevel >= requiredLevel;
    },
    [user]
  );

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    getToken,
    hasPermission,
    ROLES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ROLES };
