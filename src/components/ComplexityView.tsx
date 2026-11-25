import React, { useMemo, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { runSearchBenchmarks, runSortingBenchmarks } from '../core/benchmarks/benchmark';

interface ComplexityViewProps {
  seed: number;
}

export const ComplexityView: React.FC<ComplexityViewProps> = ({ seed }) => {
  const [refreshCount, setRefreshCount] = useState(0);

  const sortBench = useMemo(
    () => runSortingBenchmarks(seed + refreshCount),
    [seed, refreshCount]
  );
  const searchBench = useMemo(() => runSearchBenchmarks(), []);

  // Escala do gráfico SVG de comparações
  const maxComp = Math.max(1, ...sortBench.map((r) => r.bubbleComparisons));
  const chartW = 720;
  const chartH = 260;
  const padL = 65;
  const padR = 25;
  const padT = 20;
  const padB = 40;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const getPoint = (idx: number, val: number) => {
    const x = padL + (idx / Math.max(1, sortBench.length - 1)) * innerW;
    const y = padT + innerH - (val / maxComp) * innerH;
    return `${x},${y}`;
  };

  const bubblePoints = sortBench.map((r, i) => getPoint(i, r.bubbleComparisons)).join(' ');
  const mergePoints = sortBench.map((r, i) => getPoint(i, r.mergeComparisons)).join(' ');
  const quickPoints = sortBench.map((r, i) => getPoint(i, r.quickComparisons)).join(' ');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Análise de Complexidade e Benchmarks Empíricos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Comparação teórica (Notação Big-O) combinada com medições experimentais executadas no navegador.
          </p>
        </div>
        <button
          onClick={() => setRefreshCount((c) => c + 1)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rodar Novo Benchmark</span>
        </button>
      </div>

      {/* Gráfico SVG de Curva de Crescimento: Bubble O(n²) vs Merge/Quick O(n log n) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-sky-700" />
            <h2 className="text-sm font-semibold text-slate-900">
              Crescimento de Comparações por Tamanho de Entrada (n)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Observe a curva quadrática do Bubble Sort O(n²) disparando frente às curvas O(n log n) do Merge e Quick Sort.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto">
              {/* Linhas de grade horizontais */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = padT + innerH - t * innerH;
                const val = Math.round(t * maxComp);
                return (
                  <g key={t}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#e2e8f0" strokeWidth={1} />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-slate-500"
                    >
                      {val.toLocaleString('pt-BR')}
                    </text>
                  </g>
                );
              })}

              {/* Eixos */}
              <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#94a3b8" strokeWidth={1.5} />
              <line
                x1={padL}
                y1={padT + innerH}
                x2={chartW - padR}
                y2={padT + innerH}
                stroke="#94a3b8"
                strokeWidth={1.5}
              />

              {/* Curvas */}
              <polyline fill="none" stroke="#dc2626" strokeWidth={3} points={bubblePoints} />
              <polyline fill="none" stroke="#0284c7" strokeWidth={3} points={mergePoints} />
              <polyline fill="none" stroke="#059669" strokeWidth={3} points={quickPoints} />

              {/* Pontos e Rótulos do eixo X */}
              {sortBench.map((r, i) => {
                const x = padL + (i / Math.max(1, sortBench.length - 1)) * innerW;
                const yb = padT + innerH - (r.bubbleComparisons / maxComp) * innerH;
                const ym = padT + innerH - (r.mergeComparisons / maxComp) * innerH;
                const yq = padT + innerH - (r.quickComparisons / maxComp) * innerH;
                return (
                  <g key={r.size}>
                    <circle cx={x} cy={yb} r={4} fill="#dc2626" />
                    <circle cx={x} cy={ym} r={4} fill="#0284c7" />
                    <circle cx={x} cy={yq} r={4} fill="#059669" />
                    <text
                      x={x}
                      y={chartH - 12}
                      textAnchor="middle"
                      className="text-[11px] font-mono font-semibold fill-slate-700"
                    >
                      n = {r.size}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap gap-5 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-1 bg-red-600 inline-block" /> Bubble Sort — O(n²)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-1 bg-sky-600 inline-block" /> Merge Sort — O(n log n)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-600 inline-block" /> Quick Sort — O(n log n) médio
            </span>
          </div>
        </div>

        {/* Tabela de Dados Medidos de Ordenação */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
              Métricas Medidas (Seed base: {seed + refreshCount})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">n</th>
                  <th className="py-2.5 px-3 font-semibold">Algoritmo</th>
                  <th className="py-2.5 px-3 font-semibold">Comp.</th>
                  <th className="py-2.5 px-3 font-semibold">Mov.</th>
                  <th className="py-2.5 px-3 font-semibold">Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {sortBench.flatMap((row) => [
                  <tr key={`${row.size}-b`}>
                    <td className="py-2 px-3 font-semibold text-slate-900">{row.size}</td>
                    <td className="py-2 px-3 font-sans text-red-700 font-medium">Bubble</td>
                    <td className="py-2 px-3">{row.bubbleComparisons.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3">{row.bubbleMovements.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3">{row.bubbleMs}ms</td>
                  </tr>,
                  <tr key={`${row.size}-m`}>
                    <td className="py-2 px-3 text-slate-400">{row.size}</td>
                    <td className="py-2 px-3 font-sans text-sky-700 font-medium">Merge</td>
                    <td className="py-2 px-3">{row.mergeComparisons.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3">{row.mergeMovements.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3">{row.mergeMs}ms</td>
                  </tr>,
                  <tr key={`${row.size}-q`} className="bg-slate-50/40">
                    <td className="py-2 px-3 text-slate-400">{row.size}</td>
                    <td className="py-2 px-3 font-sans text-emerald-700 font-medium">Quick</td>
                    <td className="py-2 px-3">{row.quickComparisons.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3">{row.quickMovements.toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3">{row.quickMs}ms</td>
                  </tr>,
                ])}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabela Completa de Complexidade Assintótica de Todas as Estruturas e Algoritmos */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Quadro-Resumo de Complexidade Teórica (Todas as Fases)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Estrutura / Algoritmo</th>
                <th className="py-3 px-4 font-semibold">Melhor Caso</th>
                <th className="py-3 px-4 font-semibold">Caso Médio</th>
                <th className="py-3 px-4 font-semibold">Pior Caso</th>
                <th className="py-3 px-4 font-semibold">Espaço Auxiliar</th>
                <th className="py-3 px-4 font-semibold">Uso no EP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Bubble Sort</td>
                <td className="py-2.5 px-4 font-mono">O(n)</td>
                <td className="py-2.5 px-4 font-mono">O(n²)</td>
                <td className="py-2.5 px-4 font-mono">O(n²)</td>
                <td className="py-2.5 px-4 font-mono">O(1)</td>
                <td className="py-2.5 px-4 text-slate-600">Fase 1 (didático e estável)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Merge Sort</td>
                <td className="py-2.5 px-4 font-mono">O(n log n)</td>
                <td className="py-2.5 px-4 font-mono">O(n log n)</td>
                <td className="py-2.5 px-4 font-mono">O(n log n)</td>
                <td className="py-2.5 px-4 font-mono">O(n)</td>
                <td className="py-2.5 px-4 text-slate-600">Fases 1 e 5 (estável e previsível)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Quick Sort</td>
                <td className="py-2.5 px-4 font-mono">O(n log n)</td>
                <td className="py-2.5 px-4 font-mono">O(n log n)</td>
                <td className="py-2.5 px-4 font-mono">O(n²)</td>
                <td className="py-2.5 px-4 font-mono">O(log n)</td>
                <td className="py-2.5 px-4 text-slate-600">Fases 1 e 5 (pivô central)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Pilha (LIFO) & Fila (FIFO)</td>
                <td className="py-2.5 px-4 font-mono">O(1)</td>
                <td className="py-2.5 px-4 font-mono">O(1)</td>
                <td className="py-2.5 px-4 font-mono">O(1)</td>
                <td className="py-2.5 px-4 font-mono">O(n)</td>
                <td className="py-2.5 px-4 text-slate-600">Fase 2 (Desfazer/Triagem) + BFS/DFS</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Lista Duplamente Ligada</td>
                <td className="py-2.5 px-4 font-mono">O(1) pontas</td>
                <td className="py-2.5 px-4 font-mono">O(n) busca</td>
                <td className="py-2.5 px-4 font-mono">O(n) meio</td>
                <td className="py-2.5 px-4 font-mono">O(n)</td>
                <td className="py-2.5 px-4 text-slate-600">Fase 2 (Trilha dinâmica de custódia)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Árvore AVL</td>
                <td className="py-2.5 px-4 font-mono">O(1) raiz</td>
                <td className="py-2.5 px-4 font-mono">O(log n)</td>
                <td className="py-2.5 px-4 font-mono">O(log n)</td>
                <td className="py-2.5 px-4 font-mono">O(n)</td>
                <td className="py-2.5 px-4 text-slate-600">Fase 4 e Solver (indexação de estados)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">BFS / DFS em Espaço de Estados</td>
                <td className="py-2.5 px-4 font-mono">O(1)</td>
                <td className="py-2.5 px-4 font-mono">O((S+T) log S)</td>
                <td className="py-2.5 px-4 font-mono">O(V · 2^P · log S)</td>
                <td className="py-2.5 px-4 font-mono">O(S)</td>
                <td className="py-2.5 px-4 text-slate-600">Fases 3 e 5 (S = estados alcançáveis)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparativo de Busca em Grafos */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Limitações e Observações Experimentais (BFS vs DFS)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchBench.map((sc) => (
            <div key={sc.scenarioTitle} className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 text-xs space-y-2">
              <div className="font-semibold text-slate-900">{sc.scenarioTitle}</div>
              <div className="text-slate-600">
                BFS explorou <strong className="font-mono">{sc.bfs.statesExplored}</strong> estados
                (fronteira máx. <strong className="font-mono">{sc.bfs.maxFrontierSize}</strong>) ·
                Caminho: <span className="font-mono text-sky-800">{sc.bfs.path.join('→')}</span>
              </div>
              <div className="text-slate-600">
                DFS explorou <strong className="font-mono">{sc.dfs.statesExplored}</strong> estados
                (prof. máx. <strong className="font-mono">{sc.dfs.maxFrontierSize}</strong>) ·
                Caminho: <span className="font-mono text-slate-900">{sc.dfs.path.join('→')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
