import { Trophy, ArrowRight, RotateCcw, Share2, ClipboardCheck, Printer } from "lucide-react";
import { useState } from "react";

interface RecommendationCardProps {
  decision: string;
  recommendation: {
    recommendedOptionName: string;
    explanation: string;
    nextSteps: string[];
  };
  onRestart: () => void;
}

export default function RecommendationCard({
  decision,
  recommendation,
  onRestart,
}: RecommendationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `Dilema: ${decision}\nRecomendación de El Desempate: ¡La mejor opción tentativa es ${recommendation.recommendedOptionName}!\nExplicación: ${recommendation.explanation}\nPasos a seguir:\n${recommendation.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-950 space-y-6">
      
      {/* Top Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-800/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/25 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 font-mono block">
              Veredicto de El Desempate
            </span>
            <h2 className="font-display text-lg font-bold text-slate-100">
              Opción Ganadora Sugerida
            </h2>
          </div>
        </div>

        {/* Floating Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/15 text-indigo-200 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>{copied ? "¡Copiado!" : "Copiar Resumen"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/15 text-indigo-200 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-2"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Recommended display */}
      <div className="space-y-4">
        <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-md font-mono">
          Alternativa Optimizada
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
          {recommendation.recommendedOptionName}
        </h1>

        <p className="text-sm text-indigo-100/90 leading-relaxed font-sans max-w-4xl bg-white/5 border border-white/5 p-5 rounded-2xl">
          {recommendation.explanation}
        </p>
      </div>

      {/* Action plan / Next steps list */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest font-mono">
          Tu plan de acción (Siguientes Pasos)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recommendation.nextSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/8/80 border border-white/5 hover:border-white/10 rounded-xl transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-indigo-200/90 leading-relaxed font-sans">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer trigger to retry */}
      <div className="border-t border-indigo-800/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-indigo-400/90 font-sans italic text-center sm:text-left">
          * El desempate calcula resultados mediante análisis predictivo. Recuerda tomar la decisión final con discernimiento personal.
        </p>

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 font-sans font-bold text-xs rounded-xl shadow transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Evaluar otra decisión</span>
        </button>
      </div>

    </div>
  );
}
