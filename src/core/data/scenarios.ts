/**
 * MÓDULO: Cenários Fictícios de Verídia (2042) — Dados de Entrada Reproduzíveis
 * REFERÊNCIA NO PROGRAMA:
 *  - Fase 2 (Central de Triagem): Evidências E1 a E6 na Fila de Entrada.
 *  - Fase 3 (Mapa das Seções): Grafo com 8 vértices e 11 conexões (exigência: >= 8 vértices e >= 10 conexões).
 *  - Fase 5 (Auditoria Final): Cenário Estendido com 10 vértices e 15 conexões para comparação BFS vs DFS.
 */

import { AuditGraph } from '../structures/Graph';
import { EvidenceItem, GameState, GraphEdge, GraphVertex, IAGLogEntry } from '../types';

export const PHASE2_INITIAL_EVIDENCES: EvidenceItem[] = [
  { id: 'E1', label: 'Ata de Abertura', description: 'Registro inicial da Zona 01 antes do início da votação.', priorityCode: 3 },
  { id: 'E2', label: 'Boletim Primário', description: 'Lote mestre que inaugura a trilha oficial de custódia.', priorityCode: 1 },
  { id: 'E3', label: 'Log de Diagnóstico', description: 'Evento auxiliar de manutenção técnica descartável.', priorityCode: 9 },
  { id: 'E4', label: 'Hash de Conferência', description: 'Assinatura intermediária que vincula os blocos.', priorityCode: 2 },
  { id: 'E5', label: 'Cópia Redundante', description: 'Espelho secundário armazenado para redundância.', priorityCode: 9 },
  { id: 'E6', label: 'Selo de Encerramento', description: 'Fechamento criptográfico final da sequência de custódia.', priorityCode: 4 },
];

export interface MapScenarioConfig {
  id: string;
  title: string;
  subtitle: string;
  startVertex: string;
  goalVertex: string;
  initialEnergy: number;
  requiredFinalClues: string[];
  vertices: GraphVertex[];
  edges: GraphEdge[];
}

/**
 * CENÁRIO 1 (Fase 3): 8 vértices e 11 conexões, incluindo bifurcações, caminho alternativo,
 * pista de sequência que libera o Arquivo Oeste, e pista de autenticação obrigatória.
 */
export const SCENARIO_STANDARD: MapScenarioConfig = {
  id: 'veridia-standard',
  title: 'Cenário Padrão: Rede Regional de Verídia',
  subtitle: '8 locais de auditoria · 11 conexões · 1 porta lógica condicional · caminho curto bloqueado sem pista',
  startVertex: 'A',
  goalVertex: 'H',
  initialEnergy: 12,
  requiredFinalClues: ['PISTA_AUTENTICACAO'],
  vertices: [
    { id: 'A', name: 'Central de Auditoria', description: 'Ponto inicial da investigação.', x: 75, y: 205 },
    { id: 'B', name: 'Arquivo Norte', description: 'Guarda registros recebidos.', x: 245, y: 85 },
    { id: 'C', name: 'Arquivo Sul', description: 'Guarda cópias de conferência.', x: 245, y: 325, clueGranted: 'PISTA_SEQUENCIA', unlocksDoor: 'PORTA_OESTE' },
    { id: 'D', name: 'Posto de Triagem', description: 'Intersecção central de malotes.', x: 420, y: 205 },
    { id: 'E', name: 'Unidade Leste', description: 'Possui a Pista de Autenticação obrigatória.', x: 520, y: 85, clueGranted: 'PISTA_AUTENTICACAO' },
    { id: 'F', name: 'Unidade Oeste', description: 'Acesso protegido pela Pista de Sequência.', x: 520, y: 325 },
    { id: 'G', name: 'Torre de Controle', description: 'Rota alternativa de conferência.', x: 650, y: 270 },
    { id: 'H', name: 'Centro de Validação', description: 'Destino final da trilha (exige Autenticação).', x: 730, y: 150 },
  ],
  edges: [
    { from: 'A', to: 'B', cost: 2, bidirectional: true },
    { from: 'A', to: 'C', cost: 2, bidirectional: true },
    { from: 'B', to: 'D', cost: 2, bidirectional: true },
    { from: 'B', to: 'E', cost: 3, bidirectional: true },
    { from: 'C', to: 'D', cost: 2, bidirectional: true },
    // Passagem protegida conforme Seção 7.5: Arquivo Oeste só após pista de sequência
    { from: 'C', to: 'F', cost: 1, requiredClue: 'PISTA_SEQUENCIA', bidirectional: true, label: 'Exige Pista Sequência' },
    { from: 'D', to: 'E', cost: 2, bidirectional: true },
    { from: 'D', to: 'H', cost: 1, bidirectional: false, label: 'Atalho direto (sem pista falha na validação!)' },
    { from: 'E', to: 'H', cost: 2, bidirectional: true },
    { from: 'F', to: 'G', cost: 2, bidirectional: true },
    { from: 'G', to: 'H', cost: 2, bidirectional: true },
  ],
};

/**
 * CENÁRIO 2 (Fase 5 — Comparação de Dificuldade): 10 vértices e 15 conexões,
 * com 2 pistas obrigatórias em ramos opostos e orçamento de energia restrito.
 */
export const SCENARIO_EXTENDED: MapScenarioConfig = {
  id: 'veridia-extended',
  title: 'Cenário Estendido: Auditoria Metropolitana',
  subtitle: '10 locais · 15 conexões · 2 pistas obrigatórias em ramos distintos · comparação de espaço de estados',
  startVertex: 'A',
  goalVertex: 'J',
  initialEnergy: 18,
  requiredFinalClues: ['PISTA_SEQUENCIA', 'PISTA_AUTENTICACAO'],
  vertices: [
    { id: 'A', name: 'Central de Auditoria', description: 'Ponto inicial.', x: 65, y: 205 },
    { id: 'B', name: 'Setor Alfa', description: 'Posto de recepção norte.', x: 200, y: 90 },
    { id: 'C', name: 'Setor Beta', description: 'Posto de conferência sul.', x: 200, y: 320 },
    { id: 'D', name: 'Arquivo de Sequência', description: 'Concede PISTA_SEQUENCIA.', x: 350, y: 90, clueGranted: 'PISTA_SEQUENCIA', unlocksDoor: 'PORTA_OESTE' },
    { id: 'E', name: 'Núcleo Intermediário', description: 'Bifurcação de rotas.', x: 350, y: 220 },
    { id: 'F', name: 'Cofre Periférico', description: 'Ponto de backup sul.', x: 350, y: 340 },
    { id: 'G', name: 'Unidade Oeste', description: 'Exige PISTA_SEQUENCIA para entrar.', x: 515, y: 120 },
    { id: 'H', name: 'Unidade Leste', description: 'Concede PISTA_AUTENTICACAO.', x: 515, y: 280, clueGranted: 'PISTA_AUTENTICACAO' },
    { id: 'I', name: 'Terminal de Lacres', description: 'Pré-validação final.', x: 645, y: 205 },
    { id: 'J', name: 'Centro de Validação', description: 'Destino final (exige ambas as pistas).', x: 745, y: 205 },
  ],
  edges: [
    { from: 'A', to: 'B', cost: 2, bidirectional: true },
    { from: 'A', to: 'C', cost: 2, bidirectional: true },
    { from: 'B', to: 'D', cost: 2, bidirectional: true },
    { from: 'B', to: 'E', cost: 2, bidirectional: true },
    { from: 'C', to: 'E', cost: 2, bidirectional: true },
    { from: 'C', to: 'F', cost: 2, bidirectional: true },
    { from: 'D', to: 'G', cost: 2, requiredClue: 'PISTA_SEQUENCIA', bidirectional: true, label: 'Exige Sequência' },
    { from: 'D', to: 'E', cost: 2, bidirectional: true },
    { from: 'E', to: 'G', cost: 3, requiredClue: 'PISTA_SEQUENCIA', bidirectional: true, label: 'Exige Sequência' },
    { from: 'E', to: 'H', cost: 2, bidirectional: true },
    { from: 'F', to: 'H', cost: 2, bidirectional: true },
    { from: 'G', to: 'H', cost: 2, bidirectional: true },
    { from: 'G', to: 'I', cost: 2, bidirectional: true },
    { from: 'H', to: 'I', cost: 2, bidirectional: true },
    { from: 'I', to: 'J', cost: 2, bidirectional: true },
  ],
};

export function buildGraphFromScenario(scenario: MapScenarioConfig): AuditGraph {
  const graph = new AuditGraph();
  for (const v of scenario.vertices) {
    graph.addVertex(v);
  }
  for (const e of scenario.edges) {
    graph.addEdge(e);
  }
  return graph;
}

export function createInitialGameState(scenario: MapScenarioConfig): GameState {
  return {
    currentVertex: scenario.startVertex,
    collectedClues: [],
    unlockedDoors: [],
    energyRemaining: scenario.initialEnergy,
    costAccumulated: 0,
  };
}

/**
 * Registro transparente e obrigatório do uso de IAG (Seção 14.4 do EP).
 */
export const DEFAULT_IAG_LOGS: IAGLogEntry[] = [
  {
    toolAndDate: 'Google AI Studio / Gemini · Nov 2026',
    promptGoal: 'Estruturar a modelagem de domínio fictícia de Verídia e definir a chave canônica de estado.',
    excerptUsed: 'Separação do estado em (posição_atual, pistas_coletadas, portas_liberadas, energia_ou_custo) com ordenação determinística das pistas.',
    humanModifications: 'Adicionamos campo hash_verificacao nos registros da Fase 1 e ajustamos os custos das arestas para forçar conflito entre menor número de arestas e pista obrigatória.',
    validationMethod: 'Testes unitários em AVLTree e gameRules comprovando que estados na mesma posição com pistas diferentes geram chaves distintas.',
  },
  {
    toolAndDate: 'Google AI Studio / Gemini · Nov 2026',
    promptGoal: 'Implementar módulos independentes de Fila (FIFO), Pilha (LIFO) e Lista Duplamente Ligada.',
    excerptUsed: 'Uso de ponteiro headIndex na Fila para evitar custo O(n) de Array.shift() em grandes volumes.',
    humanModifications: 'Substituímos lista simplesmente ligada por lista duplamente ligada com tail para garantir remoção O(1) ao acionar Desfazer na Fase 2.',
    validationMethod: 'Suíte automatizada cobrindo estrutura vazia, 1 elemento, remoção início/meio/fim e tentativas inválidas.',
  },
  {
    toolAndDate: 'Google AI Studio / Gemini · Nov 2026',
    promptGoal: 'Criar Bubble Sort, Merge Sort e Quick Sort instrumentados com contagem de comparações e movimentações.',
    excerptUsed: 'Função de comparação composta (zona -> secao -> timestamp) e registro de passos (SortStep) para animação visual.',
    humanModifications: 'Adicionamos escolha de pivô central no Quick Sort para mitigar O(n²) em entradas já ordenadas e criamos verifyAuditOrder para apontar o primeiro erro.',
    validationMethod: 'Benchmark empírico em n = 20, 100, 300 e 600 + testes com vetores vazios, invertidos e com empates de horário.',
  },
  {
    toolAndDate: 'Google AI Studio / Gemini · Nov 2026',
    promptGoal: 'Implementar Árvore AVL com captura de snapshots antes e depois de cada rotação (LL, RR, LR, RL).',
    excerptUsed: 'Estrutura recursiva de inserção que calcula fator de balanceamento e dispara eventos de rotação.',
    humanModifications: 'Incluímos verificador de invariante isValidAVL() e renderizador SVG interativo para exibir altura e BF de cada nó.',
    validationMethod: 'Testes automatizados inserindo sequências que forçam exatamente as 4 rotações clássicas e validando buscas existentes e inexistentes.',
  },
  {
    toolAndDate: 'Google AI Studio / Gemini · Nov 2026',
    promptGoal: 'Integrar Solver BFS e DFS Recursiva utilizando exatamente as mesmas regras do modo manual e gerar árvore de busca.',
    excerptUsed: 'Padrão de caso-base, chamadas recursivas e condição de retorno explícitos na DFS, com poda via AVL.',
    humanModifications: 'Unificamos validateGraphTransition() entre modo manual e solver e adicionamos geração do relatório técnico completo em PDF com jsPDF.',
    validationMethod: 'Teste de integração comparando trajetória encontrada pelo solver contra validação passo a passo no motor de regras.',
  },
];
