"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { useServerHealth } from "@/hooks/useServerHealth";
import { motion } from "framer-motion";
import { Lock, User, Loader2, AlertCircle, Coffee } from "lucide-react";

export default function LoginPage() {
  const { isUp, isRetrying } = useServerHealth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.token);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Lab 2</h1>
            <p className="text-indigo-200">Accede al sistema de gestión</p>
          </div>

          {!isUp && isUp !== null && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-500/20 border border-amber-500/50 rounded-2xl flex items-center gap-3 text-amber-200"
            >
              <Coffee className="animate-bounce" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold">El servidor está despertando...</p>
                <p className="text-xs opacity-80">Render está iniciando el servicio (esto toma ~1 min).</p>
              </div>
              <Loader2 className="animate-spin opacity-50" size={16} />
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200"
            >
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {success ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                <div className="text-green-400 text-3xl">✓</div>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">¡Bienvenido!</h2>
              <p className="text-green-200">Sesión iniciada con éxito.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-6 text-indigo-300 hover:text-white transition-colors"
              >
                Volver
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-200 ml-1">Usuario</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    placeholder="Tu nombre de usuario"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-200 ml-1">Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isUp}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : !isUp && isUp !== null ? (
                  "Esperando servidor..."
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
              Laboratorio 2 • Next.js + Spring Boot
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
