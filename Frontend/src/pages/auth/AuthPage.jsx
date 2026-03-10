import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, UserCog, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

const roleGradient = {
  student: "from-indigo-600 via-violet-600 to-purple-700",
  teacher: "from-amber-500 via-orange-500 to-rose-500",
  admin: "from-emerald-600 via-green-500 to-lime-600",
};

const roleButton = {
  student:
    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-200 font-extrabold tracking-wider",
  teacher:
    "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-orange-200 font-bold tracking-wider",
  admin:
    "bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 shadow-emerald-200 font-extrabold tracking-wider",
};

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (session?.user) {
          const savedRole = localStorage.getItem("role");
          if (savedRole) {
            navigate(`/${savedRole}`, { replace: true });
            return;
          }
          await ensureProfileAndRole(session.user);
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await checkSession();
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const handleGoogleAuth = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const { data, error: signError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (signError) throw signError;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google auth error:", err);
      if (err.message && !err.message.includes("popup")) {
        setError("Failed to connect with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  async function ensureProfileAndRole(user) {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      const userRole = profile?.role || role;

      // Create or update profile if needed
      if (!profile) {
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            role: userRole,
          }, {
            onConflict: 'id'
          });

        if (upsertError) {
          console.error("Profile upsert error:", upsertError);
          throw upsertError;
        }
      }

      localStorage.setItem("role", userRole);
      navigate(`/${userRole}`, { replace: true });
    } catch (err) {
      console.error("Profile setup error:", err);
      setError("Failed to set up your profile. Please try logging in again.");
      await supabase.auth.signOut();
    }
  }

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignup) {
        // Sign up new user
        const { data, error: signError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { role },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          },
        });

        if (signError) throw signError;

        if (data?.user) {
          // Check if email confirmation is required
          if (data.user.identities && data.user.identities.length === 0) {
            setError("This email is already registered. Please sign in instead.");
            setIsSignup(false);
            setLoading(false);
            return;
          }

          // Create profile
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email,
              role,
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
          }

          // Check if email confirmation is needed
          if (data.session) {
            localStorage.setItem("role", role);
            setSuccess("Account created successfully! Redirecting...");
            setTimeout(() => {
              navigate(`/${role}`, { replace: true });
            }, 1000);
          } else {
            setSuccess("Account created! Please check your email to confirm your account before signing in.");
            setTimeout(() => {
              setIsSignup(false);
              setSuccess("");
            }, 5000);
          }
        }
      } else {
        // Sign in existing user
        const { data, error: signError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });

        if (signError) throw signError;

        if (data?.user) {
          await ensureProfileAndRole(data.user);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      
      // Better error messages
      let errorMessage = "An error occurred. Please try again.";
      
      if (err.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check and try again.";
      } else if (err.message?.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email before signing in. Check your inbox.";
      } else if (err.message?.includes("User already registered")) {
        errorMessage = "This email is already registered. Please sign in instead.";
        setIsSignup(false);
      } else if (err.message?.includes("Auth session missing")) {
        errorMessage = "Session expired. Please try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAuth();
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-white dark:bg-slate-950">
      <motion.div
        className={`relative hidden md:flex flex-col justify-center px-12 lg:px-20
                    bg-gradient-to-br ${roleGradient[role]} text-white
                    bg-[length:200%_200%] h-full`}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <img src="/suis-logo-web.png" alt="Logo" className="absolute top-10 left-12 w-16 h-16 opacity-90" />
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight text-white">
            Welcome to <span className="text-white/80">SUIS</span>
          </h1>
          <p className="text-xl opacity-90 mb-8 font-medium">Smart University Intelligence System</p>
        </motion.div>
      </motion.div>

      <div className="h-full overflow-y-auto flex flex-col items-center justify-start md:justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900
                        p-8 md:p-10 my-auto rounded-[2.5rem] shadow-2xl shadow-slate-200/60
                        dark:shadow-none border border-slate-100 dark:border-slate-800 relative">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {isSignup ? "Creating account..." : "Signing in..."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {isSignup ? "Create Account" : "Sign In"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isSignup ? "Join the intelligence system" : "Access your intelligent dashboard"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <RoleCard icon={<GraduationCap size={20} />} label="Student" active={role === "student"} onClick={() => setRole("student")} />
            <RoleCard icon={<UserCog size={20} />} label="Teacher" active={role === "teacher"} onClick={() => setRole("teacher")} />
            <RoleCard icon={<ShieldCheck size={20} />} label="Admin" active={role === "admin"} onClick={() => setRole("admin")} />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
            >
              <p className="text-green-600 dark:text-green-400 text-xs text-center font-medium">{success}</p>
            </motion.div>
          )}

          <div className="space-y-3">
            <input
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              type="password" 
              placeholder="Password (min. 6 characters)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            className={`w-full mt-6 py-4 rounded-2xl text-white font-bold shadow-lg transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              loading ? "bg-slate-400" : roleButton[role]
            }`}
          >
            {isSignup ? "Create Account" : "Login"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">Or Secure Login</span>
            </div>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p className="text-xs text-center mt-6 text-slate-500 dark:text-slate-400">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => { 
                setIsSignup(!isSignup); 
                setError(""); 
                setSuccess("");
              }}
              disabled={loading}
              className="font-bold text-slate-900 dark:text-white hover:underline underline-offset-4 disabled:opacity-50"
            >
              {isSignup ? "Sign In" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 transition-all
        ${active
          ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 shadow-sm"
          : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300"}
      `}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[9px] uppercase font-black tracking-wider">{label}</span>
    </button>
  );
}