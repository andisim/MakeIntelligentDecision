import React, { useState } from "react";
import { 
  Scale, 
  HelpCircle, 
  BrainCircuit, 
  Sparkles, 
  Info, 
  ChevronRight, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Award,
  Lightbulb
} from "lucide-react";
import OptionManager from "./components/OptionManager";
import ProsConsList from "./components/ProsConsList";
import FodaMatrix from "./components/FodaMatrix";
import ComparisonTable from "./components/ComparisonTable";
import RecommendationCard from "./components/RecommendationCard";
import { DecisionResult, OptionAnalysis } from "./types";

interface SimpleOption {
  id: string;
  name: string;
  description: string;
}

export default function App() {
  const [decision, setDecision] = useState("");
  const [options, setOptions] = useState<SimpleOption[]>([
    { id: "opt_1", name: "Estudiar Maestría Completa", description: "Inversión de 2 años, alto costo académico presencial." },
    { id: "opt_2", name: "Cursos Cortos y Portfolio", description: "Construcción rápida, bajo costo, aprendizaje práctico." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Results State
  const [result, setResult] = useState<DecisionResult | null>(null);
  
  // Secondary state to allow updates of analyzing parameters on the client
  const [analyzedOptions, setAnalyzedOptions] = useState<OptionAnalysis[]>([]);

  // Tab switcher in results dashboard
  // "veredicto" | "comparativa" | "pros-cons" | "foda"
  const [activeTab, setActiveTab] = useState<"veredicto" | "comparativa" | "pros-cons" | "foda">("veredicto");

  const startAnalysis = async () => {
    if (!decision.trim()) {
      setErrorMessage("Por favor, ingresa el dilema que necesitas resolver.");
      return;
    }
    if (options.length < 2) {
      setErrorMessage("Agrega al menos dos opciones para que podamos realizar la comparación estratégica.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/analyze-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: decision.trim(),
          options: options.map(o => ({ name: o.name, description: o.description }))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudo procesar la consulta con el modelo de lenguaje de Gemini.");
      }

      const data: DecisionResult = await response.json();
      setResult(data);
      setAnalyzedOptions(data.options);
      setActiveTab("veredicto");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Ocurrió un error inesperado al analizar el dilema.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setAnalyzedOptions([]);
    setDecision("");
    setOptions([
      { id: "opt_1", name: "Opción A", description: "" },
      { id: "opt_2", name: "Opción B", description: "" }
    ]);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      
      {/* Visual Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono shadow-sm">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-slate-900 text-lg tracking-tight">
                El desempate
              </span>
              <span className="text-[10px] text-slate-400 font-bold block leading-none font-mono">
                IA DECISION ENGINE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noreferrer" 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-500 rounded-lg transition-colors border border-slate-200/50"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
              <span>Google AI Studio</span>
            </a>

            {result && (
              <button 
                onClick={handleRestart}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                Volver a empezar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Intro section (When no results loaded yet) */}
      {!result && !isLoading && (
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Desempates Objetivos en Segundos</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Toma decisiones difíciles de forma <span className="text-indigo-600">inteligente</span>
          </h1>

          <p className="mt-3.5 text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Ingresa un dilema o pregunta estratégica. Evaluamos tus opciones mediante análisis estructurados con Inteligencia Artificial, pros/contras dinámicos y matrices FODA.
          </p>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-2xl flex items-start gap-3 shadow-sm font-sans">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">No se pudo generar la comparativa:</span>
              <p className="mt-0.5 text-slate-500 text-xs leading-relaxed">{errorMessage}</p>
              <div className="mt-2 text-[11px] text-indigo-600 font-semibold uppercase">
                Verifica tu Gemini API Key en el panel de Secrets de tu aplicación si el error persiste.
              </div>
            </div>
          </div>
        )}

        {/* LOADING SCREEN */}
        {isLoading && (
          <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                <Scale className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-slate-800">
                Estructurando tu escenario...
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto font-sans">
                El desempate está calculando los indicadores de impacto, debatiendo internamente fortalezas y amenazas, y cruzando variables para entregarte la mejor recomendación racional.
              </p>
            </div>

            {/* Stepper logs animation to show AI and structured models are working */}
            <div className="bg-white border border-slate-150 p-4 rounded-xl text-left max-w-md mx-auto shadow-sm space-y-2 font-mono text-[11px] text-slate-500">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                <span>[1/4] Inicializando el motor analítico...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                <span>[2/4] Diseñando pros y contras basados en impacto heurístico...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                <span>[3/4] Trazando mapa de cuadrantes FODA (SWOT) para cada opción...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                <span>[4/4] Formulando recomendación estratégica imparcial...</span>
              </div>
            </div>
          </div>
        )}

        {/* SETUP VIEW: Option Builder */}
        {!result && !isLoading && (
          <div className="max-w-4xl mx-auto">
            <OptionManager
              decision={decision}
              setDecision={setDecision}
              options={options}
              setOptions={setOptions}
              onAnalyze={startAnalysis}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* RESULTS REPORT DASHBOARD */}
        {result && !isLoading && (
          <div className="space-y-8">
            
            {/* Dilemma Summary Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
                  Dilema Evaluado:
                </span>
                <h2 className="font-sans font-bold text-slate-800 text-lg md:text-xl mt-0.5">
                  &ldquo;{result.decision}&rdquo;
                </h2>
              </div>

              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 align-self-start md:align-self-center"
              >
                Volver a evaluar / Editar dilema
              </button>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex overflow-x-auto gap-2 bg-slate-100 p-1.5 rounded-2xl md:max-w-fit scrollbar-none">
              
              <button
                type="button"
                onClick={() => setActiveTab("veredicto")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                  activeTab === "veredicto"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Award className="w-4 h-4 text-indigo-500" />
                <span>1. El Veredicto (IA)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("comparativa")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                  activeTab === "comparativa"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>2. Matriz de Atributos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pros-cons")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                  activeTab === "pros-cons"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Scale className="w-4 h-4 text-blue-500" />
                <span>3. Pros y Contras</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("foda")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                  activeTab === "foda"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <Lightbulb className="w-4 h-4 text-orange-400" />
                <span>4. Análisis FODA / SWOT</span>
              </button>

            </div>

            {/* TAB CONTENT RENDERERS */}
            <div className="space-y-6">

              {activeTab === "veredicto" && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  <RecommendationCard
                    decision={result.decision}
                    recommendation={result.recommendation}
                    onRestart={handleRestart}
                  />

                  {/* Summary grid score cards of each option */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analyzedOptions.map((opt) => (
                      <div 
                        key={opt.id}
                        className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-sans font-bold text-slate-800 text-sm truncate">
                            {opt.name}
                          </h4>
                          <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2.5 py-1 rounded-lg">
                            Score: {opt.score}/10
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans mt-1">
                          {opt.scoreExplanation}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 font-mono border-t border-slate-50 pt-2.5">
                          <span>{opt.pros.length} Ventajas</span>
                          <span>{opt.cons.length} Desventajas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "comparativa" && (
                <div className="max-w-5xl mx-auto">
                  <ComparisonTable
                    options={analyzedOptions}
                    comparisonMatrix={result.comparisonMatrix}
                  />
                </div>
              )}

              {activeTab === "pros-cons" && (
                <div className="max-w-5xl mx-auto">
                  <ProsConsList
                    options={analyzedOptions}
                    onUpdateOptions={setAnalyzedOptions}
                  />
                </div>
              )}

              {activeTab === "foda" && (
                <div className="max-w-5xl mx-auto">
                  <FodaMatrix
                    options={analyzedOptions}
                    onUpdateOptions={setAnalyzedOptions}
                  />
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
