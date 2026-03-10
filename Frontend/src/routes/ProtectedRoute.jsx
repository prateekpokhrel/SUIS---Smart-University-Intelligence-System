import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getRole, isAuthed } from "../utils/auth";

export default function ProtectedRoute({ children, role }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const storedRole = getRole();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user && !getRole()) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        if (profile?.role) localStorage.setItem("role", profile.role);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && !getRole()) {
        supabase.from("profiles").select("role").eq("id", session.user.id).single().then(({ data }) => {
          if (data?.role) localStorage.setItem("role", data.role);
        });
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !isAuthed()) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(storedRole)) {
      return <Navigate to={`/${storedRole}`} replace />;
    }
  }

  return children;
}
