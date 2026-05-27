import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "patient" | "psychologist" | "admin";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  specialty?: string | null;
  crp?: string | null;
  role?: AppRole;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadExtras = async (uid: string) => {
    const { data: profileRow, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, specialty, crp, role")
      .eq("id", uid)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const profileData = profileRow as Profile;

    setRole(profileData.role ?? null);
    setProfile(profileData);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);

      if (s?.user) {
        setTimeout(() => loadExtras(s.user.id), 0);
      } else {
        setRole(null);
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);

      if (data.session?.user) {
        loadExtras(data.session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refresh = async () => {
    if (session?.user) {
      await loadExtras(session.user.id);
    }
  };

  return (
    <AuthCtx.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        profile,
        loading,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}