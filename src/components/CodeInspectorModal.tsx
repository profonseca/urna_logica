import React from 'react';
import { Code2, Sparkles, X } from 'lucide-react';
import { CodeSnippetBlock } from '../core/sourceSnippets';

interface CodeInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseTitle: string;
  snippets: CodeSnippetBlock[];
}

export const CodeInspectorModal: React.FC<CodeInspectorModalProps> = ({
  isOpen,
  onClose,
  phaseTitle,
  snippets,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Código do algoritmo - ${phaseTitle}`}
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-sky-700" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Implementação Técnica: {phaseTitle}
              </h2>
              <p className="text-xs text-slate-500">
                Código comentado indicando exatamente a que parte do programa cada trecho pertence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors"
            aria-label="Fechar visualizador de código"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {snippets.map((snippet, idx) => (
            <section
              key={idx}
              className="border border-slate-200 rounded-lg overflow-hidden bg-white"
            >
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{snippet.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
                    <span>{snippet.filePath}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-sky-700 font-sans font-medium">{snippet.complexity}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-sky-50/60 border-b border-slate-200 space-y-1.5">
                <p className="text-xs font-semibold text-sky-900">{snippet.programRole}</p>
                <p className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Explicação simples:</strong>{' '}
                    {snippet.kidExplanation}
                  </span>
                </p>
              </div>

              <pre className="p-4 bg-slate-950 text-slate-100 text-xs leading-relaxed overflow-x-auto font-mono">
                <code>{snippet.code}</code>
              </pre>
            </section>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Fechar Código
          </button>
        </div>
      </div>
    </div>
  );
};
