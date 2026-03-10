import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

/**
 * OAuth callback: Supabase redirects here with #access_token=... in the URL.
 * We must stay on this URL until the session is recovered, then redirect to dashboard.
 * (If we navigated to / or /login first, the hash would be lost and login would fail.)
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const finishLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const userRole = profile?.role || "student";
      if (!profile) {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          role: userRole,
        });
      }
      localStorage.setItem("role", userRole);
      navigate(`/${userRole}`, { replace: true });
    };

    // Session may be in URL hash; Supabase recovers it. Wait for it.
    const timeout = setTimeout(() => {
      if (cancelled) return;
      finishLogin().catch((e) => {
        if (!cancelled) setError(e?.message || "Login failed");
      });
    }, 100);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled || !session) return;
      clearTimeout(timeout);
      finishLogin().catch((e) => {
        if (!cancelled) setError(e?.message || "Login failed");
      });
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => navigate("/login", { replace: true })}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Signing you in...</p>
    </div>
  );
}
