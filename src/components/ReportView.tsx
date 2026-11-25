import React, { useMemo } from 'react';
import { FileDown, FileText, ShieldCheck } from 'lucide-react';
import { DEFAULT_IAG_LOGS } from '../core/data/scenarios';
import { runSearchBenchmarks, runSortingBenchmarks } from '../core/benchmarks/benchmark';
import { runAllAutomatedTests } from '../core/tests/runTests';

interface ReportViewProps {
  seed: number;
  completedPhases: number[];
  onExportPDF: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  seed,
  completedPhases,
  onExportPDF,
}) => {
  const tests = useMemo(() => runAllAutomatedTests(), []);
  const sortBench = useMemo(() => runSortingBenchmarks(seed), [seed]);
  const searchBench = useMemo(() => runSearchBenchmarks(), []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Relatório Técnico & Registro de Curadoria de IAG
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Estruturado conforme os 10 capítulos da Seção 16.1 e tabela obrigatória da Seção 14.4 do EP.
          </p>
        </div>

        <button
          onClick={onExportPDF}
          className="inline-flex items-center gap-2 px-5 py-3 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <FileDown className="w-4 h-4" />
          <span>Baixar Relatório Técnico em PDF</span>
        </button>
      </div>

      {/* Resumo dos 10 Capítulos */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-700" />
          <h2 className="text-base font-semibold text-slate-900">
            Estrutura do Documento PDF (10 Seções Obrigatórias)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-1.5">
            <h3 className="font-semibold text-slate-900">1–4. Narrativa, Modelagem e Arquitetura</h3>
            <p className="text-slate-600 leading-relaxed">
              Detalha o cenário apartidário de Verídia (2042), as regras das 5 fases, a tupla formal
              de estado <code className="font-mono">(vértice, pistas, portas, energia)</code> e a
              separação estrita entre núcleo algorítmico (<code className="font-mono">src/core/</code>) e interface visual.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-1.5">
            <h3 className="font-semibold text-slate-900">5–6. Estruturas de Dados e Algoritmos</h3>
            <p className="text-slate-600 leading-relaxed">
              Justifica Fila O(1), Pilha LIFO, Lista Duplamente Ligada, Lista de Adjacência, Árvore
              AVL (com evidência das rotações LL/RR/LR/RL) e comparação Bubble vs Merge vs Quick e BFS vs DFS Recursiva.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-1.5">
            <h3 className="font-semibold text-slate-900">7–8. Testes ao Vivo e Métricas Empíricas</h3>
            <p className="text-slate-600 leading-relaxed">
              Inclui automaticamente no PDF os{' '}
              <strong>
                {tests.filter((t) => t.passed).length}/{tests.length} testes automatizados
              </strong>{' '}
              aprovados, as medições para <code className="font-mono">n = 20..600</code> (
              {sortBench.length} escalas) e os {searchBench.length} cenários de busca em grafos.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-1.5">
            <h3 className="font-semibold text-slate-900">9–10. Curadoria de IAG e Conclusões</h3>
            <p className="text-slate-600 leading-relaxed">
              Documenta de forma transparente as 5 interações relevantes com IAG, alterações humanas e
              validação, além da discussão sobre crescimento <code className="font-mono">O(V·2^P)</code> e limitações.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>
            Estado atual anexado ao PDF: <strong>{completedPhases.length}/5 selos</strong>{' '}
            conquistados · Seed reproduzível <code className="font-mono">{seed}</code>.
          </span>
        </div>
      </div>

      {/* Tabela Obrigatória de Registro de Uso de IAG (Seção 14.4) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Registro Obrigatório de Uso de IAG (Seção 14.4 do EP)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparência acadêmica: o que foi solicitado, o que foi aproveitado, alterado e validado.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Ferramenta e Data</th>
                <th className="py-3 px-4 font-semibold">Objetivo do Prompt</th>
                <th className="py-3 px-4 font-semibold">Trecho / Ideia Aproveitada</th>
                <th className="py-3 px-4 font-semibold">Alterações Feitas</th>
                <th className="py-3 px-4 font-semibold">Como Foi Validado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEFAULT_IAG_LOGS.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 align-top">
                  <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {entry.toolAndDate}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{entry.promptGoal}</td>
                  <td className="py-3 px-4 text-slate-600">{entry.excerptUsed}</td>
                  <td className="py-3 px-4 text-slate-700">{entry.humanModifications}</td>
                  <td className="py-3 px-4 text-emerald-800">{entry.validationMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
