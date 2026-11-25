import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileDown,
  GitBranch,
  Layers,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { solveWithBFS, solveWithDFSRecursive } from '../core/algorithms/search';
import { mergeSort, quickSort, verifyAuditOrder } from '../core/algorithms/sorting';
import { runSearchBenchmarks } from '../core/benchmarks/benchmark';
import {
  buildGraphFromScenario,
  createInitialGameState,
  SCENARIO_EXTENDED,
  SCENARIO_STANDARD,
} from '../core/data/scenarios';
import { generateFictitiousRecords, shuffleRecordsWithSeed } from '../core/prng';
import { SearchResult, SearchTreeNode } from '../core/types';
import { PhaseHeaderBanner } from './PhaseHeaderBanner';

interface Phase5FinalAuditProps {
  seed: number;
  completedPhases: number[];
  isCompleted: boolean;
  onComplete: () => void;
  onOpenCode: () => void;
  onExportPDF: () => void;
}

/**
 * Renderiza graficamente em SVG a Árvore de Busca (Search Tree) produzida pelo Solver.
 * Cada nó representa um Estado e cada aresta representa uma ação válida (ou poda via AVL).
 */
const SearchTreeSVG: React.FC<{ nodes: SearchTreeNode[] }> = ({ nodes }) => {
  if (nodes.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic">
        Execute o Solver para visualizar a Árvore de Busca construída.
      </div>
    );
  }

  // Agrupa por profundidade para posicionar em níveis horizontais limpos
  const visibleNodes = nodes.slice(0, 36);
  const levels = new Map<number, SearchTreeNode[]>();
  for (const n of visibleNodes) {
    const arr = levels.get(n.depth) ?? [];
    arr.push(n);
    levels.set(n.depth, arr);
  }

  const maxDepth = Math.max(...Array.from(levels.keys()), 1);
  const width = 800;
  const height = Math.max(280, (maxDepth + 1) * 70 + 30);

  const coords = new Map<string, { x: number; y: number; node: SearchTreeNode }>();
  for (const [depth, levelNodes] of levels.entries()) {
    const count = levelNodes.length;
    levelNodes.forEach((n, idx) => {
      const x = ((idx + 1) / (count + 1)) * (width - 60) + 30;
      const y = 35 + depth * 68;
      coords.set(n.stateKey, { x, y, node: n });
    });
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
      {visibleNodes.map((n, idx) => {
        if (!n.parentKey) return null;
        const parent = coords.get(n.parentKey);
        const child = coords.get(n.stateKey);
        if (!parent || !child) return null;
        return (
          <line
            key={`link-${idx}`}
            x1={parent.x}
            y1={parent.y}
            x2={child.x}
            y2={child.y}
            stroke={n.isPrunedDuplicate ? '#fca5a5' : n.isGoal ? '#059669' : '#cbd5e1'}
            strokeWidth={n.isGoal ? 2.5 : 1.5}
            strokeDasharray={n.isPrunedDuplicate ? '4 3' : undefined}
          />
        );
      })}

      {visibleNodes.map((n, idx) => {
        const pos = coords.get(n.stateKey);
        if (!pos) return null;
        const fill = n.isGoal
          ? '#059669'
          : n.isPrunedDuplicate
          ? '#fef2f2'
          : '#ffffff';
        const stroke = n.isGoal
          ? '#065f46'
          : n.isPrunedDuplicate
          ? '#dc2626'
          : '#0284c7';
        const textFill = n.isGoal ? '#ffffff' : '#0f172a';

        return (
          <g key={`tree-node-${idx}`}>
            <rect
              x={pos.x - 28}
              y={pos.y - 14}
              width={56}
              height={28}
              rx={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={n.isGoal ? 2.5 : 1.5}
            />
            <text
              x={pos.x}
              y={pos.y + 3}
              textAnchor="middle"
              fill={textFill}
              className="text-[11px] font-mono font-bold"
            >
              {n.vertexId}({n.cluesCount}p)
            </text>
            <title>{`${n.actionLabel} | Custo: ${n.cost} | Chave: ${n.stateKey}`}</title>
          </g>
        );
      })}
    </svg>
  );
};

export const Phase5FinalAudit: React.FC<Phase5FinalAuditProps> = ({
  seed,
  completedPhases,
  isCompleted,
  onComplete,
  onOpenCode,
  onExportPDF,
}) => {
  const [scenarioId, setScenarioId] = useState<'standard' | 'extended'>('extended');
  const [algorithm, setAlgorithm] = useState<'BFS' | 'DFS_RECURSIVE'>('BFS');
  const [sortEngine, setSortEngine] = useState<'merge' | 'quick'>('quick');
  const [activeResult, setActiveResult] = useState<SearchResult | null>(null);
  const [finalAuditPassed, setFinalAuditPassed] = useState(false);

  const selectedScenario = scenarioId === 'standard' ? SCENARIO_STANDARD : SCENARIO_EXTENDED;
  const comparisons = useMemo(() => runSearchBenchmarks(), []);

  const handleRunCompleteAudit = () => {
    // 1. Etapa de Ordenação no Relatório Final (Seção 9.3)
    const rawRecords = shuffleRecordsWithSeed(generateFictitiousRecords(12, seed), seed + 5);
    const sortedAudit =
      sortEngine === 'merge'
        ? mergeSort(rawRecords, 'composta', false)
        : quickSort(rawRecords, 'composta', false);
    const orderValid = verifyAuditOrder(rawRecords, sortedAudit.sorted, 'composta').valid;

    // 2. Etapa de Busca no Grafo + AVL + Árvore de Busca
    const graph = buildGraphFromScenario(selectedScenario);
    const initialState = createInitialGameState(selectedScenario);
    const searchRes =
      algorithm === 'BFS'
        ? solveWithBFS(
            graph,
            initialState,
            selectedScenario.goalVertex,
            selectedScenario.requiredFinalClues
          )
        : solveWithDFSRecursive(
            graph,
            initialState,
            selectedScenario.goalVertex,
            selectedScenario.requiredFinalClues
          );

    setActiveResult(searchRes);
    if (orderValid && searchRes.found) {
      setFinalAuditPassed(true);
      onComplete();
    }
  };

  const handleRestart = () => {
    setActiveResult(null);
    setFinalAuditPassed(false);
  };

  return (
    <div>
      <PhaseHeaderBanner
        phaseNumber={5}
        title="Fase 5 — A Auditoria Final (Integração e Cofre de Verificação)"
        openingMessage="Todos os módulos convergem aqui. Selecione o cenário, execute a ordenação do lote de evidências, rode o Solver (BFS ou DFS Recursiva) com poda em Árvore AVL e inspecione a Árvore de Busca gerada para validar a consistência completa da apuração de Verídia."
        kidGuideSteps={[
          'Nesta fase final, o robô auditor usa tudo o que construímos: organiza os registros, checa as pistas e explora o mapa sem andar em círculos.',
          'A Árvore de Busca mostra cada tentativa feita pelo computador. Os quadradinhos vermelhos pontilhados mostram repetições que a AVL bloqueou na hora!',
          'Ao final, comparamos BFS vs DFS em dois mapas de tamanhos diferentes e você pode baixar o Relatório Técnico completo em PDF.',
        ]}
        isCompleted={isCompleted}
        onRestart={handleRestart}
        onOpenCode={onOpenCode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PAINEL PRINCIPAL: ÁRVORE DE BUSCA + COMPARATIVO DE CENÁRIOS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-sky-700" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Árvore de Busca do Espaço de Estados
                </h2>
              </div>
              {activeResult && (
                <span className="text-xs font-mono text-slate-600">
                  Nós exibidos: {Math.min(activeResult.searchTree.length, 36)} de{' '}
                  {activeResult.searchTree.length}
                </span>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 overflow-x-auto">
              <SearchTreeSVG nodes={activeResult?.searchTree ?? []} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs border border-sky-600 bg-white inline-block" />{' '}
                Estado explorado
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs border border-red-600 bg-red-50 inline-block" />{' '}
                Estado repetido podado pela AVL
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" /> Objetivo validado
              </span>
            </div>
          </div>

          {/* Tabela Comparativa BFS vs DFS em 2 Cenários (Seção 9.1) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Comparação Experimental: BFS vs DFS Recursiva em Dois Cenários
              </h3>
              <p className="text-xs text-slate-500">
                Demonstra como o espaço de estados cresce quando adicionamos mais vértices e pistas obrigatórias.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Cenário</th>
                    <th className="py-2.5 px-4 font-semibold">Algoritmo</th>
                    <th className="py-2.5 px-4 font-semibold">Caminho</th>
                    <th className="py-2.5 px-4 font-semibold">Estados</th>
                    <th className="py-2.5 px-4 font-semibold">Podas AVL</th>
                    <th className="py-2.5 px-4 font-semibold">Custo</th>
                    <th className="py-2.5 px-4 font-semibold">Tempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {comparisons.flatMap((c) => [
                    <tr key={`${c.scenarioTitle}-bfs`} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                        {c.scenarioTitle} ({c.verticesCount}V/{c.edgesCount}E)
                      </td>
                      <td className="py-2.5 px-4 text-sky-700 font-semibold">BFS (Fila)</td>
                      <td className="py-2.5 px-4">{c.bfs.path.join('→')}</td>
                      <td className="py-2.5 px-4">{c.bfs.statesExplored}</td>
                      <td className="py-2.5 px-4">{c.bfs.duplicatesAvoided}</td>
                      <td className="py-2.5 px-4">{c.bfs.totalCost}</td>
                      <td className="py-2.5 px-4">{c.bfs.executionTimeMs.toFixed(3)}ms</td>
                    </tr>,
                    <tr key={`${c.scenarioTitle}-dfs`} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-sans text-slate-500">
                        ↳ Mesmo cenário
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-semibold">DFS Recursiva</td>
                      <td className="py-2.5 px-4">{c.dfs.path.join('→')}</td>
                      <td className="py-2.5 px-4">{c.dfs.statesExplored}</td>
                      <td className="py-2.5 px-4">{c.dfs.duplicatesAvoided}</td>
                      <td className="py-2.5 px-4">{c.dfs.totalCost}</td>
                      <td className="py-2.5 px-4">{c.dfs.executionTimeMs.toFixed(3)}ms</td>
                    </tr>,
                  ])}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PAINEL DIREITO: EXECUÇÃO INTEGRADA E VEREDICTO DO COFRE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-700" />
              <h2 className="text-sm font-semibold text-slate-900">Configurar Auditoria Final</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cenário de Auditoria
              </label>
              <select
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value as 'standard' | 'extended')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="standard">Cenário Padrão (8 vértices · 1 pista)</option>
                <option value="extended">Cenário Estendido (10 vértices · 2 pistas)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Estratégia do Solver
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setAlgorithm('BFS')}
                  className={`py-2 text-xs font-medium rounded-md ${
                    algorithm === 'BFS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  BFS (Fila)
                </button>
                <button
                  onClick={() => setAlgorithm('DFS_RECURSIVE')}
                  className={`py-2 text-xs font-medium rounded-md ${
                    algorithm === 'DFS_RECURSIVE'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  DFS Recursiva
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ordenação do Relatório (Seção 9.3)
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setSortEngine('merge')}
                  className={`py-2 text-xs font-medium rounded-md ${
                    sortEngine === 'merge' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Merge Sort
                </button>
                <button
                  onClick={() => setSortEngine('quick')}
                  className={`py-2 text-xs font-medium rounded-md ${
                    sortEngine === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Quick Sort
                </button>
              </div>
            </div>

            <button
              onClick={handleRunCompleteAudit}
              className="w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Executar Auditoria Completa</span>
            </button>
          </div>

          {finalAuditPassed && activeResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold">Cofre de Verificação Aberto!</h3>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Trilha consistente reconstruída via{' '}
                <strong>{activeResult.algorithm}</strong>:{' '}
                <span className="font-mono font-semibold">{activeResult.path.join(' → ')}</span>{' '}
                (Custo {activeResult.totalCost} · AVL altura {activeResult.avlHeight} ·{' '}
                {activeResult.avlRotations} rotações · {completedPhases.length}/5 selos ativos).
              </p>
              <button
                onClick={onExportPDF}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Exportar Relatório Técnico (PDF)</span>
              </button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-1.5">
              Crescimento do Espaço de Estados
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Com <code className="font-mono">V</code> vértices e{' '}
              <code className="font-mono">P</code> pistas colecionáveis, o espaço teórico de estados
              atinge <strong className="text-slate-900">O(V · 2^P)</strong>. Sem a indexação em
              Árvore AVL, ciclos fariam a busca crescer exponencialmente sem encerrar.
            </p>
            {isCompleted && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Selo 5 conquistado!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
