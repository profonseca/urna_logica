import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  KeyRound,
  Lock,
  LockOpen,
  Undo2,
  Zap,
} from 'lucide-react';
import { solveWithBFS, solveWithDFSRecursive } from '../core/algorithms/search';
import {
  buildGraphFromScenario,
  createInitialGameState,
  SCENARIO_STANDARD,
} from '../core/data/scenarios';
import {
  computeCanonicalStateKey,
  isGoalState,
  validateGraphTransition,
} from '../core/engine/gameRules';
import { Stack } from '../core/structures/Stack';
import { GameState, SearchResult } from '../core/types';
import { PhaseHeaderBanner } from './PhaseHeaderBanner';

interface Phase3GraphProps {
  isCompleted: boolean;
  onComplete: () => void;
  onOpenCode: () => void;
}

export const Phase3Graph: React.FC<Phase3GraphProps> = ({
  isCompleted,
  onComplete,
  onOpenCode,
}) => {
  const graph = useMemo(() => buildGraphFromScenario(SCENARIO_STANDARD), []);
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(SCENARIO_STANDARD)
  );
  const [visitedStates, setVisitedStates] = useState<Set<string>>(() => {
    const s = new Set<string>();
    s.add(computeCanonicalStateKey(createInitialGameState(SCENARIO_STANDARD)));
    return s;
  });
  const [historyStack] = useState(() => new Stack<GameState>());
  const [playerPath, setPlayerPath] = useState<string[]>([SCENARIO_STANDARD.startVertex]);
  const [feedback, setFeedback] = useState<{ type: 'info' | 'error' | 'success'; message: string }>({
    type: 'info',
    message:
      'Clique em um local conectado no mapa para caminhar. Você precisa coletar a Pista de Autenticação antes de chegar ao Centro de Validação (H).',
  });
  const [solverResult, setSolverResult] = useState<SearchResult | null>(null);

  const handleRestart = () => {
    const init = createInitialGameState(SCENARIO_STANDARD);
    setGameState(init);
    historyStack.clear();
    setVisitedStates(new Set([computeCanonicalStateKey(init)]));
    setPlayerPath([SCENARIO_STANDARD.startVertex]);
    setSolverResult(null);
    setFeedback({
      type: 'info',
      message: 'Mapa reiniciado na Central de Auditoria (A) com 12 de energia.',
    });
  };

  const handleMoveToVertex = (targetId: string) => {
    if (targetId === gameState.currentVertex) return;
    const transition = validateGraphTransition(graph, gameState, targetId);

    if (!transition.valid || !transition.nextState) {
      setFeedback({ type: 'error', message: transition.reason });
      return;
    }

    const nextKey = computeCanonicalStateKey(transition.nextState);
    const alreadyExplored = visitedStates.has(nextKey);

    historyStack.push(gameState);
    setGameState(transition.nextState);
    setPlayerPath((prev) => [...prev, targetId]);
    setVisitedStates((prev) => new Set(prev).add(nextKey));

    if (
      targetId === SCENARIO_STANDARD.goalVertex &&
      !isGoalState(
        transition.nextState,
        SCENARIO_STANDARD.goalVertex,
        SCENARIO_STANDARD.requiredFinalClues
      )
    ) {
      setFeedback({
        type: 'error',
        message:
          'Você chegou ao Centro de Validação (H), mas SEM a Pista de Autenticação! A auditoria recusa esta rota. Volte pela Unidade Leste (E) ou use Desfazer.',
      });
      return;
    }

    if (
      isGoalState(
        transition.nextState,
        SCENARIO_STANDARD.goalVertex,
        SCENARIO_STANDARD.requiredFinalClues
      )
    ) {
      onComplete();
      setFeedback({
        type: 'success',
        message: `Selo 3 Desbloqueado! Rota validada até H com Pista de Autenticação (Custo total: ${transition.nextState.costAccumulated} de energia).`,
      });
      return;
    }

    setFeedback({
      type: 'info',
      message: alreadyExplored
        ? `${transition.reason} (Atenção: você retornou a um estado já explorado antes!)`
        : transition.reason,
    });
  };

  const handleUndo = () => {
    const prev = historyStack.pop();
    if (!prev) {
      setFeedback({ type: 'error', message: 'Nenhum movimento anterior para desfazer.' });
      return;
    }
    setGameState(prev);
    setPlayerPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
    setFeedback({
      type: 'info',
      message: `Movimento desfeito. Retornou para ${prev.currentVertex}.`,
    });
  };

  const runSolver = (mode: 'BFS' | 'DFS') => {
    const init = createInitialGameState(SCENARIO_STANDARD);
    const res =
      mode === 'BFS'
        ? solveWithBFS(
            graph,
            init,
            SCENARIO_STANDARD.goalVertex,
            SCENARIO_STANDARD.requiredFinalClues
          )
        : solveWithDFSRecursive(
            graph,
            init,
            SCENARIO_STANDARD.goalVertex,
            SCENARIO_STANDARD.requiredFinalClues
          );
    setSolverResult(res);
  };

  const edges = useMemo(() => graph.getUniqueEdges(), [graph]);
  const currentNeighbors = useMemo(
    () => graph.getNeighbors(gameState.currentVertex),
    [graph, gameState.currentVertex]
  );

  const isEdgeInSolverPath = (from: string, to: string) => {
    if (!solverResult?.found) return false;
    for (let i = 0; i < solverResult.path.length - 1; i++) {
      const a = solverResult.path[i];
      const b = solverResult.path[i + 1];
      if ((a === from && b === to) || (a === to && b === from)) return true;
    }
    return false;
  };

  return (
    <div>
      <PhaseHeaderBanner
        phaseNumber={3}
        title="Fase 3 — O Mapa das Seções (Grafos, BFS e DFS)"
        openingMessage="As evidências estão organizadas, mas a trilha entre os locais de Verídia foi fragmentada. Há conexões com pedágio de energia, portas bloqueadas que exigem pistas e um atalho direto (D → H) que falha na validação final se você não tiver passado pela Unidade Leste (E)."
        kidGuideSteps={[
          'Pense no mapa como estações de metrô (vértices) ligadas por trilhos (arestas) que gastam energia.',
          'A Unidade Leste (E) guarda a Pista de Autenticação. Sem ela, o Centro de Validação (H) não abre o cofre!',
          'Você pode caminhar clicando nas estações ou acionar o Solver (BFS ou DFS) para ver como o computador explora o mapa.',
        ]}
        isCompleted={isCompleted}
        onRestart={handleRestart}
        onOpenCode={onOpenCode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAPA SVG INTERATIVO DO GRAFO (65%) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Grafo de Conexões de Verídia (8 Vértices · 11 Arestas · Lista de Adjacência)
                </h2>
                <p className="text-xs text-slate-500">
                  Clique nos vértices vizinhos destacados para mover manualmente o analista.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                <span className="inline-flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Energia: {gameState.energyRemaining}/{SCENARIO_STANDARD.initialEnergy}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg overflow-hidden">
              <svg viewBox="0 0 800 410" className="w-full h-auto select-none">
                <defs>
                  <marker
                    id="arrow-dir"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* Arestas */}
                {edges.map((edge, idx) => {
                  const vFrom = graph.getVertex(edge.from)!;
                  const vTo = graph.getVertex(edge.to)!;
                  const midX = (vFrom.x + vTo.x) / 2;
                  const midY = (vFrom.y + vTo.y) / 2;
                  const isLocked =
                    edge.requiredClue && !gameState.collectedClues.includes(edge.requiredClue);
                  const inSolver = isEdgeInSolverPath(edge.from, edge.to);

                  return (
                    <g key={idx}>
                      <line
                        x1={vFrom.x}
                        y1={vFrom.y}
                        x2={vTo.x}
                        y2={vTo.y}
                        stroke={inSolver ? '#059669' : isLocked ? '#dc2626' : '#cbd5e1'}
                        strokeWidth={inSolver ? 4 : 2.5}
                        strokeDasharray={isLocked || !edge.bidirectional ? '6 4' : undefined}
                        markerEnd={!edge.bidirectional ? 'url(#arrow-dir)' : undefined}
                      />
                      <rect
                        x={midX - 18}
                        y={midY - 10}
                        width={36}
                        height={20}
                        rx={6}
                        fill="#ffffff"
                        stroke={isLocked ? '#fca5a5' : '#e2e8f0'}
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-slate-700 font-semibold"
                      >
                        {isLocked ? `🔒${edge.cost}` : `${edge.cost}⚡`}
                      </text>
                    </g>
                  );
                })}

                {/* Vértices */}
                {SCENARIO_STANDARD.vertices.map((v) => {
                  const isCurrent = gameState.currentVertex === v.id;
                  const isReachable = currentNeighbors.some((n) => n.to === v.id);
                  const inSolver = solverResult?.path.includes(v.id);
                  const isGoal = v.id === SCENARIO_STANDARD.goalVertex;

                  let fill = '#ffffff';
                  let stroke = '#94a3b8';
                  let textFill = '#0f172a';

                  if (isCurrent) {
                    fill = '#0369a1';
                    stroke = '#0c4a6e';
                    textFill = '#ffffff';
                  } else if (isGoal) {
                    fill = '#ecfdf5';
                    stroke = '#059669';
                  } else if (isReachable) {
                    fill = '#e0f2fe';
                    stroke = '#0284c7';
                  } else if (inSolver) {
                    fill = '#f0fdf4';
                    stroke = '#16a34a';
                  }

                  return (
                    <g
                      key={v.id}
                      onClick={() => handleMoveToVertex(v.id)}
                      className="cursor-pointer"
                    >
                      {isReachable && !isCurrent && (
                        <circle
                          cx={v.x}
                          cy={v.y}
                          r={30}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth={2}
                          strokeDasharray="4 3"
                        />
                      )}
                      <circle
                        cx={v.x}
                        cy={v.y}
                        r={24}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isCurrent || inSolver ? 3 : 2}
                      />
                      <text
                        x={v.x}
                        y={v.y + 5}
                        textAnchor="middle"
                        fill={textFill}
                        className="text-sm font-bold font-mono"
                      >
                        {v.id}
                      </text>
                      <text
                        x={v.x}
                        y={v.y + 40}
                        textAnchor="middle"
                        className="text-[11px] font-semibold fill-slate-800"
                      >
                        {v.name}
                      </text>
                      {v.clueGranted && (
                        <text
                          x={v.x}
                          y={v.y - 31}
                          textAnchor="middle"
                          className="text-[10px] font-mono font-semibold fill-amber-700"
                        >
                          🔑 {v.clueGranted.replace('PISTA_', '')}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <span>Linha tracejada vermelha = porta bloqueada por pista</span>
                <span>Seta D→H = atalho unidirecional (falha sem Autenticação)</span>
              </div>
              <button
                onClick={handleUndo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 font-semibold rounded-lg hover:bg-amber-100"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Desfazer Passo</span>
              </button>
            </div>
          </div>

          {/* Feedback do Movimento */}
          <div
            className={`rounded-xl border p-4 flex items-start gap-3 ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-sky-50/70 border-sky-200 text-sky-950'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  feedback.type === 'success' ? 'text-emerald-700' : 'text-sky-700'
                }`}
              />
            )}
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-sm mb-0.5">
                {feedback.type === 'error'
                  ? 'Transição Bloqueada / Alerta de Regra'
                  : feedback.type === 'success'
                  ? 'Rota de Auditoria Reconstruída!'
                  : 'Navegação no Grafo'}
              </p>
              <p>{feedback.message}</p>
            </div>
          </div>
        </div>

        {/* ZONA DIREITA: MODELO DE ESTADO + SOLVER BFS/DFS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Estado Atual do Jogo (Tupla)</h2>
            <div className="bg-slate-950 text-slate-100 rounded-lg p-3.5 text-xs font-mono space-y-1.5">
              <div>
                <span className="text-slate-400">posição_atual:</span>{' '}
                <span className="text-sky-400 font-bold">{gameState.currentVertex}</span>
              </div>
              <div>
                <span className="text-slate-400">pistas_coletadas:</span>{' '}
                <span className="text-amber-300">
                  [{gameState.collectedClues.join(', ') || 'nenhuma'}]
                </span>
              </div>
              <div>
                <span className="text-slate-400">energia_restante:</span>{' '}
                <span className="text-emerald-400">{gameState.energyRemaining}</span>
              </div>
              <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400 break-all">
                Chave Canônica: {computeCanonicalStateKey(gameState)}
              </div>
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Sua rota: </span>
              <span className="font-mono">{playerPath.join(' → ')}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs text-slate-700">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                Autenticação:{' '}
                <strong>
                  {gameState.collectedClues.includes('PISTA_AUTENTICACAO') ? 'Coletada' : 'Pendente'}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-700">
                {gameState.collectedClues.includes('PISTA_SEQUENCIA') ? (
                  <LockOpen className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                )}
                Porta Oeste:{' '}
                <strong>
                  {gameState.collectedClues.includes('PISTA_SEQUENCIA') ? 'Liberada' : 'Bloqueada'}
                </strong>
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-700" />
              <h2 className="text-sm font-semibold text-slate-900">Modo Solver Automático</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Executa os algoritmos usando exatamente as mesmas regras do modo manual e indexando
              estados na AVL.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => runSolver('BFS')}
                className="py-2.5 px-3 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Solver BFS (Fila)
              </button>
              <button
                onClick={() => runSolver('DFS')}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Solver DFS Recursiva
              </button>
            </div>

            {solverResult && (
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Algoritmo:</span>
                  <span className="font-semibold text-slate-900">{solverResult.algorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Caminho encontrado:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {solverResult.path.join(' → ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estados explorados:</span>
                  <span className="font-mono tabular-nums">{solverResult.statesExplored}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Custo em energia:</span>
                  <span className="font-mono tabular-nums">{solverResult.totalCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tempo:</span>
                  <span className="font-mono tabular-nums">
                    {solverResult.executionTimeMs.toFixed(3)} ms
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-700">
                  <strong className="block text-slate-900 mb-0.5">Ordem de visita:</strong>
                  <span className="font-mono break-all">
                    {solverResult.visitOrder.join(' · ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-1.5">
              Nota Teórica: Quando a BFS garante o menor caminho?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A BFS encontra o caminho com o <strong>menor número de arestas</strong> (passos), pois
              expande em largura camada por camada. Em grafos <strong>ponderados</strong> (onde cada
              aresta consome energia diferente), a BFS não garante o menor custo acumulado — embora
              rejeite corretamente o atalho A→C→D→H por violar a pista de autenticação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
