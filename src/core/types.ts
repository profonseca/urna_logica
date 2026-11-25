/**
 * MÓDULO: Definições de Tipos e Modelos de Domínio (Core / Modelagem)
 * REFERÊNCIA NO PROGRAMA: Todas as Fases (1 a 5) — Base estrutural do jogo "Urna Lógica: O Enigma da Eleição de Verídia".
 *
 * Todos os nomes, zonas, seções, opções e locais são 100% fictícios e apartidários (Ano fictício: 2042).
 */

export type RecordStatus = 'PENDENTE' | 'CONFERIDO' | 'DIVERGENTE';

/**
 * Representa um registro individual de urna fictícia na Fase 1 (O Arquivo Embaralhado).
 */
export interface VotingRecord {
  id_registro: string;
  zona: string;
  secao: string;
  opcao: string;
  timestamp: string;
  status: RecordStatus;
  hash_verificacao: string; // Campo extra: garante integridade e detecção de perda/alteração
}

export type SortCriterion = 'composta' | 'zona' | 'secao' | 'timestamp' | 'id_registro';
export type SortAlgorithmName = 'bubble' | 'merge' | 'quick';

export interface SortStep {
  arraySnapshot: VotingRecord[];
  comparedIndices: [number, number] | null;
  swappedIndices: [number, number] | null;
  description: string;
}

export interface SortResult {
  algorithm: SortAlgorithmName;
  criterion: SortCriterion;
  sorted: VotingRecord[];
  comparisons: number;
  movements: number;
  executionTimeMs: number;
  steps: SortStep[];
}

/**
 * Representa uma evidência na Fase 2 (A Central de Triagem).
 */
export interface EvidenceItem {
  id: string;
  label: string;
  description: string;
  priorityCode: number;
}

export interface TriageAction {
  type: 'QUEUE_TO_STACK' | 'QUEUE_TO_LIST' | 'STACK_TO_LIST' | 'REMOVE_FROM_LIST';
  item: EvidenceItem;
  from: 'queue' | 'stack' | 'list';
  to: 'stack' | 'list' | 'discard';
  listIndex?: number;
  timestampLabel: string;
}

/**
 * Vértice e Aresta do Grafo nas Fases 3 e 5 (O Mapa das Seções e Auditoria Final).
 */
export interface GraphVertex {
  id: string;
  name: string;
  description: string;
  x: number; // Coordenada X normalizada (0..800) para o gráfico interativo SVG
  y: number; // Coordenada Y normalizada (0..420) para o gráfico interativo SVG
  clueGranted?: string; // Pista coletada ao visitar este vértice (ex: 'PISTA_AUTENTICACAO')
  unlocksDoor?: string; // Porta lógica liberada (ex: 'PORTA_OESTE')
}

export interface GraphEdge {
  from: string;
  to: string;
  cost: number; // Energia consumida ao atravessar esta conexão
  requiredClue?: string; // Restrição lógica: exige pista prévia no estado para liberar passagem
  bidirectional: boolean;
  label?: string;
}

/**
 * MODELO MÍNIMO DE ESTADO (Seção 7.3 do EP)
 * Estado = (posição_atual, pistas_coletadas, portas_liberadas, energia_ou_custo)
 */
export interface GameState {
  currentVertex: string;
  collectedClues: string[];
  unlockedDoors: string[];
  energyRemaining: number;
  costAccumulated: number;
}

export interface SearchTreeNode {
  stateKey: string;
  parentKey: string | null;
  vertexId: string;
  actionLabel: string;
  depth: number;
  cost: number;
  cluesCount: number;
  isGoal: boolean;
  isPrunedDuplicate: boolean;
}

export interface SearchResult {
  algorithm: 'BFS' | 'DFS_RECURSIVE' | 'DFS_ITERATIVE';
  found: boolean;
  path: string[];
  statePath: GameState[];
  visitOrder: string[];
  statesExplored: number;
  duplicatesAvoided: number;
  maxFrontierSize: number;
  totalCost: number;
  executionTimeMs: number;
  avlHeight: number;
  avlRotations: number;
  searchTree: SearchTreeNode[];
}

export interface AVLRotationEvent {
  type: 'LL (Simples à Direita)' | 'RR (Simples à Esquerda)' | 'LR (Dupla Esquerda-Direita)' | 'RL (Dupla Direita-Esquerda)';
  pivotKey: string;
  insertedKey: string;
  beforeSnapshot: AVLNodeSnapshot | null;
  afterSnapshot: AVLNodeSnapshot | null;
}

export interface AVLNodeSnapshot {
  key: string;
  height: number;
  balanceFactor: number;
  left: AVLNodeSnapshot | null;
  right: AVLNodeSnapshot | null;
}

export interface TestCaseResult {
  id: string;
  module: string;
  name: string;
  passed: boolean;
  details: string;
  durationMs: number;
}

export interface BenchmarkEntry {
  size: number;
  bubbleMs: number;
  bubbleComparisons: number;
  bubbleMovements: number;
  mergeMs: number;
  mergeComparisons: number;
  mergeMovements: number;
  quickMs: number;
  quickComparisons: number;
  quickMovements: number;
}

export interface IAGLogEntry {
  toolAndDate: string;
  promptGoal: string;
  excerptUsed: string;
  humanModifications: string;
  validationMethod: string;
}

export type PhaseId = 1 | 2 | 3 | 4 | 5;
