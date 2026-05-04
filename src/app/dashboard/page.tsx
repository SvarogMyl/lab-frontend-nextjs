"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, Database, Search } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>No tienes acceso. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">L</div>
              <span className="font-bold text-xl tracking-tight text-white">Lab System</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Stats Cards */}
          <Link href="/items" className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl hover:bg-indigo-600/20 transition-all block group">
            <div className="bg-indigo-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
              <LayoutDashboard size={24} />
            </div>
            <h3 className="text-sm font-medium text-indigo-300 uppercase tracking-wider">Gestión de Items</h3>
            <p className="text-sm text-slate-400 mt-2">Crear, editar y eliminar inventario</p>
          </Link>

          <div className="bg-emerald-600/10 border border-emerald-500/20 p-8 rounded-3xl">
            <div className="bg-emerald-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
              <Database size={24} />
            </div>
            <h3 className="text-sm font-medium text-emerald-300 uppercase tracking-wider">Conexión DB</h3>
            <p className="text-4xl font-bold text-white mt-2">Estable</p>
          </div>

          <Link href="/catalogo" className="bg-amber-600/10 border border-amber-500/20 p-8 rounded-3xl hover:bg-amber-600/20 transition-all block group">
            <div className="bg-amber-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
              <Search size={24} />
            </div>
            <h3 className="text-sm font-medium text-amber-300 uppercase tracking-wider">Catálogo</h3>
            <p className="text-sm text-slate-400 mt-2">Consulta el stock de medicamentos</p>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-indigo-400">#</div>
                  <div>
                    <p className="text-white font-medium">Log de sistema #{i}</p>
                    <p className="text-sm text-slate-400">Autenticación exitosa - Usuario admin</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">Hace 2 horas</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
