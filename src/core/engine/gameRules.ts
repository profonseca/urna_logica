/**
 * MÓDULO: Motor de Regras Verificáveis do Jogo (Fases 1 a 5)
 * REFERÊNCIA NO PROGRAMA:
 *  - Separação estrita entre regras do jogo e interface/solver (Requisito Não Funcional Seção 12 & Etapa 11).
 *  - Tanto o modo manual quanto o solver automático utilizam EXATAMENTE estas funções de validação.
 */

import { AuditGraph } from '../structures/Graph';
import { DoublyLinkedList } from '../structures/LinkedList';
import { Queue } from '../structures/Queue';
import { Stack } from '../structures/Stack';
import { EvidenceItem, GameState } from '../types';

export const TARGET_CUSTODY_SEQUENCE = ['E2', 'E4', 'E1', 'E6'];

export interface RuleCheckResult {
  allowed: boolean;
  reason: string;
}

/**
 * FASE 2 — Validação explícita da transferência Fila -> Pilha temporária.
 * Regra: Só é possível mover se a fila não estiver vazia. A pilha comporta até 4 itens temporários.
 */
export function canMoveQueueToStack(queue: Queue<EvidenceItem>, stack: Stack<EvidenceItem>): RuleCheckResult {
  if (queue.isEmpty()) {
    return { allowed: false, reason: 'A Fila de entrada está vazia. Não há evidências para consultar.' };
  }
  if (stack.size() >= 4) {
    return {
      allowed: false,
      reason: 'A Pilha de reserva atingiu o limite máximo de 4 evidências para evitar perda de rastreio.',
    };
  }
  const frontItem = queue.front()!;
  return {
    allowed: true,
    reason: `Evidência ${frontItem.id} pronta para ser reservada no topo da Pilha (LIFO).`,
  };
}

/**
 * FASE 2 — Validação dinâmica da inserção na Lista Ligada de Custódia.
 * NÃO usa sequência fixa escondida: valida contra a regra estrutural da trilha de custódia
 * (próximo passo esperado conforme regra de integridade da trilha).
 */
export function canInsertIntoCustodyList(
  candidate: EvidenceItem | undefined,
  list: DoublyLinkedList<EvidenceItem>,
  targetSequence: string[] = TARGET_CUSTODY_SEQUENCE
): RuleCheckResult {
  if (!candidate) {
    return { allowed: false, reason: 'Estrutura de origem vazia: nenhum elemento disponível para inserir.' };
  }

  const currentItems = list.traverse();
  const nextExpectedIndex = currentItems.length;

  if (nextExpectedIndex >= targetSequence.length) {
    return {
      allowed: false,
      reason: 'A Lista de Custódia já atingiu os 4 elos obrigatórios da trilha.',
    };
  }

  const expectedId = targetSequence[nextExpectedIndex];
  if (candidate.id !== expectedId) {
    return {
      allowed: false,
      reason: `Movimentação recusada pela regra de custódia: o próximo elo esperado na lista é ${expectedId}, mas você tentou inserir ${candidate.id}. Dica: reserve na Pilha se precisar acessá-la depois.`,
    };
  }

  return {
    allowed: true,
    reason: `Elo ${candidate.id} aceito na posição ${nextExpectedIndex + 1} da Lista Ligada.`,
  };
}

/**
 * FASE 2 — Verifica se a Lista Ligada completou com sucesso a sequência de custódia.
 */
export function isCustodyListComplete(
  list: DoublyLinkedList<EvidenceItem>,
  targetSequence: string[] = TARGET_CUSTODY_SEQUENCE
): boolean {
  const items = list.traverse();
  if (items.length !== targetSequence.length) return false;
  return items.every((item, idx) => item.id === targetSequence[idx]);
}

/**
 * FASE 3, 4 e 5 — Gera a Chave Canônica Única de um Estado (Seção 8.1 e 8.2).
 *
 * POR QUE NÃO BASTA USAR APENAS O VÉRTICE ATUAL?
 *  Se o jogador está no vértice "C" COM a pista de autenticação, ele pode abrir portas
 *  que outro estado no mesmo vértice "C" SEM a pista não pode.
 *  Logo, a chave ordena deterministicamente as pistas e portas e inclui o vértice atual.
 *  Nota: Para controle de estados visitados em busca de menor caminho/exploração sem loops,
 *  estados com mesma posição e mesmas pistas/portas são equivalentes; se houver orçamento de energia,
 *  só vale revisitar se chegar com MAIS energia restante (tratado pelo solver ou chave completa).
 */
export function computeCanonicalStateKey(state: GameState, includeEnergy = false): string {
  const sortedClues = [...new Set(state.collectedClues)].sort().join(',');
  const sortedDoors = [...new Set(state.unlockedDoors)].sort().join(',');
  const base = `${state.currentVertex}|P:[${sortedClues}]|D:[${sortedDoors}]`;
  return includeEnergy ? `${base}|E:${state.energyRemaining}` : base;
}

/**
 * FASE 3 e 5 — Valida uma transição de vértice no grafo respeitando portas bloqueadas e energia.
 * Usada tanto pelo jogador no Modo Manual quanto pelos algoritmos BFS/DFS no Modo Solver!
 */
export function validateGraphTransition(
  graph: AuditGraph,
  state: GameState,
  targetVertexId: string
): { valid: boolean; reason: string; nextState?: GameState } {
  const neighbors = graph.getNeighbors(state.currentVertex);
  const edge = neighbors.find((e) => e.to === targetVertexId);

  if (!edge) {
    return {
      valid: false,
      reason: `Conexão inexistente: não há rota direta entre ${state.currentVertex} e ${targetVertexId}.`,
    };
  }

  if (edge.requiredClue && !state.collectedClues.includes(edge.requiredClue)) {
    return {
      valid: false,
      reason: `Porta bloqueada! A passagem ${state.currentVertex} → ${targetVertexId} exige a pista "${edge.requiredClue}".`,
    };
  }

  if (state.energyRemaining < edge.cost) {
    return {
      valid: false,
      reason: `Energia insuficiente: esta conexão consome ${edge.cost} de energia, mas você possui apenas ${state.energyRemaining}.`,
    };
  }

  const targetVertex = graph.getVertex(targetVertexId);
  const nextClues = [...state.collectedClues];
  const nextDoors = [...state.unlockedDoors];

  if (targetVertex?.clueGranted && !nextClues.includes(targetVertex.clueGranted)) {
    nextClues.push(targetVertex.clueGranted);
  }
  if (targetVertex?.unlocksDoor && !nextDoors.includes(targetVertex.unlocksDoor)) {
    nextDoors.push(targetVertex.unlocksDoor);
  }

  nextClues.sort();
  nextDoors.sort();

  const nextState: GameState = {
    currentVertex: targetVertexId,
    collectedClues: nextClues,
    unlockedDoors: nextDoors,
    energyRemaining: state.energyRemaining - edge.cost,
    costAccumulated: state.costAccumulated + edge.cost,
  };

  return {
    valid: true,
    reason: targetVertex?.clueGranted
      ? `Movimento aceito para ${targetVertex.name}. Pista coletada: ${targetVertex.clueGranted}!`
      : `Movimento aceito para ${targetVertex?.name ?? targetVertexId} (custo: ${edge.cost}).`,
    nextState,
  };
}

/**
 * FASE 3 e 5 — Condição formal de vitória (Seção 7.5):
 *  "A rota final precisa passar por um ponto de autenticação antes do Centro de Validação."
 */
export function isGoalState(
  state: GameState,
  goalVertexId: string,
  requiredFinalClues: string[]
): boolean {
  if (state.currentVertex !== goalVertexId) return false;
  return requiredFinalClues.every((clue) => state.collectedClues.includes(clue));
}
