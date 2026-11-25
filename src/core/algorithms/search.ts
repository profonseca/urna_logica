/**
 * MÓDULO: Algoritmos de Busca no Espaço de Estados (BFS e DFS Recursiva/Iterativa)
 * REFERÊNCIA NO PROGRAMA:
 *  - Fase 3 (O Mapa das Seções): Encontrar rota válida respeitando portas e pistas.
 *  - Fase 4 (O Cofre dos Estados): Usar Árvore AVL para impedir expansão repetida de estados já visitados.
 *  - Fase 5 (A Auditoria Final): Comparar BFS vs DFS e exibir a Árvore de Busca construída.
 *
 * EXPLICAÇÃO TEÓRICA OBRIGATÓRIA (Seção 7.2):
 *  Quando a BFS encontra o caminho com menor número de arestas?
 *   -> A BFS explora os estados em camadas de profundidade crescente (distância d = 0, 1, 2...).
 *      Portanto, ela garante o menor NÚMERO DE ARESTAS (passos) quando cada transição tem passo unitário.
 *      ATENÇÃO: Em grafos PONDERADOS (com custos de energia diferentes por aresta), a BFS NÃO garante
 *      o menor custo total em energia — para isso seria necessário Dijkstra ou A*.
 */

import { computeCanonicalStateKey, isGoalState, validateGraphTransition } from '../engine/gameRules';
import { AVLTree } from '../structures/AVLTree';
import { AuditGraph } from '../structures/Graph';
import { Queue } from '../structures/Queue';
import { Stack } from '../structures/Stack';
import { GameState, SearchResult, SearchTreeNode } from '../types';

interface SearchFrame {
  state: GameState;
  path: string[];
  statePath: GameState[];
  depth: number;
  parentKey: string | null;
  actionLabel: string;
}

/**
 * SOLVER BFS (Busca em Largura) usando Fila (FIFO) própria e Árvore AVL própria.
 */
export function solveWithBFS(
  graph: AuditGraph,
  initialState: GameState,
  goalVertexId: string,
  requiredFinalClues: string[]
): SearchResult {
  const startTime = performance.now();
  const queue = new Queue<SearchFrame>();
  const visitedAVL = new AVLTree<boolean>();

  const initialKey = computeCanonicalStateKey(initialState);
  visitedAVL.insert(initialKey, true);

  queue.enqueue({
    state: initialState,
    path: [initialState.currentVertex],
    statePath: [initialState],
    depth: 0,
    parentKey: null,
    actionLabel: 'Início',
  });

  const visitOrder: string[] = [];
  const searchTree: SearchTreeNode[] = [];
  let statesExplored = 0;
  let duplicatesAvoided = 0;
  let maxFrontierSize = 1;

  while (!queue.isEmpty()) {
    maxFrontierSize = Math.max(maxFrontierSize, queue.size());
    const frame = queue.dequeue()!;
    const currentKey = computeCanonicalStateKey(frame.state);

    statesExplored++;
    visitOrder.push(`${frame.state.currentVertex}(${frame.state.collectedClues.length}p)`);

    const goalReached = isGoalState(frame.state, goalVertexId, requiredFinalClues);

    searchTree.push({
      stateKey: currentKey,
      parentKey: frame.parentKey,
      vertexId: frame.state.currentVertex,
      actionLabel: frame.actionLabel,
      depth: frame.depth,
      cost: frame.state.costAccumulated,
      cluesCount: frame.state.collectedClues.length,
      isGoal: goalReached,
      isPrunedDuplicate: false,
    });

    if (goalReached) {
      return {
        algorithm: 'BFS',
        found: true,
        path: frame.path,
        statePath: frame.statePath,
        visitOrder,
        statesExplored,
        duplicatesAvoided,
        maxFrontierSize,
        totalCost: frame.state.costAccumulated,
        executionTimeMs: performance.now() - startTime,
        avlHeight: visitedAVL.treeHeight(),
        avlRotations: visitedAVL.rotationCount,
        searchTree,
      };
    }

    // Gera sucessores aplicando EXATAMENTE a mesma função de regra do modo manual
    const neighbors = graph.getNeighbors(frame.state.currentVertex);
    for (const edge of neighbors) {
      const transition = validateGraphTransition(graph, frame.state, edge.to);
      if (!transition.valid || !transition.nextState) {
        continue;
      }

      const nextKey = computeCanonicalStateKey(transition.nextState);
      const alreadyVisited = visitedAVL.search(nextKey);

      if (alreadyVisited.found) {
        duplicatesAvoided++;
        if (searchTree.length < 150) {
          searchTree.push({
            stateKey: `${nextKey}#dup-${duplicatesAvoided}`,
            parentKey: currentKey,
            vertexId: transition.nextState.currentVertex,
            actionLabel: `Podado (AVL): ${frame.state.currentVertex}→${edge.to}`,
            depth: frame.depth + 1,
            cost: transition.nextState.costAccumulated,
            cluesCount: transition.nextState.collectedClues.length,
            isGoal: false,
            isPrunedDuplicate: true,
          });
        }
        continue;
      }

      visitedAVL.insert(nextKey, true);
      queue.enqueue({
        state: transition.nextState,
        path: [...frame.path, transition.nextState.currentVertex],
        statePath: [...frame.statePath, transition.nextState],
        depth: frame.depth + 1,
        parentKey: currentKey,
        actionLabel: `${frame.state.currentVertex}→${edge.to} (custo ${edge.cost})`,
      });
    }
  }

  return {
    algorithm: 'BFS',
    found: false,
    path: [],
    statePath: [],
    visitOrder,
    statesExplored,
    duplicatesAvoided,
    maxFrontierSize,
    totalCost: 0,
    executionTimeMs: performance.now() - startTime,
    avlHeight: visitedAVL.treeHeight(),
    avlRotations: visitedAVL.rotationCount,
    searchTree,
  };
}

/**
 * SOLVER DFS RECURSIVA (Busca em Profundidade com Recursão Explícita)
 * REFERÊNCIA NO PROGRAMA: Seção 9.2 — Caso-base, chamadas recursivas e condição de retorno claramente identificados.
 */
export function solveWithDFSRecursive(
  graph: AuditGraph,
  initialState: GameState,
  goalVertexId: string,
  requiredFinalClues: string[]
): SearchResult {
  const startTime = performance.now();
  const visitedAVL = new AVLTree<boolean>();
  const visitOrder: string[] = [];
  const searchTree: SearchTreeNode[] = [];

  let statesExplored = 0;
  let duplicatesAvoided = 0;
  let maxDepthObserved = 1;
  let solutionPath: string[] = [];
  let solutionStatePath: GameState[] = [];
  let totalCost = 0;

  /**
   * Função recursiva de exploração do espaço de estados.
   * 1. CASO-BASE DE SUCESSO: Estado atual atinge o Centro de Validação com todas as pistas exigidas -> retorna true.
   * 2. CHAMADA RECURSIVA: Para cada transição válida não visitada na AVL, invoca `explore(nextState)`.
   * 3. CONDIÇÃO DE RETORNO (BACKTRACKING): Se nenhum vizinho leva ao objetivo, retorna false para retroceder.
   */
  const explore = (
    state: GameState,
    path: string[],
    statePath: GameState[],
    depth: number,
    parentKey: string | null,
    actionLabel: string
  ): boolean => {
    maxDepthObserved = Math.max(maxDepthObserved, depth + 1);
    const currentKey = computeCanonicalStateKey(state);

    // Registra o estado atual na AVL antes de expandir seus vizinhos
    visitedAVL.insert(currentKey, true);
    statesExplored++;
    visitOrder.push(`${state.currentVertex}(${state.collectedClues.length}p)`);

    const goalReached = isGoalState(state, goalVertexId, requiredFinalClues);

    searchTree.push({
      stateKey: currentKey,
      parentKey,
      vertexId: state.currentVertex,
      actionLabel,
      depth,
      cost: state.costAccumulated,
      cluesCount: state.collectedClues.length,
      isGoal: goalReached,
      isPrunedDuplicate: false,
    });

    // [CASO-BASE]: Objetivo alcançado respeitando todas as regras!
    if (goalReached) {
      solutionPath = path;
      solutionStatePath = statePath;
      totalCost = state.costAccumulated;
      return true;
    }

    const neighbors = graph.getNeighbors(state.currentVertex);
    for (const edge of neighbors) {
      const transition = validateGraphTransition(graph, state, edge.to);
      if (!transition.valid || !transition.nextState) {
        continue;
      }

      const nextKey = computeCanonicalStateKey(transition.nextState);
      if (visitedAVL.search(nextKey).found) {
        duplicatesAvoided++;
        if (searchTree.length < 150) {
          searchTree.push({
            stateKey: `${nextKey}#dup-${duplicatesAvoided}`,
            parentKey: currentKey,
            vertexId: transition.nextState.currentVertex,
            actionLabel: `Podado (AVL): ${state.currentVertex}→${edge.to}`,
            depth: depth + 1,
            cost: transition.nextState.costAccumulated,
            cluesCount: transition.nextState.collectedClues.length,
            isGoal: false,
            isPrunedDuplicate: true,
          });
        }
        continue;
      }

      // [CHAMADA RECURSIVA]: Avança em profundidade para o próximo estado válido
      const found = explore(
        transition.nextState,
        [...path, transition.nextState.currentVertex],
        [...statePath, transition.nextState],
        depth + 1,
        currentKey,
        `${state.currentVertex}→${edge.to} (custo ${edge.cost})`
      );

      if (found) {
        return true; // [RETORNO ANTECIPADO]: Propaga a solução encontrada pela pilha de chamadas
      }
    }

    // [CONDIÇÃO DE RETORNO SEM SUCESSO]: Todos os caminhos a partir deste estado falharam -> Backtracking
    return false;
  };

  const found = explore(initialState, [initialState.currentVertex], [initialState], 0, null, 'Início');

  return {
    algorithm: 'DFS_RECURSIVE',
    found,
    path: solutionPath,
    statePath: solutionStatePath,
    visitOrder,
    statesExplored,
    duplicatesAvoided,
    maxFrontierSize: maxDepthObserved,
    totalCost,
    executionTimeMs: performance.now() - startTime,
    avlHeight: visitedAVL.treeHeight(),
    avlRotations: visitedAVL.rotationCount,
    searchTree,
  };
}

/**
 * SOLVER DFS ITERATIVA usando Pilha (LIFO) própria e Árvore AVL própria.
 */
export function solveWithDFSIterative(
  graph: AuditGraph,
  initialState: GameState,
  goalVertexId: string,
  requiredFinalClues: string[]
): SearchResult {
  const startTime = performance.now();
  const stack = new Stack<SearchFrame>();
  const visitedAVL = new AVLTree<boolean>();

  stack.push({
    state: initialState,
    path: [initialState.currentVertex],
    statePath: [initialState],
    depth: 0,
    parentKey: null,
    actionLabel: 'Início',
  });

  const visitOrder: string[] = [];
  const searchTree: SearchTreeNode[] = [];
  let statesExplored = 0;
  let duplicatesAvoided = 0;
  let maxFrontierSize = 1;

  while (!stack.isEmpty()) {
    maxFrontierSize = Math.max(maxFrontierSize, stack.size());
    const frame = stack.pop()!;
    const currentKey = computeCanonicalStateKey(frame.state);

    if (visitedAVL.search(currentKey).found) {
      duplicatesAvoided++;
      continue;
    }

    visitedAVL.insert(currentKey, true);
    statesExplored++;
    visitOrder.push(`${frame.state.currentVertex}(${frame.state.collectedClues.length}p)`);

    const goalReached = isGoalState(frame.state, goalVertexId, requiredFinalClues);

    searchTree.push({
      stateKey: currentKey,
      parentKey: frame.parentKey,
      vertexId: frame.state.currentVertex,
      actionLabel: frame.actionLabel,
      depth: frame.depth,
      cost: frame.state.costAccumulated,
      cluesCount: frame.state.collectedClues.length,
      isGoal: goalReached,
      isPrunedDuplicate: false,
    });

    if (goalReached) {
      return {
        algorithm: 'DFS_ITERATIVE',
        found: true,
        path: frame.path,
        statePath: frame.statePath,
        visitOrder,
        statesExplored,
        duplicatesAvoided,
        maxFrontierSize,
        totalCost: frame.state.costAccumulated,
        executionTimeMs: performance.now() - startTime,
        avlHeight: visitedAVL.treeHeight(),
        avlRotations: visitedAVL.rotationCount,
        searchTree,
      };
    }

    const neighbors = [...graph.getNeighbors(frame.state.currentVertex)].reverse();
    for (const edge of neighbors) {
      const transition = validateGraphTransition(graph, frame.state, edge.to);
      if (!transition.valid || !transition.nextState) continue;

      const nextKey = computeCanonicalStateKey(transition.nextState);
      if (!visitedAVL.search(nextKey).found) {
        stack.push({
          state: transition.nextState,
          path: [...frame.path, transition.nextState.currentVertex],
          statePath: [...frame.statePath, transition.nextState],
          depth: frame.depth + 1,
          parentKey: currentKey,
          actionLabel: `${frame.state.currentVertex}→${edge.to} (custo ${edge.cost})`,
        });
      } else {
        duplicatesAvoided++;
      }
    }
  }

  return {
    algorithm: 'DFS_ITERATIVE',
    found: false,
    path: [],
    statePath: [],
    visitOrder,
    statesExplored,
    duplicatesAvoided,
    maxFrontierSize,
    totalCost: 0,
    executionTimeMs: performance.now() - startTime,
    avlHeight: visitedAVL.treeHeight(),
    avlRotations: visitedAVL.rotationCount,
    searchTree,
  };
}
