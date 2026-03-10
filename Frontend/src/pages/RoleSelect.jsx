import { useNavigate } from "react-router-dom";
import { login } from "../utils/auth";
import { motion } from "framer-motion";

export default function RoleSelect() {
  const navigate = useNavigate();

  const enter = (role) => {
    login(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-2xl shadow-xl w-96 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">SUIS</h1>
        <p className="text-gray-500 mb-6">Select your role</p>

       <div className="grid grid-cols-3 gap-4">
  {/* STUDENT */}
  <button
    onClick={() => enter("student")}
    className="group flex flex-col items-center justify-center gap-2 
    py-5 rounded-2xl border-2 
    border-indigo-600 bg-indigo-50 text-indigo-700
    shadow-md hover:shadow-xl hover:-translate-y-1 transition-all
    font-extrabold tracking-widest"
  >
    <span className="text-2xl">🎓</span>
    <span className="text-sm">STUDENT</span>
  </button>

  {/* TEACHER */}
  <button
    onClick={() => enter("teacher")}
    className="group flex flex-col items-center justify-center gap-2 
    py-5 rounded-2xl border-2 
    border-slate-400 bg-slate-50 text-slate-700
    shadow-md hover:shadow-xl hover:-translate-y-1 transition-all
    font-bold tracking-widest"
  >
    <span className="text-2xl">👨‍🏫</span>
    <span className="text-sm">TEACHER</span>
  </button>

  {/* ADMIN */}
  <button
    onClick={() => enter("admin")}
    className="group flex flex-col items-center justify-center gap-2 
    py-5 rounded-2xl border-2 
    border-emerald-600 bg-emerald-50 text-emerald-700
    shadow-md hover:shadow-xl hover:-translate-y-1 transition-all
    font-extrabold tracking-widest"
  >
    <span className="text-2xl">🛡️</span>
    <span className="text-sm">ADMIN</span>
  </button>
</div>

      </motion.div>
    </div>
  );
}
