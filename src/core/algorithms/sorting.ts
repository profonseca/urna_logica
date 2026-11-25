/**
 * MÓDULO: Algoritmos de Ordenação (Bubble Sort, Merge Sort e Quick Sort)
 * REFERÊNCIA NO PROGRAMA:
 *  - Fase 1 (O Arquivo Embaralhado): Reorganizar registros fora de ordem usando chave simples ou composta.
 *  - Fase 5 (A Auditoria Final - Seção 9.3): Ordenar evidências e métricas no relatório final.
 *
 * REGRA DO ENIGMA DA FASE 1:
 *  "Ordenar por zona, depois por seção e, em caso de empate, por horário."
 *  Critério composto = (zona ASC, secao ASC, timestamp ASC, id_registro ASC para desempate determinístico).
 */

import { SortAlgorithmName, SortCriterion, SortResult, SortStep, VotingRecord } from '../types';

/**
 * Comparador objetivo que transforma as regras da auditoria em comparação numérica (-1, 0, 1).
 */
export function compareRecords(a: VotingRecord, b: VotingRecord, criterion: SortCriterion): number {
  if (criterion === 'zona') {
    return a.zona.localeCompare(b.zona);
  }
  if (criterion === 'secao') {
    return a.secao.localeCompare(b.secao);
  }
  if (criterion === 'timestamp') {
    return a.timestamp.localeCompare(b.timestamp);
  }
  if (criterion === 'id_registro') {
    return a.id_registro.localeCompare(b.id_registro);
  }

  // Critério 'composta': Chave composta obrigatória da Fase 1 (zona -> secao -> timestamp)
  const z = a.zona.localeCompare(b.zona);
  if (z !== 0) return z;

  const s = a.secao.localeCompare(b.secao);
  if (s !== 0) return s;

  return a.timestamp.localeCompare(b.timestamp);
}

/**
 * Verifica se um vetor ordenado atende integralmente ao critério composto da auditoria
 * e se não houve perda nem duplicação de registros.
 */
export function verifyAuditOrder(
  original: VotingRecord[],
  candidate: VotingRecord[],
  criterion: SortCriterion = 'composta'
): { valid: boolean; firstErrorIndex: number | null; message: string } {
  if (original.length !== candidate.length) {
    return {
      valid: false,
      firstErrorIndex: 0,
      message: `Falha de integridade: quantidade esperada ${original.length}, obtida ${candidate.length}.`,
    };
  }

  const origIds = new Set(original.map((r) => r.id_registro));
  const candIds = new Set(candidate.map((r) => r.id_registro));
  if (origIds.size !== candIds.size) {
    return {
      valid: false,
      firstErrorIndex: 0,
      message: 'Falha de integridade: existem registros duplicados ou ausentes após a ordenação.',
    };
  }
  for (const id of origIds) {
    if (!candIds.has(id)) {
      return {
        valid: false,
        firstErrorIndex: 0,
        message: `Registro ${id} foi perdido durante o processamento.`,
      };
    }
  }

  for (let i = 0; i < candidate.length - 1; i++) {
    if (compareRecords(candidate[i], candidate[i + 1], criterion) > 0) {
      return {
        valid: false,
        firstErrorIndex: i,
        message: `Ordem incorreta detectada no índice ${i}: ${candidate[i].id_registro} (Zona ${candidate[i].zona}, Seção ${candidate[i].secao}, ${candidate[i].timestamp}) deveria vir depois de ${candidate[i + 1].id_registro} (Zona ${candidate[i + 1].zona}, Seção ${candidate[i + 1].secao}, ${candidate[i + 1].timestamp}).`,
      };
    }
  }

  return {
    valid: true,
    firstErrorIndex: null,
    message: 'Auditoria aprovada! Todos os registros estão ordenados e íntegros.',
  };
}

/**
 * BUBBLE SORT (Ordenação por Flutuação)
 * Complexidade: Pior caso O(n²), Caso médio O(n²), Melhor caso O(n) com flag `swapped`. Espaço: O(1) auxiliar. Estável: Sim.
 */
export function bubbleSort(
  records: VotingRecord[],
  criterion: SortCriterion,
  recordSteps = false
): SortResult {
  const start = performance.now();
  const arr = records.map((r) => ({ ...r }));
  let comparisons = 0;
  let movements = 0;
  const steps: SortStep[] = [];

  if (recordSteps) {
    steps.push({
      arraySnapshot: arr.map((r) => ({ ...r })),
      comparedIndices: null,
      swappedIndices: null,
      description: 'Estado inicial antes do Bubble Sort.',
    });
  }

  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const cmp = compareRecords(arr[j], arr[j + 1], criterion);
      if (recordSteps && steps.length < 180) {
        steps.push({
          arraySnapshot: arr.map((r) => ({ ...r })),
          comparedIndices: [j, j + 1],
          swappedIndices: null,
          description: `Comparando ${arr[j].id_registro} com ${arr[j + 1].id_registro}.`,
        });
      }
      if (cmp > 0) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        movements += 3; // 3 atribuições na troca
        swapped = true;

        if (recordSteps && steps.length < 180) {
          steps.push({
            arraySnapshot: arr.map((r) => ({ ...r })),
            comparedIndices: null,
            swappedIndices: [j, j + 1],
            description: `Trocou ${arr[j + 1].id_registro} e ${arr[j].id_registro} de posição.`,
          });
        }
      }
    }
    if (!swapped) break; // Otimização: vetor já ordenado encerra antecipadamente
  }

  const executionTimeMs = performance.now() - start;
  return { algorithm: 'bubble', criterion, sorted: arr, comparisons, movements, executionTimeMs, steps };
}

/**
 * MERGE SORT (Ordenação por Intercalação — Divisão e Conquista)
 * Complexidade: O(n log n) em todos os casos (pior, médio e melhor). Espaço: O(n). Estável: Sim.
 */
export function mergeSort(
  records: VotingRecord[],
  criterion: SortCriterion,
  recordSteps = false
): SortResult {
  const start = performance.now();
  const arr = records.map((r) => ({ ...r }));
  let comparisons = 0;
  let movements = 0;
  const steps: SortStep[] = [];

  if (recordSteps) {
    steps.push({
      arraySnapshot: arr.map((r) => ({ ...r })),
      comparedIndices: null,
      swappedIndices: null,
      description: 'Estado inicial antes do Merge Sort (Divisão e Conquista).',
    });
  }

  const merge = (left: number, mid: number, right: number) => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      if (compareRecords(leftArr[i], rightArr[j], criterion) <= 0) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      movements++;
      if (recordSteps && steps.length < 180) {
        steps.push({
          arraySnapshot: arr.map((r) => ({ ...r })),
          comparedIndices: [k, Math.min(k + 1, right)],
          swappedIndices: [k, k],
          description: `Intercalando ${arr[k].id_registro} na posição ${k}.`,
        });
      }
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      i++;
      k++;
      movements++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      j++;
      k++;
      movements++;
    }
  };

  const sortRange = (left: number, right: number) => {
    if (left >= right) return; // Caso-base da recursão: subvetor com 0 ou 1 elemento
    const mid = Math.floor((left + right) / 2);
    sortRange(left, mid);
    sortRange(mid + 1, right);
    merge(left, mid, right);
  };

  if (arr.length > 1) {
    sortRange(0, arr.length - 1);
  }

  const executionTimeMs = performance.now() - start;
  return { algorithm: 'merge', criterion, sorted: arr, comparisons, movements, executionTimeMs, steps };
}

/**
 * QUICK SORT (Ordenação Rápida por Particionamento de Lomuto com Pivô Mediana/Central)
 * Complexidade: Caso médio O(n log n), Pior caso O(n²). Espaço: O(log n) na pilha de recursão. Estável: Não (nativamente).
 */
export function quickSort(
  records: VotingRecord[],
  criterion: SortCriterion,
  recordSteps = false
): SortResult {
  const start = performance.now();
  const arr = records.map((r) => ({ ...r }));
  let comparisons = 0;
  let movements = 0;
  const steps: SortStep[] = [];

  if (recordSteps) {
    steps.push({
      arraySnapshot: arr.map((r) => ({ ...r })),
      comparedIndices: null,
      swappedIndices: null,
      description: 'Estado inicial antes do Quick Sort.',
    });
  }

  const swap = (i: number, j: number) => {
    if (i === j) return;
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    movements += 3;
    if (recordSteps && steps.length < 180) {
      steps.push({
        arraySnapshot: arr.map((r) => ({ ...r })),
        comparedIndices: null,
        swappedIndices: [i, j],
        description: `Particionamento trocou índices ${i} (${arr[i].id_registro}) e ${j} (${arr[j].id_registro}).`,
      });
    }
  };

  const partition = (low: number, high: number): number => {
    // Escolhe pivô central e move para o fim para evitar pior caso em listas já ordenadas
    const mid = Math.floor((low + high) / 2);
    swap(mid, high);
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      if (compareRecords(arr[j], pivot, criterion) <= 0) {
        i++;
        swap(i, j);
      }
    }
    swap(i + 1, high);
    return i + 1;
  };

  const sortRange = (low: number, high: number) => {
    if (low >= high) return; // Caso-base da recursão
    const pivotIndex = partition(low, high);
    sortRange(low, pivotIndex - 1);
    sortRange(pivotIndex + 1, high);
  };

  if (arr.length > 1) {
    sortRange(0, arr.length - 1);
  }

  const executionTimeMs = performance.now() - start;
  return { algorithm: 'quick', criterion, sorted: arr, comparisons, movements, executionTimeMs, steps };
}

export function runSortingAlgorithm(
  algorithm: SortAlgorithmName,
  records: VotingRecord[],
  criterion: SortCriterion,
  recordSteps = false
): SortResult {
  if (algorithm === 'bubble') return bubbleSort(records, criterion, recordSteps);
  if (algorithm === 'merge') return mergeSort(records, criterion, recordSteps);
  return quickSort(records, criterion, recordSteps);
}
