import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const ROLES = {
  admin: { label: 'Admin', level: 3 },
  agent: { label: 'Agent', level: 2 },
  viewer: { label: 'Viewer', level: 1 },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ticket_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData) => {
    const u = { ...userData, loginAt: Date.now() };
    setUser(u);
    localStorage.setItem('ticket_user', JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ticket_user');
  }, []);

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
