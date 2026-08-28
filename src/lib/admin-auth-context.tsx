"use client";

import { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  sessionToken: string | null;
  loading: boolean;
  refreshSession: () => Promise<boolean>;
}

interface AdminSessionResponse {
  user: AdminUser;
  sessionToken: string;
}

async function fetchAdminSession(): Promise<AdminSessionResponse> {
  const response = await fetch("/api/auth/me", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Admin session unavailable");
  return await response.json();
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  sessionToken: null,
  loading: true,
  refreshSession: async () => false,
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const data = await fetchAdminSession();
      setUser(data.user);
      setSessionToken(data.sessionToken);
      return true;
    } catch {
      setUser(null);
      setSessionToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchAdminSession()
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        setSessionToken(data.sessionToken);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setSessionToken(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, sessionToken, loading, refreshSession }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
