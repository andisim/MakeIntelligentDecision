import { OptionAnalysis, ComparisonRow } from "../types";
import { CheckCircle2, AlertCircle, HelpCircle, ArrowUpDown } from "lucide-react";

interface ComparisonTableProps {
  options: OptionAnalysis[];
  comparisonMatrix: ComparisonRow[];
}

export default function ComparisonTable({ options, comparisonMatrix }: ComparisonTableProps) {
  if (!comparisonMatrix || comparisonMatrix.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-150 p-8 text-center text-slate-500 font-sans">
        No hay datos de matriz disponibles.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>Matriz de Comparación</span>
        </h2>
        <p className="text-slate-500 text-sm mt-0.5 font-sans">
          Evaluación cruzada inteligente basada en criterios estratégicos. Compara el impacto directo de cada opción lado a lado.
        </p>
      </div>

      <div className="overflow-x-auto -mx-6 md:mx-0">
        <table className="w-full border-collapse text-left min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75">
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono w-1/4">
                Criterio / Atributo
              </th>
              {options.map((opt) => (
                <th key={opt.id} className="py-4 px-6 text-sm font-semibold text-slate-800 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <span>{opt.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {comparisonMatrix.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/40 transition-colors">
                <td className="py-4 px-6 font-sans">
                  <span className="font-semibold text-slate-800 text-sm block">
                    {row.attribute}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5 leading-relaxed">
                    {row.description}
                  </span>
                </td>

                {options.map((opt) => {
                  const cell = row.optionValues?.[opt.id] || { text: "No evaluado", rating: "neutral" };
                  
                  return (
                    <td key={opt.id} className="py-4 px-6">
                      <div className={`p-4 rounded-xl border font-sans text-xs leading-relaxed space-y-2 ${
                        cell.rating === 'good' 
                          ? "bg-emerald-50/30 border-emerald-100 text-emerald-800"
                          : cell.rating === 'bad'
                          ? "bg-rose-50/30 border-rose-100 text-rose-800"
                          : "bg-slate-50/50 border-slate-100 text-slate-600"
                      }`}>
                        <div className="flex items-center gap-1.5 font-semibold">
                          {cell.rating === "good" && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                          {cell.rating === "bad" && (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          {cell.rating === "neutral" && (
                            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="uppercase text-[9px] tracking-wider">
                            {cell.rating === 'good' ? 'Favorable' : cell.rating === 'bad' ? 'Desfavorable' : 'Neutral'}
                          </span>
                        </div>
                        <p className="text-slate-700 font-sans">{cell.text}</p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
