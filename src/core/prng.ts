/**
 * MÓDULO: Gerador Pseudoaleatório Reproduzível (Seeded PRNG) e Dados Fictícios
 * REFERÊNCIA NO PROGRAMA: Fase 1 (O Arquivo Embaralhado) e Testes de Reprodutibilidade (RF03).
 *
 * Implementa o algoritmo Mulberry32 para garantir que uma mesma `seed` produza
 * exatamente os mesmos registros e o mesmo embaralhamento (Fisher-Yates).
 */

import { RecordStatus, VotingRecord } from './types';

/**
 * Gerador pseudoaleatório determinístico Mulberry32.
 * Complexidade de tempo por chamada: O(1).
 */
export function createSeededPRNG(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Embaralha um vetor de registros usando Fisher-Yates sem mutar o vetor original.
 * Complexidade: Tempo O(n), Espaço O(n).
 */
export function shuffleRecordsWithSeed(records: VotingRecord[], seed: number): VotingRecord[] {
  const rand = createSeededPRNG(seed);
  const copy = records.map((r) => ({ ...r }));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Gera um lote reproduzível de registros fictícios de votação de Verídia (2042).
 * Garante propositalmente empates de horário entre zonas diferentes para testar chave composta.
 */
export function generateFictitiousRecords(count: number, seed: number): VotingRecord[] {
  if (count <= 0) return [];
  const rand = createSeededPRNG(seed);
  const zonas = ['01', '02', '03', '04'];
  const secoes = ['005', '012', '014', '021', '033'];
  const opcoes = ['OP-10', 'OP-24', 'OP-37', 'OP-42'];
  const statuses: RecordStatus[] = ['PENDENTE', 'CONFERIDO', 'DIVERGENTE'];
  const fixedTimestamps = [
    '18:10:05',
    '18:24:30',
    '18:42:10',
    '18:42:10', // Empate proposital de horário para exigir chave composta (zona -> seção -> timestamp)
    '18:55:19',
    '19:03:44',
    '19:15:02',
    '19:28:51',
  ];

  const records: VotingRecord[] = [];
  for (let i = 0; i < count; i++) {
    const idNum = 80 + i;
    const zona = zonas[Math.floor(rand() * zonas.length)];
    const secao = secoes[Math.floor(rand() * secoes.length)];
    const opcao = opcoes[Math.floor(rand() * opcoes.length)];
    const timestamp = fixedTimestamps[Math.floor(rand() * fixedTimestamps.length)];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const id_registro = `VR-${String(idNum).padStart(4, '0')}`;
    const hash_verificacao = `${zona}${secao}-${idNum.toString(16).toUpperCase()}`;

    records.push({
      id_registro,
      zona,
      secao,
      opcao,
      timestamp,
      status,
      hash_verificacao,
    });
  }

  return records;
}

/**
 * Valida a integridade de um lote de registros: verifica se não há IDs duplicados.
 * Caso encontre duplicatas, rejeita com mensagem explicativa (requisito Seção 15).
 */
export function validateRecordBatch(records: VotingRecord[]): { valid: boolean; error?: string } {
  const seen = new Set<string>();
  for (const rec of records) {
    if (!rec.id_registro || rec.id_registro.trim() === '') {
      return { valid: false, error: 'Registro sem identificador único válido.' };
    }
    if (seen.has(rec.id_registro)) {
      return {
        valid: false,
        error: `Identificador duplicado detectado: ${rec.id_registro}. Lote rejeitado por segurança.`,
      };
    }
    seen.add(rec.id_registro);
  }
  return { valid: true };
}
