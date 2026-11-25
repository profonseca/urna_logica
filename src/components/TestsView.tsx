import React, { useState } from 'react';
import { CheckCircle2, Play, XCircle } from 'lucide-react';
import { runAllAutomatedTests } from '../core/tests/runTests';
import { TestCaseResult } from '../core/types';

export const TestsView: React.FC = () => {
  const [results, setResults] = useState<TestCaseResult[]>(() => runAllAutomatedTests());

  const handleRerun = () => {
    setResults(runAllAutomatedTests());
  };

  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Suíte de Testes Automatizados (Seção 15 do EP)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Validação determinística de todas as estruturas de dados, algoritmos de ordenação, busca em grafos, rotações AVL e regras integradas.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500">Resultado Geral</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-700">
              {passedCount}/{results.length} aprovados
            </div>
          </div>
          <button
            onClick={handleRerun}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Reexecutar Testes</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Módulo</th>
                <th className="py-3 px-4 font-semibold">Casos Cobertos</th>
                <th className="py-3 px-4 font-semibold">Evidência de Execução</th>
                <th className="py-3 px-4 font-semibold text-right">Duração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    {t.passed ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        PASSOU
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                        <XCircle className="w-4 h-4" />
                        FALHOU
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{t.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{t.module}</td>
                  <td className="py-3 px-4 text-slate-700">{t.name}</td>
                  <td className="py-3 px-4 text-slate-600">{t.details}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-500">
                    {t.durationMs.toFixed(3)} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
