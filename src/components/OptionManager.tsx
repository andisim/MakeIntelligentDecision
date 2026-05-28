import React, { useState } from "react";
import { Plus, Trash2, Sparkles, Scale, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Option {
  id: string;
  name: string;
  description: string;
}

interface OptionManagerProps {
  decision: string;
  setDecision: (val: string) => void;
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  onAnalyze: () => void;
  isLoading: boolean;
}

export default function OptionManager({
  decision,
  setDecision,
  options,
  setOptions,
  onAnalyze,
  isLoading,
}: OptionManagerProps) {
  const [newOptName, setNewOptName] = useState("");
  const [newOptDesc, setNewOptDesc] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState("");

  const handleAddOption = () => {
    if (!newOptName.trim()) return;
    const cleanName = newOptName.trim();
    if (options.some(o => o.name.toLowerCase() === cleanName.toLowerCase())) {
      setSuggestError("Ya existe una opción con ese nombre.");
      return;
    }
    const id = `opt_custom_${Date.now()}`;
    setOptions(prev => [...prev, { id, name: cleanName, description: newOptDesc.trim() }]);
    setNewOptName("");
    setNewOptDesc("");
    setSuggestError("");
  };

  const handleRemoveOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const handleAutoSuggest = async () => {
    if (!decision.trim()) {
      setSuggestError("Ingresa tu decisión primero para que la IA pueda sugerirte opciones lógicas.");
      return;
    }
    setSuggestLoading(true);
    setSuggestError("");
    try {
      const res = await fetch("/api/suggest-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        throw new Error("No se pudieron generar sugerencias.");
      }
      const data = await res.json();
      if (data.options && data.options.length > 0) {
        const mapped = data.options.map((opt: { name: string; description: string }, index: number) => ({
          id: `opt_suggested_${Date.now()}_${index}`,
          name: opt.name,
          description: opt.description,
        }));
        setOptions(mapped);
      } else {
        setSuggestError("El modelo no devolvió opciones estructuradas. Inténtalo de nuevo.");
      }
    } catch (err: any) {
      setSuggestError(err.message || "Error al conectar con el servidor.");
    } finally {
      setSuggestLoading(false);
    }
  };

  const exampleDecisions = [
    "¿Comprar un coche eléctrico o uno convencional de gasolina?",
    "¿Estudiar una Maestría en el extranjero o hacer cursos cortos especializados?",
    "¿Mudarse a una gran ciudad con alta renta o quedarse en un pueblo rentando barato?",
    "¿Desarrollar una aplicación nativa móvil o una plataforma web autoadaptable?",
  ];

  return (
    <div className="space-y-8">
      {/* Step 1: Write decision */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-800">
              ¿Cuál es el dilema que deseas desempatar?
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Describe claramente tu situación o pregunta de decisión para que la IA diseñe el mejor análisis.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            id="decision-input"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Ej: ¿Debo comprar un departamento propio con hipoteca o seguir alquilando e invertir el excedente?"
            className="w-full min-h-[96px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 transition-all font-sans placeholder-slate-400 leading-relaxed outline-none"
          />

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              ideas rápidas de ejemplo:
            </span>
            <div className="flex flex-wrap gap-2">
              {exampleDecisions.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDecision(ex)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer font-sans"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Define options */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-800">
                Opciones que estás considerando
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Añade las alternativas (mínimo 2) para realizar la comparación.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={suggestLoading || !decision.trim()}
            onClick={handleAutoSuggest}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-sans shrink-0 self-start sm:self-center"
          >
            {suggestLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Sugerir Opciones con IA</span>
              </>
            )}
          </button>
        </div>

        {suggestError && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{suggestError}</span>
          </div>
        )}

        {/* Options list */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {options.map((opt, index) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4 hover:border-slate-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center font-mono shrink-0">
                      {index + 1}
                    </span>
                    <h4 className="font-sans font-semibold text-slate-800 truncate">
                      {opt.name}
                    </h4>
                  </div>
                  {opt.description && (
                    <p className="text-xs text-slate-500 mt-1 pl-7 font-sans leading-relaxed">
                      {opt.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(opt.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0"
                  title="Eliminar opción"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {options.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-sans">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-55" />
              <p className="text-sm font-medium">No has añadido opciones todavía.</p>
              <p className="text-xs mt-1">Escribe tu decisión arriba para usar las sugerencias automáticas o agrégalas manualmente abajo.</p>
            </div>
          )}
        </div>

        {/* Manual option form builder */}
        <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/60 transition-all space-y-4">
          <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Agregar opción de forma manual</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              id="m-opt-name"
              type="text"
              placeholder="Nombre de la opción (ej: Comprar Híbrido)"
              value={newOptName}
              onChange={(e) => setNewOptName(e.target.value)}
              className="px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none text-slate-800 placeholder-slate-400 font-sans"
            />
            <input
              id="m-opt-desc"
              type="text"
              placeholder="Descripción breve (ej: Costo medio, buen rendimiento general)"
              value={newOptDesc}
              onChange={(e) => setNewOptDesc(e.target.value)}
              className="md:col-span-2 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none text-slate-800 placeholder-slate-400 font-sans"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddOption}
              disabled={!newOptName.trim()}
              className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer font-sans"
            >
              Agregar alternativa
            </button>
          </div>
        </div>
      </div>

      {/* Execute Decision trigger button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !decision.trim() || options.length < 2}
          className="relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-950 text-white font-display font-bold text-lg rounded-2xl shadow-md hover:shadow-indigo-500/10 hover:shadow-xl hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none disabled:bg-slate-300 disabled:border-transparent transition-all duration-200 active:scale-95 cursor-pointer select-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generando Análisis...</span>
            </>
          ) : (
            <>
              <Scale className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>Desempatar con IA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
