"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Home, Pill, ChevronLeft, ChevronRight, CheckCircle2, XCircle, LogOut, ListOrdered, Filter, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Medicamento {
  CODIGO: string;
  MEDICAMENTO: string;
  PRESENTACIÓN: string;
  ESTADO: string;
  "ÚLTIMA ACTUALIZACIÓN": string;
}

const DATA_URL = "/api/catalogo";

export default function CatalogoPage() {
  const [data, setData] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("todos");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  
  // Paginación y Registros
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const optionsPerPage = [5, 10, 25, 50, 100, 200];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error("No se pudo cargar el catálogo.");
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const tiposDisponibles = useMemo(() => {
    const tipos = new Set<string>();
    data.forEach(item => {
      const pres = (item.PRESENTACIÓN || "").toUpperCase();
      if (pres.includes("COMPRIMIDO") || pres.includes("COMPrido")) tipos.add("Comprimidos");
      else if (pres.includes("JARABE") || pres.includes("JBE")) tipos.add("Jarabes");
      else if (pres.includes("CREMA") || pres.includes("UNG")) tipos.add("Cremas/Ungüentos");
      else if (pres.includes("SOL OFT") || pres.includes("OFTENO")) tipos.add("Oftálmicos");
      else if (pres.includes("INYECTABLE") || pres.includes("INY")) tipos.add("Inyectables");
      else if (pres.includes("OVULO")) tipos.add("Óvulos");
      else if (pres.includes("SOBRE") || pres.includes("SACHET")) tipos.add("Sobres");
    });
    return Array.from(tipos).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = 
        (item.MEDICAMENTO?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.CODIGO?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      
      const matchesStock = 
        stockFilter === "todos" || 
        (stockFilter === "con-stock" && (item.ESTADO || "").toLowerCase().includes("con stock")) ||
        (stockFilter === "sin-stock" && (item.ESTADO || "").toLowerCase().includes("sin stock"));

      const matchesType = typeFilter === "todos" || (() => {
        const pres = (item.PRESENTACIÓN || "").toUpperCase();
        if (typeFilter === "Comprimidos") return pres.includes("COMPRIMIDO") || pres.includes("COMPrido");
        if (typeFilter === "Jarabes") return pres.includes("JARABE") || pres.includes("JBE");
        if (typeFilter === "Cremas/Ungüentos") return pres.includes("CREMA") || pres.includes("UNG");
        if (typeFilter === "Oftálmicos") return pres.includes("SOL OFT") || pres.includes("OFTENO");
        if (typeFilter === "Inyectables") return pres.includes("INYECTABLE") || pres.includes("INY");
        if (typeFilter === "Óvulos") return pres.includes("OVULO");
        if (typeFilter === "Sobres") return pres.includes("SOBRE") || pres.includes("SACHET");
        return false;
      })();

      return matchesSearch && matchesStock && matchesType;
    });
  }, [data, searchTerm, stockFilter, typeFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter, typeFilter, itemsPerPage]);

  const stats = useMemo(() => {
    const conStock = data.filter(i => (i.ESTADO || "").toLowerCase().includes("con stock")).length;
    return {
      total: data.length,
      conStock,
      sinStock: data.length - conStock
    };
  }, [data]);

  const RecordsPerPageSelector = () => (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
      <ListOrdered size={14} className="text-indigo-400" />
      <span>Mostrar:</span>
      <select
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(Number(e.target.value))}
        className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-800"
      >
        {optionsPerPage.map(opt => (
          <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 border border-white/5 transition-all shadow-inner">
                <Home size={20} />
              </Link>
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                <Pill size={20} className="text-indigo-400" />
                Catálogo
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mr-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  {stats.conStock} Con Stock
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  {stats.sinStock} Sin Stock
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          <aside className="space-y-6 sticky top-24">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Filter size={18} className="text-indigo-400" />
                Filtros
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Búsqueda rápida</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disponibilidad</label>
                  <div className="flex flex-col gap-2">
                    {["todos", "con-stock", "sin-stock"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setStockFilter(opt)}
                        className={`text-left px-4 py-2.5 rounded-xl text-sm transition-all border ${
                          stockFilter === opt 
                            ? "bg-indigo-600/20 border-indigo-500/50 text-white font-medium" 
                            : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {opt === "todos" ? "Todos los estados" : opt === "con-stock" ? "En Stock" : "Agotados"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Presentación</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <option value="todos" className="bg-slate-900">Todas las presentaciones</option>
                    {tiposDisponibles.map(tipo => (
                      <option key={tipo} value={tipo} className="bg-slate-900">{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-indigo-300 uppercase mb-2">Total Catálogo</h4>
              <p className="text-4xl font-bold text-white">{stats.total}</p>
            </div>
          </aside>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-semibold text-white">
                  Medicamentos 
                  <span className="text-slate-500 font-normal ml-2">({filteredData.length})</span>
                </h2>
                <RecordsPerPageSelector />
              </div>

              {loading ? (
                <div className="p-24 flex flex-col items-center justify-center text-slate-500">
                  <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
                  Cargando...
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <AlertCircle className="mx-auto mb-4 text-red-400" size={40} />
                  <p className="text-red-200">{error}</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-24 text-center text-slate-500">
                  No se encontraron resultados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.03] text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Medicamento</th>
                        <th className="px-6 py-4">Presentación</th>
                        <th className="px-6 py-4">Código</th>
                        <th className="px-6 py-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <AnimatePresence mode="popLayout">
                        {paginatedData.map((item, idx) => (
                          <motion.tr
                            key={item.CODIGO || idx}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <p className="text-white font-medium group-hover:text-indigo-300 transition-colors">{item.MEDICAMENTO}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 uppercase">Act: {item["ÚLTIMA ACTUALIZACIÓN"]}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {item.PRESENTACIÓN}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-slate-500">
                              {item.CODIGO}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                (item.ESTADO || "").toLowerCase().includes("con stock") 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>
                                {(item.ESTADO || "").toLowerCase().includes("con stock") ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {item.ESTADO}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex flex-col sm:flex-row gap-4 items-center justify-between">
                <RecordsPerPageSelector />
                
                {!loading && totalPages > 1 && (
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400">
                      Página <span className="text-white font-medium">{currentPage}</span> de <span className="text-white font-medium">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
