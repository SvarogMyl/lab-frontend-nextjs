"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Plus, Edit2, Trash2, Check, X, Box, LogOut } from "lucide-react";
import Link from "next/link";
import { Item, getItems, createItem, updateItem, deleteItem } from "@/lib/api";

export default function ItemsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  // Estados para UI Animada
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState<number | "new" | null>(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (storedToken) {
      loadItems(storedToken, page);
    } else {
      window.location.href = "/";
    }
  }, [page]);

  // Auto-cerrar notificación
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: "", type: null }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const loadItems = async (authToken: string, pageNum: number) => {
    try {
      setLoading(true);
      const data = await getItems(authToken, pageNum, pageSize);
      setItems(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.message || "Error al cargar items");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    if (!formData.nombre.trim()) return;

    try {
      if (isEditing === "new") {
        await createItem(token, formData);
        setNotification({ message: "¡Item creado con éxito!", type: "success" });
        if (page === 0) loadItems(token, 0);
        else setPage(0);
      } else if (typeof isEditing === "number") {
        await updateItem(token, isEditing, formData);
        setNotification({ message: "¡Item actualizado correctamente!", type: "success" });
        loadItems(token, page);
      }
      setIsEditing(null);
      setFormData({ nombre: "", descripcion: "" });
    } catch (err: any) {
      setNotification({ message: err.message || "Error al guardar", type: "error" });
    }
  };

  const executeDelete = async () => {
    if (!token || confirmDelete === null) return;
    try {
      await deleteItem(token, confirmDelete);
      setNotification({ message: "Item eliminado satisfactoriamente", type: "success" });
      setConfirmDelete(null);
      loadItems(token, page);
    } catch (err: any) {
      setNotification({ message: err.message || "Error al eliminar", type: "error" });
      setConfirmDelete(null);
    }
  };

  const startEdit = (item: Item) => {
    setFormData({ nombre: item.nombre, descripcion: item.descripcion || "" });
    setIsEditing(item.id as number);
  };

  const startNew = () => {
    setFormData({ nombre: "", descripcion: "" });
    setIsEditing("new");
  };

  if (!token) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Redirigiendo...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
      {/* Notificación (Toast) */}
      <AnimatePresence>
        {notification.message && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-4 left-1/2 z-[100] px-6 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl ${
              notification.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {notification.type === "success" ? <Check size={20} /> : <X size={20} />}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mb-6 mx-auto">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">¿Confirmar eliminación?</h3>
              <p className="text-slate-400 text-center mb-8 text-sm">Esta acción no se puede deshacer. El item se borrará permanentemente de la base de datos.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all shadow-lg shadow-red-500/20"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 border border-white/5 transition-all shadow-inner" title="Volver al Inicio">
                <Home size={20} />
              </Link>
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                <Box size={20} className="text-indigo-400" />
                Gestión de Items
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={startNew}
                disabled={isEditing !== null}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 font-medium"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nuevo Item</span>
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
                <span className="hidden lg:inline text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8 items-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Inventario ({totalElements})</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">Cargando items...</div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No hay items registrados en esta página.</div>
            ) : (
              <>
                <ul className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.li 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <h3 className="text-white font-medium text-lg">{item.nombre}</h3>
                          <p className="text-slate-400 text-sm mt-1 line-clamp-1">{item.descripcion || "Sin descripción"}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => startEdit(item)}
                            title="Editar Item"
                            className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all flex items-center gap-2 group"
                          >
                            <Edit2 size={16} />
                            <span className="hidden lg:inline text-xs font-medium">Modificar</span>
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(item.id!)}
                            title="Eliminar Item"
                            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center gap-2 group"
                          >
                            <Trash2 size={16} />
                            <span className="hidden lg:inline text-xs font-medium">Eliminar</span>
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between">
                    <button 
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
                    >
                      Anterior
                    </button>
                    <div className="text-sm text-slate-400">
                      Página <span className="text-white font-medium">{page + 1}</span> de <span className="text-white font-medium">{totalPages}</span>
                    </div>
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>

          <AnimatePresence>
            {isEditing !== null && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 sticky top-24"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  {isEditing === "new" ? "Crear Nuevo Item" : "Editar Item"}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nombre</label>
                    <input 
                      type="text" 
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      placeholder="Ej. Teclado Mecánico"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Descripción</label>
                    <textarea 
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[100px] resize-y"
                      placeholder="Ej. Switch rojo, layout US..."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsEditing(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <X size={16} /> Cancelar
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={!formData.nombre.trim()}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Check size={16} /> Guardar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
