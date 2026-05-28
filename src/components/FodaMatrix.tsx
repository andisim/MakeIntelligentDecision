import { useState, Dispatch, SetStateAction, FormEvent, MouseEvent } from "react";
import { Plus, Trash2, ArrowUpRight, Award, Lightbulb, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OptionAnalysis, FodaItem } from "../types";

interface FodaMatrixProps {
  options: OptionAnalysis[];
  onUpdateOptions: Dispatch<SetStateAction<OptionAnalysis[]>>;
}

type QuadrantType = 'fortalezas' | 'oportunidades' | 'debilidades' | 'amenazas';

export default function FodaMatrix({ options, onUpdateOptions }: FodaMatrixProps) {
  const [activeTab, setActiveTab] = useState<string>(options[0]?.id || "");
  const [selectedItem, setSelectedItem] = useState<{ item: FodaItem; type: QuadrantType } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [activeQuadrantForAdd, setActiveQuadrantForAdd] = useState<QuadrantType>('fortalezas');

  const selectedOption = options.find(o => o.id === activeTab) || options[0];

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const id = `foda_custom_${Date.now()}`;
    const newItem: FodaItem = {
      id,
      title: newTitle.trim(),
      description: newDesc.trim() || "Detalle ingresado por el usuario"
    };

    onUpdateOptions(prev => prev.map(opt => {
      if (opt.id === selectedOption.id) {
        return {
          ...opt,
          foda: {
            ...opt.foda,
            [activeQuadrantForAdd]: [...opt.foda[activeQuadrantForAdd], newItem],
          }
        };
      }
      return opt;
    }));

    setNewTitle("");
    setNewDesc("");
    setSelectedItem({ item: newItem, type: activeQuadrantForAdd });
  };

  const handleRemoveItem = (id: string, quad: QuadrantType, e: MouseEvent) => {
    e.stopPropagation();
    onUpdateOptions(prev => prev.map(opt => {
      if (opt.id === selectedOption.id) {
        return {
          ...opt,
          foda: {
            ...opt.foda,
            [quad]: opt.foda[quad].filter(i => i.id !== id),
          }
        };
      }
      return opt;
    }));
    if (selectedItem?.item.id === id) {
      setSelectedItem(null);
    }
  };

  if (!selectedOption) return null;

  const quadrantsConfig: Record<QuadrantType, { 
    label: string, 
    color: string, 
    bgColor: string, 
    borderColor: string, 
    textColor: string,
    icon: any 
  }> = {
    fortalezas: {
      label: "Fortalezas (F)",
      color: "from-emerald-50 to-emerald-100",
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-100 hover:border-emerald-200",
      textColor: "text-emerald-700",
      icon: ShieldCheck,
    },
    oportunidades: {
      label: "Oportunidades (O)",
      color: "from-blue-50 to-blue-100",
      bgColor: "bg-blue-50/50",
      borderColor: "border-blue-100 hover:border-blue-200",
      textColor: "text-blue-700",
      icon: Lightbulb,
    },
    debilidades: {
      label: "Debilidades (D)",
      color: "from-orange-50 to-orange-100",
      bgColor: "bg-orange-50/50",
      borderColor: "border-orange-100 hover:border-orange-200",
      textColor: "text-orange-700",
      icon: Award, // representing internal challenges
    },
    amenazas: {
      label: "Amenazas (A)",
      color: "from-rose-50 to-rose-100",
      bgColor: "bg-rose-50/50",
      borderColor: "border-rose-100 hover:border-rose-200",
      textColor: "text-rose-700",
      icon: AlertTriangle,
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">
            Análisis FODA Interactivo
          </h2>
          <p className="text-slate-500 text-sm mt-0.5 font-sans">
            Evalúa factores internos y externos para cada opción. Selecciona un elemento para leer descripciones y agregar factores personalizados de forma dinámica.
          </p>
        </div>

        {/* Option Selectors */}
        <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl self-start">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setActiveTab(opt.id);
                setSelectedItem(null);
              }}
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

      {/* Grid Layout splits into SWOT on left, detailed preview & controller on right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* The 2x2 SWOT interactive block */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['fortalezas', 'oportunidades', 'debilidades', 'amenazas'] as QuadrantType[]).map((quad) => {
            const config = quadrantsConfig[quad];
            const FodaIcon = config.icon;
            const items = selectedOption.foda[quad] || [];

            return (
              <div
                key={quad}
                onClick={() => {
                  setActiveQuadrantForAdd(quad);
                }}
                className={`flex flex-col h-fit min-h-[220px] p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  activeQuadrantForAdd === quad
                    ? "border-indigo-500 ring-2 ring-indigo-100/50"
                    : `border-slate-100 ${config.bgColor}`
                } shadow-sm`}
              >
                {/* Header section of quadrant */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-200/50 pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${config.textColor} bg-white border border-slate-100`}>
                      <FodaIcon className="w-4 h-4" />
                    </div>
                    <span className={`font-sans font-bold text-xs uppercase tracking-wider ${config.textColor}`}>
                      {config.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 border border-slate-100 rounded-full font-bold">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items container inside quadrant */}
                <div className="flex-1 space-y-2">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem({ item: it, type: quad });
                        setActiveQuadrantForAdd(quad);
                      }}
                      className={`group flex items-start justify-between gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        selectedItem?.item.id === it.id
                          ? "bg-white border-indigo-300 text-indigo-700 shadow-sm"
                          : "bg-white border-slate-100 hover:border-slate-200/80 text-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-1.5 min-w-0 font-sans">
                        <ArrowUpRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          selectedItem?.item.id === it.id ? "text-indigo-500" : "text-slate-400"
                        }`} />
                        <span className="text-xs font-semibold leading-relaxed truncate">
                          {it.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveItem(it.id, quad, e)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 cursor-pointer shrink-0"
                        title="Eliminar factor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-28 text-center text-slate-400 font-sans">
                      <HelpCircle className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px]">Sin factores detallados</span>
                    </div>
                  )}
                </div>

                {/* Micro addition invitation inline */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveQuadrantForAdd(quad);
                  }}
                  className="mt-3 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer self-start transition-colors font-sans"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir a {config.label.split(' ')[0]}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Detailed inspector & custom adding drawer */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between gap-5 h-full min-h-[460px] xl:min-h-0">
          
          {/* Section 1: Selected Fact Card details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Inspector de FODA
            </h3>

            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                      selectedItem.type === 'fortalezas' ? 'bg-emerald-100 text-emerald-800' :
                      selectedItem.type === 'oportunidades' ? 'bg-blue-100 text-blue-800' :
                      selectedItem.type === 'debilidades' ? 'bg-orange-100 text-orange-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedItem.type}
                    </span>
                  </div>
                  <h4 className="font-sans font-bold text-slate-800 text-sm">
                    {selectedItem.item.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {selectedItem.item.description || "Sin descripción adicional provista."}
                  </p>
                </motion.div>
              ) : (
                <div className="bg-white/55 border border-dashed border-slate-200/80 rounded-xl p-5 text-center text-slate-400 text-xs py-8 font-sans">
                  Haz clic en cualquier aspecto de la grilla de la izquierda para ver su explicación avanzada.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Form to insert into actively targeted quadrant */}
          <div className="border-t border-slate-200/80 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700">
                Sumar {quadrantsConfig[activeQuadrantForAdd].label.split(' ')[0]} manual
              </h4>
              <span className="text-[9px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md font-mono">
                Modo activo
              </span>
            </div>

            <form onSubmit={handleAddItem} className="space-y-2.5">
              <input
                id="foda-title"
                type="text"
                required
                placeholder="Ej: Bajos aranceles aduaneros"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none text-slate-700 font-sans"
              />
              <textarea
                id="foda-desc"
                rows={2}
                placeholder="Explicación o impacto estimado..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none text-slate-700 font-sans"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 active:scale-97 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer font-sans"
              >
                Insertar Factor
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
