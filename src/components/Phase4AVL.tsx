import React, { useState } from 'react';
import { CheckCircle2, GitCompare, Plus, Search, ShieldAlert } from 'lucide-react';
import { computeCanonicalStateKey } from '../core/engine/gameRules';
import { AVLTree } from '../core/structures/AVLTree';
import { AVLNodeSnapshot, AVLRotationEvent } from '../core/types';
import { PhaseHeaderBanner } from './PhaseHeaderBanner';

interface Phase4AVLProps {
  isCompleted: boolean;
  onComplete: () => void;
  onOpenCode: () => void;
}

/**
 * Componente SVG recursivo para desenhar qualquer Árvore AVL (atual ou snapshot antes/depois da rotação).
 */
const AVLTreeSVG: React.FC<{
  snapshot: AVLNodeSnapshot | null;
  highlightPath?: string[];
  width?: number;
  height?: number;
}> = ({ snapshot, highlightPath = [], width = 760, height = 300 }) => {
  if (!snapshot) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-400 italic">
        Árvore AVL vazia (root = null)
      </div>
    );
  }

  interface PositionedNode {
    node: AVLNodeSnapshot;
    x: number;
    y: number;
    parentX?: number;
    parentY?: number;
  }

  const placed: PositionedNode[] = [];
  const walk = (
    n: AVLNodeSnapshot | null,
    depth: number,
    xMin: number,
    xMax: number,
    px?: number,
    py?: number
  ) => {
    if (!n) return;
    const x = (xMin + xMax) / 2;
    const y = 36 + depth * 64;
    placed.push({ node: n, x, y, parentX: px, parentY: py });
    walk(n.left, depth + 1, xMin, x, x, y);
    walk(n.right, depth + 1, x, xMax, x, y);
  };

  walk(snapshot, 0, 20, width - 20);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
      {placed.map((p, idx) =>
        p.parentX !== undefined && p.parentY !== undefined ? (
          <line
            key={`edge-${idx}`}
            x1={p.parentX}
            y1={p.parentY}
            x2={p.x}
            y2={p.y}
            stroke="#cbd5e1"
            strokeWidth={2}
          />
        ) : null
      )}

      {placed.map((p, idx) => {
        const isHighlighted = highlightPath.includes(p.node.key);
        const unbalanced = Math.abs(p.node.balanceFactor) > 1;
        return (
          <g key={`node-${idx}`}>
            <rect
              x={p.x - 48}
              y={p.y - 18}
              width={96}
              height={36}
              rx={8}
              fill={unbalanced ? '#fef2f2' : isHighlighted ? '#e0f2fe' : '#ffffff'}
              stroke={unbalanced ? '#dc2626' : isHighlighted ? '#0284c7' : '#64748b'}
              strokeWidth={isHighlighted || unbalanced ? 2.5 : 1.5}
            />
            <text
              x={p.x}
              y={p.y - 2}
              textAnchor="middle"
              className="text-[11px] font-mono font-bold fill-slate-900"
            >
              {p.node.key.length > 14 ? `${p.node.key.slice(0, 12)}…` : p.node.key}
            </text>
            <text
              x={p.x}
              y={p.y + 12}
              textAnchor="middle"
              className="text-[9.5px] font-mono fill-slate-500"
            >
              h={p.node.height} · BF={p.node.balanceFactor >= 0 ? `+${p.node.balanceFactor}` : p.node.balanceFactor}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const Phase4AVL: React.FC<Phase4AVLProps> = ({
  isCompleted,
  onComplete,
  onOpenCode,
}) => {
  const [avl, setAvl] = useState<AVLTree<string>>(() => new AVLTree<string>());
  const [, setTick] = useState(0);
  const [customKey, setCustomKey] = useState('D|P:[AUT]|D:[]');
  const [searchKey, setSearchKey] = useState('C|P:[SEQ]|D:[OESTE]');
  const [highlightPath, setHighlightPath] = useState<string[]>([]);
  const [selectedRotation, setSelectedRotation] = useState<AVLRotationEvent | null>(null);
  const [feedback, setFeedback] = useState<string>(
    'Insira chaves de estado ou execute os testes de rotação LL, RR, LR e RL e o enigma dos estados.'
  );

  const refresh = () => setTick((t) => t + 1);

  const handleRestart = () => {
    setAvl(new AVLTree<string>());
    setHighlightPath([]);
    setSelectedRotation(null);
    setFeedback('Cofre dos Estados (AVL) reiniciado e vazio.');
    refresh();
  };

  const insertKey = (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) return;
    const res = avl.insert(trimmed, trimmed);
    if (!res.inserted) {
      setFeedback(
        `Estado repetido detectado e bloqueado pela AVL: "${trimmed}" já foi visitado! Nenhuma duplicata inserida.`
      );
    } else if (res.rotated) {
      const latestRot = avl.rotationEvents[avl.rotationEvents.length - 1];
      setSelectedRotation(latestRot);
      setFeedback(
        `Chave "${trimmed}" inserida! Desbalanceamento detectado → Rotação ${latestRot.type} aplicada com sucesso.`
      );
      onComplete();
    } else {
      setFeedback(`Chave "${trimmed}" inserida na AVL (altura atual: ${avl.treeHeight()}).`);
    }
    setHighlightPath([trimmed]);
    refresh();
  };

  const runRotationPreset = (type: 'LL' | 'RR' | 'LR' | 'RL') => {
    const fresh = new AVLTree<string>();
    const seqs: Record<'LL' | 'RR' | 'LR' | 'RL', string[]> = {
      LL: ['30|P:[]', '20|P:[]', '10|P:[]'],
      RR: ['10|P:[]', '20|P:[]', '30|P:[]'],
      LR: ['30|P:[]', '10|P:[]', '20|P:[]'],
      RL: ['10|P:[]', '30|P:[]', '20|P:[]'],
    };
    seqs[type].forEach((k) => fresh.insert(k, k));
    setAvl(fresh);
    const ev = fresh.rotationEvents[fresh.rotationEvents.length - 1] ?? null;
    setSelectedRotation(ev);
    setHighlightPath([]);
    onComplete();
    setFeedback(
      `Sequência [${seqs[type].join(', ')}] inserida! Provocou rotação ${ev?.type ?? type}. Invariante |BF|<=1 válida: ${fresh.isValidAVL()}.`
    );
    refresh();
  };

  const runEnigmaSameVertex = () => {
    const fresh = new AVLTree<string>();
    const stateWithoutClue = computeCanonicalStateKey({
      currentVertex: 'C',
      collectedClues: [],
      unlockedDoors: [],
      energyRemaining: 10,
      costAccumulated: 2,
    });
    const stateWithClue = computeCanonicalStateKey({
      currentVertex: 'C',
      collectedClues: ['PISTA_SEQUENCIA'],
      unlockedDoors: ['PORTA_OESTE'],
      energyRemaining: 10,
      costAccumulated: 2,
    });
    const extra1 = computeCanonicalStateKey({
      currentVertex: 'E',
      collectedClues: ['PISTA_AUTENTICACAO'],
      unlockedDoors: [],
      energyRemaining: 8,
      costAccumulated: 4,
    });
    const extra2 = computeCanonicalStateKey({
      currentVertex: 'H',
      collectedClues: ['PISTA_AUTENTICACAO', 'PISTA_SEQUENCIA'],
      unlockedDoors: ['PORTA_OESTE'],
      energyRemaining: 5,
      costAccumulated: 7,
    });

    [stateWithoutClue, stateWithClue, extra1, extra2].forEach((k) => fresh.insert(k, k));
    // Tenta reinserir o mesmo estado sem pista para provar prevenção de loop
    const dupAttempt = fresh.insert(stateWithoutClue, stateWithoutClue);

    setAvl(fresh);
    setSelectedRotation(fresh.rotationEvents[0] ?? null);
    setHighlightPath([stateWithoutClue, stateWithClue]);
    onComplete();
    setFeedback(
      `Enigma resolvido! Os dois estados no vértice C geraram chaves distintas (${stateWithoutClue} ≠ ${stateWithClue}), permitindo ações diferentes. Já a tentativa de reinserir "${stateWithoutClue}" retornou inserted=${dupAttempt.inserted}, impedindo loops infinitos!`
    );
    refresh();
  };

  const handleSearch = () => {
    const res = avl.search(searchKey.trim());
    setHighlightPath(res.visitedPath);
    setFeedback(
      res.found
        ? `Busca EXISTENTE: "${searchKey}" encontrada em ${res.comparisons} comparações (caminho: ${res.visitedPath.join(' → ')}).`
        : `Busca INEXISTENTE: "${searchKey}" não existe na AVL (${res.comparisons} comparações até folha nula).`
    );
  };

  const snapshot = avl.createSnapshot();

  return (
    <div>
      <PhaseHeaderBanner
        phaseNumber={4}
        title="Fase 4 — O Cofre dos Estados (Árvore AVL)"
        openingMessage="O sistema está explorando caminhos repetidos. Para não investigar a mesma configuração indefinidamente, indexe cada estado por sua chave canônica única na Árvore AVL — distinguindo estados no mesmo vértice quando suas pistas forem diferentes."
        kidGuideSteps={[
          'Imagine que você está na sala C sem chave, e depois volta à sala C com uma chave no bolso. Apesar de estar na mesma sala, são situações diferentes!',
          'A Árvore AVL guarda todas as fichas de situações já visitadas em ordem alfabética e nunca deixa um galho ficar muito mais comprido que o outro.',
          'Teste os botões de Rotação (LL, RR, LR, RL) e veja os desenhos de Antes e Depois da rotação!',
        ]}
        isCompleted={isCompleted}
        onRestart={handleRestart}
        onOpenCode={onOpenCode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VISUALIZADOR SVG DA AVL + ANTES/DEPOIS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Visualizador da Árvore AVL (Altura: {avl.treeHeight()} · Nós: {avl.size()} · Rotações:{' '}
                  {avl.rotationCount})
                </h2>
                <p className="text-xs text-slate-500">
                  Cada nó exibe Chave Canônica, Altura (h) e Fator de Balanceamento (BF = h_esq - h_dir ∈ {'{-1, 0, +1}'}).
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                Invariante AVL: {avl.isValidAVL() ? 'Balanceada' : 'Inválida'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 overflow-x-auto">
              <AVLTreeSVG snapshot={snapshot} highlightPath={highlightPath} />
            </div>

            <div className="mt-3 bg-sky-50/70 border border-sky-200 rounded-lg p-3 text-xs text-sky-950">
              {feedback}
            </div>
          </div>

          {/* Evidência Técnica (Seção 8.3): Árvore Antes e Depois da Rotação */}
          {selectedRotation && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <GitCompare className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Evidência da Última Rotação: {selectedRotation.type}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Pivô desbalanceado: <code className="font-mono font-semibold">{selectedRotation.pivotKey}</code>{' '}
                após inserir <code className="font-mono font-semibold">{selectedRotation.insertedKey}</code>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50/40 border border-red-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-red-900 mb-2">
                    Antes da Rotação (|BF| &gt; 1)
                  </div>
                  <AVLTreeSVG snapshot={selectedRotation.beforeSnapshot} width={380} height={220} />
                </div>
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-emerald-900 mb-2">
                    Depois da Rotação (Balanceada)
                  </div>
                  <AVLTreeSVG snapshot={selectedRotation.afterSnapshot} width={380} height={220} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PAINEL DE CONTROLES DA AVL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Enigma & Demonstrações AVL</h2>

            <button
              onClick={runEnigmaSameVertex}
              className="w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Testar Enigma: Mesmo Vértice, Pistas Distintas</span>
            </button>

            <div>
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Provar os 4 Tipos de Rotação (Seção 8.1)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => runRotationPreset('LL')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Rotação LL (Direita)
                </button>
                <button
                  onClick={() => runRotationPreset('RR')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Rotação RR (Esquerda)
                </button>
                <button
                  onClick={() => runRotationPreset('LR')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Dupla LR (Esq-Dir)
                </button>
                <button
                  onClick={() => runRotationPreset('RL')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Dupla RL (Dir-Esq)
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Inserir Chave de Estado Manualmente
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
                <button
                  onClick={() => insertKey(customKey)}
                  className="px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 inline-flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Inserir
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Buscar Chave (Existente ou Inexistente)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
                <button
                  onClick={handleSearch}
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 inline-flex items-center gap-1 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-1.5">
              Complexidade em Função da Altura h
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Como a AVL garante <code className="font-mono">h ≤ 1.44 · log₂(n + 2)</code>, tanto a
              busca quanto a inserção (incluindo no máximo 2 rotações simples ou 1 dupla) operam em{' '}
              <strong className="text-slate-900">O(h) = O(log n)</strong> no pior caso, evitando que
              a árvore degenere em lista ligada O(n).
            </p>
            {isCompleted && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Selo 4 conquistado!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
