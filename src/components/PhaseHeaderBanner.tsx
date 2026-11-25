import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Code2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface PhaseHeaderBannerProps {
  phaseNumber: number;
  title: string;
  openingMessage: string;
  kidGuideSteps: string[];
  isCompleted: boolean;
  onRestart: () => void;
  onOpenCode: () => void;
}

export const PhaseHeaderBanner: React.FC<PhaseHeaderBannerProps> = ({
  phaseNumber,
  title,
  openingMessage,
  kidGuideSteps,
  isCompleted,
  onRestart,
  onOpenCode,
}) => {
  const [showGuide, setShowGuide] = useState(true);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-sky-700">Fase {phaseNumber} de 5</span>
            <span aria-hidden="true">·</span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Selo de Auditoria Conquistado
              </span>
            ) : (
              <span>Em investigação</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-balance">{title}</h1>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{openingMessage}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowGuide((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-700" />
            <span>{showGuide ? 'Ocultar Passo a Passo' : 'Explicação Simples'}</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenCode}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Ver Código do Algoritmo</span>
          </button>

          <button
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Fase</span>
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-semibold text-slate-800 mb-2">
            Como funciona esta fase (explicação passo a passo simples)
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kidGuideSteps.map((step, i) => (
              <li
                key={i}
                className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-700 leading-relaxed"
              >
                <span className="font-semibold text-sky-700 mr-1.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
