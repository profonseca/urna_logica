/**
 * MÓDULO: Trechos de Código Comentados para Inspeção Didática em Cada Fase
 * REFERÊNCIA NO PROGRAMA: Botão "Ver Código do Algoritmo" em todas as 5 fases.
 *
 * Cada trecho traz comentários indicando exatamente a qual parte do programa ele pertence.
 */

import { PhaseId } from './types';

export interface CodeSnippetBlock {
  title: string;
  filePath: string;
  programRole: string;
  kidExplanation: string;
  complexity: string;
  code: string;
}

export const PHASE_CODE_SNIPPETS: Record<PhaseId, CodeSnippetBlock[]> = {
  1: [
    {
      title: 'Comparador de Chave Composta e Verificador',
      filePath: 'src/core/algorithms/sorting.ts',
      programRole: 'FASE 1 — Regra de auditoria para desempate de zona, seção e horário.',
      kidExplanation:
        'Imagine organizar cartas de baralho: primeiro separamos por naipe (Zona), depois pelo número da mesa (Seção) e, se empatar, olhamos o relógio (Horário)!',
      complexity: 'O(1) por comparação',
      code: `// [PARTE DO PROGRAMA: Fase 1 - Regra de Comparação Composta]
// Transforma a pista da auditoria em ordem numérica determinística (-1, 0, +1).
export function compareRecords(a: VotingRecord, b: VotingRecord, criterion: SortCriterion): number {
  if (criterion === 'composta') {
    const z = a.zona.localeCompare(b.zona);       // 1º critério: Zona eleitoral
    if (z !== 0) return z;

    const s = a.secao.localeCompare(b.secao);     // 2º critério: Seção (desempata zona igual)
    if (s !== 0) return s;

    return a.timestamp.localeCompare(b.timestamp); // 3º critério: Horário (desempata seção igual)
  }
  return a[criterion].localeCompare(b[criterion]);
}`,
    },
    {
      title: 'Bubble Sort, Merge Sort e Quick Sort',
      filePath: 'src/core/algorithms/sorting.ts',
      programRole: 'FASE 1 e FASE 5 — Motores de ordenação com contagem de comparações e movimentações.',
      kidExplanation:
        'O Bubble Sort compara vizinhos um a um como bolhas subindo; o Merge Sort divide a pilha ao meio e junta tudo já em ordem; o Quick Sort escolhe um "capitão" (pivô) e separa menores à esquerda e maiores à direita.',
      complexity: 'Bubble: O(n²) | Merge: O(n log n) | Quick: O(n log n) médio',
      code: `// [PARTE DO PROGRAMA: Fase 1 - Merge Sort (Divisão e Conquista, Estável)]
const merge = (left: number, mid: number, right: number) => {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    comparisons++; // Métrica exibida no painel e no relatório PDF
    if (compareRecords(leftArr[i], rightArr[j], criterion) <= 0) {
      arr[k++] = leftArr[i++]; // Preserva ordem original em empates (Estabilidade)
    } else {
      arr[k++] = rightArr[j++];
    }
    movements++;
  }
  while (i < leftArr.length) { arr[k++] = leftArr[i++]; movements++; }
  while (j < rightArr.length) { arr[k++] = rightArr[j++]; movements++; }
};`,
    },
  ],
  2: [
    {
      title: 'Fila (FIFO), Pilha (LIFO) e Lista Duplamente Ligada',
      filePath: 'src/core/structures/Queue.ts · Stack.ts · LinkedList.ts',
      programRole: 'FASE 2 — Estruturas lineares próprias que controlam triagem, histórico/desfazer e custódia.',
      kidExplanation:
        'A Fila é como a fila do lanche: quem chega primeiro é atendido primeiro (FIFO). A Pilha é como uma pilha de pratos: o último que você coloca em cima é o primeiro que sai (LIFO). A Lista Ligada é um trem onde cada vagão segura a mão do próximo e do anterior!',
      complexity: 'Queue/Stack: O(1) | LinkedList extremidades: O(1), meio: O(n)',
      code: `// [PARTE DO PROGRAMA: Fase 2 - Fila (FIFO) com ponteiro de cabeça O(1)]
export class Queue<T> {
  private items: T[] = [];
  private headIndex = 0;

  enqueue(element: T): void { this.items.push(element); }
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined; // Proteção segura contra remoção em fila vazia
    const element = this.items[this.headIndex++];
    return element;
  }
}

// [PARTE DO PROGRAMA: Fase 2 - Pilha (LIFO) para reserva e Desfazer (Undo)]
export class Stack<T> {
  private items: T[] = [];
  push(element: T): void { this.items.push(element); }
  pop(): T | undefined { return this.isEmpty() ? undefined : this.items.pop(); }
}`,
    },
    {
      title: 'Validador Dinâmico das Regras de Custódia',
      filePath: 'src/core/engine/gameRules.ts',
      programRole: 'FASE 2 — Validação objetiva que impede jogadas inválidas sem apagar dados.',
      kidExplanation:
        'O fiscal da estação olha o vagão que você quer engatar e confere se é exatamente o próximo número da sequência oficial. Se não for, ele avisa o motivo sem quebrar o trem!',
      complexity: 'O(n) no tamanho da lista de custódia',
      code: `// [PARTE DO PROGRAMA: Fase 2 - Verificação de Regra de Movimentação]
export function canInsertIntoCustodyList(
  candidate: EvidenceItem | undefined,
  list: DoublyLinkedList<EvidenceItem>,
  targetSequence: string[] = ['E2', 'E4', 'E1', 'E6']
): RuleCheckResult {
  if (!candidate) return { allowed: false, reason: 'Origem vazia.' };
  const nextIndex = list.traverse().length;
  const expectedId = targetSequence[nextIndex];
  if (candidate.id !== expectedId) {
    return { allowed: false, reason: \`Esperado \${expectedId}, mas tentou inserir \${candidate.id}.\` };
  }
  return { allowed: true, reason: \`Elo \${candidate.id} aceito na trilha.\` };
}`,
    },
  ],
  3: [
    {
      title: 'Grafo por Lista de Adjacência e Motor de Transição de Estado',
      filePath: 'src/core/structures/Graph.ts · src/core/engine/gameRules.ts',
      programRole: 'FASE 3 — Representação do mapa de Verídia e validação unificada de portas/pistas/energia.',
      kidExplanation:
        'O Grafo é o mapa da cidade com estações (vértices) e estradas (arestas). Algumas estradas têm um cadeado que só abre se você já tiver pegado a chave (pista) certa no caminho!',
      complexity: 'Espaço O(V + E) | Geração de vizinhos O(deg(v))',
      code: `// [PARTE DO PROGRAMA: Fase 3 - Função compartilhada entre Modo Manual e Solver]
export function validateGraphTransition(graph: AuditGraph, state: GameState, targetId: string) {
  const edge = graph.getNeighbors(state.currentVertex).find((e) => e.to === targetId);
  if (!edge) return { valid: false, reason: 'Conexão inexistente no mapa.' };

  // Verifica trava lógica de porta
  if (edge.requiredClue && !state.collectedClues.includes(edge.requiredClue)) {
    return { valid: false, reason: \`Porta bloqueada! Exige \${edge.requiredClue}.\` };
  }
  // Verifica orçamento de energia
  if (state.energyRemaining < edge.cost) {
    return { valid: false, reason: 'Energia insuficiente.' };
  }

  // Coleta pista automática ao entrar no vértice destino
  const targetVertex = graph.getVertex(targetId);
  const nextClues = [...state.collectedClues];
  if (targetVertex?.clueGranted && !nextClues.includes(targetVertex.clueGranted)) {
    nextClues.push(targetVertex.clueGranted);
  }
  return { valid: true, nextState: { ...state, currentVertex: targetId, collectedClues: nextClues.sort() } };
}`,
    },
    {
      title: 'BFS (Fila) vs DFS Recursiva',
      filePath: 'src/core/algorithms/search.ts',
      programRole: 'FASES 3 e 5 — Exploradores automáticos (Solver) do espaço de estados.',
      kidExplanation:
        'A BFS explora como ondas na água: visita todas as estações a 1 passo, depois a 2 passos. A DFS entra em um túnel até o fundo e só volta (backtracking) se bater na parede!',
      complexity: 'O(S + T) onde S = estados alcançáveis e T = transições',
      code: `// [PARTE DO PROGRAMA: Fases 3 e 5 - DFS Recursiva com Caso-Base e Backtracking]
const explore = (state: GameState, path: string[], depth: number): boolean => {
  const key = computeCanonicalStateKey(state);
  visitedAVL.insert(key, true);
  statesExplored++;

  // 1. CASO-BASE: Chegou ao Centro de Validação com todas as pistas
  if (isGoalState(state, goalVertexId, requiredFinalClues)) {
    solutionPath = path;
    return true;
  }

  for (const edge of graph.getNeighbors(state.currentVertex)) {
    const tr = validateGraphTransition(graph, state, edge.to);
    if (!tr.valid || !tr.nextState) continue;
    const nextKey = computeCanonicalStateKey(tr.nextState);
    if (visitedAVL.search(nextKey).found) continue; // Poda via AVL

    // 2. CHAMADA RECURSIVA: Aprofunda para o próximo estado válido
    if (explore(tr.nextState, [...path, edge.to], depth + 1)) return true;
  }
  // 3. CONDIÇÃO DE RETORNO: Sem saída neste ramo -> retrocede (Backtracking)
  return false;
};`,
    },
  ],
  4: [
    {
      title: 'Chave Canônica de Estado e Árvore AVL Balanceada',
      filePath: 'src/core/structures/AVLTree.ts · src/core/engine/gameRules.ts',
      programRole: 'FASE 4 — Cofre dos Estados: indexa estados já visitados e executa rotações LL, RR, LR e RL.',
      kidExplanation:
        'A AVL é como um fichário mágico que se organiza sozinho: se um lado fica pesado demais (diferença de altura maior que 1), ela gira os galhos para manter tudo equilibrado e achar qualquer ficha super rápido!',
      complexity: 'Busca e Inserção garantidas em O(log n)',
      code: `// [PARTE DO PROGRAMA: Fase 4 - Chave Canônica que distingue pistas na mesma posição]
export function computeCanonicalStateKey(state: GameState): string {
  const sortedClues = [...new Set(state.collectedClues)].sort().join(',');
  const sortedDoors = [...new Set(state.unlockedDoors)].sort().join(',');
  return \`\${state.currentVertex}|P:[\${sortedClues}]|D:[\${sortedDoors}]\`;
}

// [PARTE DO PROGRAMA: Fase 4 - Balanceamento automático na inserção da AVL]
const balance = this.getBalanceFactor(node); // altura(esq) - altura(dir)
if (balance > 1 && key < node.left!.key) return this.rotateRight(node);       // LL
if (balance < -1 && key > node.right!.key) return this.rotateLeft(node);     // RR
if (balance > 1 && key > node.left!.key) {                                   // LR
  node.left = this.rotateLeft(node.left!);
  return this.rotateRight(node);
}
if (balance < -1 && key < node.right!.key) {                                 // RL
  node.right = this.rotateRight(node.right!);
  return this.rotateLeft(node);
}`,
    },
  ],
  5: [
    {
      title: 'Integração Completa: Árvore de Busca + Ordenação Final',
      filePath: 'src/core/algorithms/search.ts · src/core/benchmarks/benchmark.ts',
      programRole: 'FASE 5 — Consolida validação de lote, trilha de custódia, busca em grafos com AVL e ordenação do relatório.',
      kidExplanation:
        'Na Auditoria Final, juntamos todas as peças do quebra-cabeça: organizamos as urnas, conferimos os vagões da lista, percorremos o mapa usando a memória AVL e comparamos quem explorou melhor o labirinto!',
      complexity: 'Pipeline completo: O(n log n) ordenação + O((V·2^P) log(V·2^P)) busca indexada em AVL',
      code: `// [PARTE DO PROGRAMA: Fase 5 - Registro da Árvore de Busca e Ordenação do Relatório]
// Cada nó da árvore guarda o estado, o pai que o gerou e se foi podado pela AVL.
searchTree.push({
  stateKey: nextKey,
  parentKey: currentKey,
  vertexId: transition.nextState.currentVertex,
  actionLabel: \`Podado (AVL): \${state.currentVertex}→\${edge.to}\`,
  depth: depth + 1,
  cost: transition.nextState.costAccumulated,
  isPrunedDuplicate: true,
});

// Seção 9.3: Uso de ordenação (Quick/Merge) na etapa do relatório final
const orderedAuditLog = mergeSort(finalRecords, 'composta', false);`,
    },
  ],
};
