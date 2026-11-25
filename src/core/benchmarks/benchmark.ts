/**
 * MÓDULO: Suíte de Benchmarks Empíricos de Complexidade
 * REFERÊNCIA NO PROGRAMA: Seção 15.1 (Métricas de Desempenho) e Seção 16.1 (Análise de Complexidade).
 *
 * Mede experimentalmente comparações, movimentações e tempo (ms) para n = 20, 100, 300, 600
 * nos três algoritmos de ordenação, e compara BFS vs DFS em dois cenários de grafos.
 */

import { bubbleSort, mergeSort, quickSort } from '../algorithms/sorting';
import { solveWithBFS, solveWithDFSRecursive } from '../algorithms/search';
import {
  buildGraphFromScenario,
  createInitialGameState,
  SCENARIO_EXTENDED,
  SCENARIO_STANDARD,
} from '../data/scenarios';
import { generateFictitiousRecords, shuffleRecordsWithSeed } from '../prng';
import { BenchmarkEntry, SearchResult } from '../types';

export function runSortingBenchmarks(seed = 2042): BenchmarkEntry[] {
  const sizes = [20, 100, 300, 600];
  return sizes.map((size) => {
    const base = generateFictitiousRecords(size, seed);
    const shuffled = shuffleRecordsWithSeed(base, seed + size);

    const b = bubbleSort(shuffled, 'composta', false);
    const m = mergeSort(shuffled, 'composta', false);
    const q = quickSort(shuffled, 'composta', false);

    return {
      size,
      bubbleMs: Number(b.executionTimeMs.toFixed(3)),
      bubbleComparisons: b.comparisons,
      bubbleMovements: b.movements,
      mergeMs: Number(m.executionTimeMs.toFixed(3)),
      mergeComparisons: m.comparisons,
      mergeMovements: m.movements,
      quickMs: Number(q.executionTimeMs.toFixed(3)),
      quickComparisons: q.comparisons,
      quickMovements: q.movements,
    };
  });
}

export interface SearchScenarioComparison {
  scenarioTitle: string;
  verticesCount: number;
  edgesCount: number;
  bfs: SearchResult;
  dfs: SearchResult;
}

export function runSearchBenchmarks(): SearchScenarioComparison[] {
  const scenarios = [SCENARIO_STANDARD, SCENARIO_EXTENDED];
  return scenarios.map((sc) => {
    const graph = buildGraphFromScenario(sc);
    const initial = createInitialGameState(sc);
    const bfs = solveWithBFS(graph, initial, sc.goalVertex, sc.requiredFinalClues);
    const dfs = solveWithDFSRecursive(graph, initial, sc.goalVertex, sc.requiredFinalClues);

    return {
      scenarioTitle: sc.title,
      verticesCount: sc.vertices.length,
      edgesCount: sc.edges.length,
      bfs,
      dfs,
    };
  });
}
