import { useState, Dispatch, SetStateAction, FormEvent } from "react";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OptionAnalysis, ProConItem } from "../types";

interface ProsConsListProps {
  options: OptionAnalysis[];
  onUpdateOptions: Dispatch<SetStateAction<OptionAnalysis[]>>;
}

export default function ProsConsList({ options, onUpdateOptions }: ProsConsListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImpact, setNewImpact] = useState<'high' | 'medium' | 'low'>('medium');
  const [activeTab, setActiveTab] = useState<string>(options[0]?.id || "");
  const [newItemType, setNewItemType] = useState<'pro' | 'con'>('pro');

  const selectedOption = options.find(o => o.id === activeTab) || options[0];

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const id = `item_custom_${Date.now()}`;
    const newItem: ProConItem = {
      id,
      title: newTitle.trim(),
      description: newDesc.trim() || "Añadido manualmente por el usuario.",
      impact: newImpact
    };

    onUpdateOptions(prev => prev.map(opt => {
      if (opt.id === selectedOption.id) {
        return {
          ...opt,
          pros: newItemType === 'pro' ? [...opt.pros, newItem] : opt.pros,
          cons: newItemType === 'con' ? [...opt.cons, newItem] : opt.cons,
        };
      }
      return opt;
    }));

    setNewTitle("");
    setNewDesc("");
    setNewImpact('medium');
  };

  const handleRemoveItem = (id: string, type: 'pro' | 'con') => {
    onUpdateOptions(prev => prev.map(opt => {
      if (opt.id === selectedOption.id) {
        return {
          ...opt,
          pros: type === 'pro' ? opt.pros.filter(i => i.id !== id) : opt.pros,
          cons: type === 'con' ? opt.cons.filter(i => i.id !== id) : opt.cons,
        };
      }
      return opt;
    }));
  };

  const handleChangeImpact = (id: string, type: 'pro' | 'con', currentImpact: 'high' | 'medium' | 'low') => {
    const nextMap: Record<'high' | 'medium' | 'low', 'high' | 'medium' | 'low'> = {
      low: 'medium',
      medium: 'high',
      high: 'low'
    };
    const nextImpact = nextMap[currentImpact];

    onUpdateOptions(prev => prev.map(opt => {
      if (opt.id === selectedOption.id) {
        return {
          ...opt,
          pros: type === 'pro' ? opt.pros.map(i => i.id === id ? { ...i, impact: nextImpact } : i) : opt.pros,
          cons: type === 'con' ? opt.cons.map(i => i.id === id ? { ...i, impact: nextImpact } : i) : opt.cons,
        };
      }
      return opt;
    }));
  };

  // Helper score balance: pros vs cons weighted by impact: high(3), med(2), low(1)
  const getDynamicBalance = (opt: OptionAnalysis) => {
    const weight = (p: ProConItem) => p.impact === 'high' ? 3 : p.impact === 'medium' ? 2 : 1;
    const prosScore = opt.pros.reduce((sum, item) => sum + weight(item), 0);
    const consScore = opt.cons.reduce((sum, item) => sum + weight(item), 0);
    const balance = prosScore - consScore;
    return { balance, prosScore, consScore };
  };

  if (!selectedOption) return null;

  const { balance } = getDynamicBalance(selectedOption);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>Baliza de Pros y Contras</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5 font-sans">
            Explora los puntos positivos y negativos generados por la IA. ¡Añade o edita los tuyos propios y verás el balance recalcularse!
          </p>
        </div>

        {/* Navigation tabs between options */}
        <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl self-start">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveTab(opt.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === opt.id
                  ? "bg-white text-indigo-600 shadow-sm font-sans"
                  : "text-slate-600 hover:text-slate-800 font-sans"
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Option Intro and Score indicators */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex-1">
          <h3 className="font-sans font-semibold text-slate-800 text-lg">
            {selectedOption.name}
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5 leading-relaxed">
            {selectedOption.description}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-sans">
          <div className="text-center px-4 py-3 bg-white border border-slate-200/80 rounded-xl shadow-sm min-w-[96px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
              IA score
            </span>
            <span className="text-2xl font-bold text-indigo-600 font-display">
              {selectedOption.score}
              <span className="text-xs text-slate-400 font-normal">/10</span>
            </span>
          </div>

          <div className="text-center px-4 py-3 bg-white border border-slate-200/80 rounded-xl shadow-sm min-w-[96px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
              balanza act.
            </span>
            <span className={`text-2xl font-bold font-display ${
              balance > 0 ? "text-emerald-500" : balance < 0 ? "text-rose-500" : "text-slate-500"
            }`}>
              {balance > 0 ? `+${balance}` : balance}
            </span>
          </div>
        </div>
      </div>

      {/* Column pros and cons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* PROS COLUMN */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Pros / Ventajas ({selectedOption.pros.length})</span>
          </h4>

          <div className="space-y-3 min-h-[120px] transition-all">
            <AnimatePresence initial={false}>
              {selectedOption.pros.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group relative p-4 bg-emerald-50/20 border border-emerald-100 hover:border-emerald-200/60 rounded-xl flex items-start gap-3 transition-shadow"
                >
                  <ArrowUpRight className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 pr-6">
                    <h5 className="font-sans font-semibold text-slate-800 text-sm">
                      {item.title}
                    </h5>
                    <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleChangeImpact(item.id, 'pro', item.impact)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer uppercase transition-all select-none ${
                          item.impact === 'high'
                            ? "bg-emerald-600 text-white"
                            : item.impact === 'medium'
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        title="Haz clic para modificar el peso de este impacto"
                      >
                        Impacto: {item.impact === 'high' ? 'Alto' : item.impact === 'medium' ? 'Medio' : 'Bajo'}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id, 'pro')}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar punto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedOption.pros.length === 0 && (
              <div className="text-center p-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-sans">
                Sin pros configurados. ¡Agrega uno abajo!
              </div>
            )}
          </div>
        </div>

        {/* CONS COLUMN */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Contras / Desventajas ({selectedOption.cons.length})</span>
          </h4>

          <div className="space-y-3 min-h-[120px] transition-all">
            <AnimatePresence initial={false}>
              {selectedOption.cons.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group relative p-4 bg-rose-50/20 border border-rose-100 hover:border-rose-200/60 rounded-xl flex items-start gap-3 transition-shadow"
                >
                  <ArrowDownRight className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 pr-6">
                    <h5 className="font-sans font-semibold text-slate-800 text-sm">
                      {item.title}
                    </h5>
                    <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleChangeImpact(item.id, 'con', item.impact)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer uppercase transition-all select-none ${
                          item.impact === 'high'
                            ? "bg-rose-600 text-white"
                            : item.impact === 'medium'
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        title="Haz clic para modificar el peso de este impacto"
                      >
                        Impacto: {item.impact === 'high' ? 'Alto' : item.impact === 'medium' ? 'Medio' : 'Bajo'}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id, 'con')}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar punto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedOption.cons.length === 0 && (
              <div className="text-center p-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-sans">
                Sin contras configurados. ¡Agrega uno abajo!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive additions form */}
      <form onSubmit={handleAddItem} className="pt-4 border-t border-slate-100/80 space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          ¿Quieres sumar un argumento propio para evaluar?
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as 'pro' | 'con')}
            className="px-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-sans outline-none focus:border-indigo-500 bg-white"
          >
            <option value="pro">Pro (Ventaja)</option>
            <option value="con">Contra (Desventaja)</option>
          </select>

          <input
            id="item-title"
            type="text"
            required
            placeholder="Título resumido, ej: Curva de aprendizaje corta"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="md:col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none text-slate-700 font-sans bg-white"
          />

          <select
            value={newImpact}
            onChange={(e) => setNewImpact(e.target.value as 'high' | 'medium' | 'low')}
            className="px-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-sans outline-none focus:border-indigo-500 bg-white"
          >
            <option value="high">Peso Alto (±3 pts)</option>
            <option value="medium">Peso Medio (±2 pts)</option>
            <option value="low">Peso Bajo (±1 pt)</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <input
            id="item-desc"
            type="text"
            placeholder="Añade una justificación rápida de por qué (opcional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 outline-none text-slate-600 font-sans bg-white"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg active:scale-95 transition-all text-center cursor-pointer shrink-0"
          >
            Agregar a {newItemType === 'pro' ? 'Pros' : 'Contras'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 italic font-sans">
          <Info className="w-3.5 h-3.5 inline text-slate-400 shrink-0" />
          <span>El balance interactivo se actualiza instantáneamente en tiempo real. Prueba cambiar o ponderar tus propios criterios.</span>
        </p>
      </form>
    </div>
  );
}
