/**
 * MÓDULO: Exportação do Relatório Técnico Completo em PDF (Seção 16.1 do EP)
 * REFERÊNCIA NO PROGRAMA: Botão "Exportar Relatório PDF" e página de Relatório Técnico.
 *
 * Gera um documento PDF estruturado contendo todas as 10 seções obrigatórias:
 *  1. Resumo e Objetivo | 2. História, Fases e Regras | 3. Modelagem | 4. Arquitetura
 *  5. Estruturas de Dados | 6. Algoritmos | 7. Resultados dos Testes Automatizados
 *  8. Complexidade e Métricas Empíricas | 9. Tabela Obrigatória de Uso de IAG | 10. Conclusão
 */

import { jsPDF } from 'jspdf';
import { DEFAULT_IAG_LOGS } from '../data/scenarios';
import { runSearchBenchmarks, runSortingBenchmarks } from '../benchmarks/benchmark';
import { runAllAutomatedTests } from '../tests/runTests';
import { AVLTree } from '../structures/AVLTree';
import { BenchmarkEntry, IAGLogEntry, TestCaseResult } from '../types';

export interface ReportExportOptions {
  seed: number;
  completedPhases: number[];
  iagLogs?: IAGLogEntry[];
  testResults?: TestCaseResult[];
  sortingBenchmarks?: BenchmarkEntry[];
}

export function generateTechnicalReportPDF(options: ReportExportOptions): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 20;

  const testResults = options.testResults ?? runAllAutomatedTests();
  const sortBench = options.sortingBenchmarks ?? runSortingBenchmarks(options.seed);
  const searchBench = runSearchBenchmarks();
  const iagLogs = options.iagLogs ?? DEFAULT_IAG_LOGS;

  // Demonstração AVL para evidência técnica (Seção 8.3)
  const demoAvl = new AVLTree<string>();
  const demoKeys = ['D|P:[]', 'B|P:[]', 'A|P:[]', 'C|P:[SEQ]', 'E|P:[AUT]', 'F|P:[SEQ]'];
  demoKeys.forEach((k) => demoAvl.insert(k, k));
  const hitSearch = demoAvl.search('C|P:[SEQ]');
  const missSearch = demoAvl.search('Z|P:[INEXISTENTE]');

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
  };

  const addHeader = (title: string) => {
    ensureSpace(14);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(3, 105, 161);
    doc.text(title, margin, y);
    y += 2;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setTextColor(15, 23, 42);
  };

  const addParagraph = (text: string, fontSize = 9.5) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxLineWidth);
    for (const line of lines) {
      ensureSpace(6);
      doc.text(line, margin, y);
      y += 4.8;
    }
    y += 2;
  };

  const addBullet = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(`• ${text}`, maxLineWidth - 4);
    for (const line of lines) {
      ensureSpace(5.5);
      doc.text(line, margin + 2, y);
      y += 4.6;
    }
  };

  // CAPA / CABEÇALHO DO RELATÓRIO
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Relatório Técnico — Urna Lógica: O Enigma da Eleição de Verídia', margin, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('IPT · Mestrado Profissional em Computação Aplicada · Estruturas de Dados e Análise de Algoritmos', margin, 22);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')} · Seed reproduzível: ${options.seed} · Selos conquistados: ${options.completedPhases.length}/5`,
    margin,
    28
  );
  doc.setTextColor(15, 23, 42);
  y = 44;

  // 1. RESUMO DO JOGO E OBJETIVO
  addHeader('1. Resumo do Jogo e Objetivo');
  addParagraph(
    'O sistema "Urna Lógica: O Enigma da Eleição de Verídia" é um jogo educativo e ferramenta de auditoria lógica desenvolvido para integrar estruturas de dados lineares (vetores, pilhas, filas e listas duplamente ligadas), não lineares (grafos e árvores AVL) e algoritmos de ordenação e busca em grafos (Bubble Sort, Merge Sort, Quick Sort, BFS e DFS recursiva).'
  );

  // 2. HISTÓRIA, FASES, REGRAS E CONDIÇÕES DE VITÓRIA
  addHeader('2. História, Fases, Regras e Condições de Vitória');
  addParagraph(
    'Ambientado no ano fictício de 2042 na cidade imaginária de Verídia (sem qualquer vínculo com partidos, candidatos ou eleições reais), o jogador assume o papel de Analista de Integridade de Dados da Comissão Independente de Verificação (CIV) após uma falha de sincronização embaralhar registros e bloquear rotas entre locais de votação.'
  );
  addBullet('Fase 1 (O Arquivo Embaralhado): Ordenar registros por chave composta (zona -> seção -> horário) sem perda ou duplicação.');
  addBullet('Fase 2 (A Central de Triagem): Processar Fila (FIFO) E1..E6 com apoio de Pilha (LIFO) de reserva/Desfazer para montar a Lista Duplamente Ligada na trilha E2 -> E4 -> E1 -> E6.');
  addBullet('Fase 3 (O Mapa das Seções): Percorrer o grafo de 8 vértices e 11 conexões respeitando portas bloqueadas e coletando a pista de autenticação antes do Centro de Validação.');
  addBullet('Fase 4 (O Cofre dos Estados): Indexar estados canônicos em uma Árvore AVL evitando loops e provando distinção entre estados na mesma posição com pistas distintas.');
  addBullet('Fase 5 (A Auditoria Final): Integrar todo o fluxo, executar o Solver automático (BFS/DFS) compartilhando exatamente as mesmas regras do modo manual, ordenar o log final e comparar estratégias.');

  // 3. MODELAGEM DOS DADOS, DO GRAFO E DOS ESTADOS
  addHeader('3. Modelagem dos Dados, do Grafo e dos Estados');
  addParagraph(
    'Cada registro possui id_registro (único), zona, secao, opcao, timestamp, status e hash_verificacao. O mapa é modelado por Lista de Adjacência (espaço O(V + E), ideal para grafos esparsos). Cada estado é modelado formalmente pela tupla Estado = (currentVertex, collectedClues, unlockedDoors, energyRemaining, costAccumulated), gerando uma chave canônica determinística ordenada.'
  );

  // 4. ARQUITETURA DO SOFTWARE E DIVISÃO DOS MÓDULOS
  addHeader('4. Arquitetura do Software e Divisão dos Módulos');
  addParagraph(
    'A aplicação separa rigorosamente núcleo algorítmico e camada visual: src/core/structures/ (Stack, Queue, DoublyLinkedList, AuditGraph, AVLTree), src/core/algorithms/ (sorting.ts e search.ts), src/core/engine/gameRules.ts (regras unificadas), src/core/tests/runTests.ts (testes), src/core/benchmarks/benchmark.ts e src/components/ (visualizadores interativos).'
  );

  // 5. IMPLEMENTAÇÃO DAS ESTRUTURAS DE DADOS
  addHeader('5. Implementação das Estruturas de Dados');
  addBullet('Pilha (LIFO): O(1) para push, pop e peek, utilizada no mecanismo Desfazer da Fase 2 e DFS iterativa.');
  addBullet('Fila (FIFO): O(1) amortizado usando ponteiro headIndex (evita custo O(n) de shift), usada na triagem e BFS.');
  addBullet('Lista Duplamente Ligada: Escolhida por possuir ponteiros head/tail e prev/next, viabilizando remoção O(1) no fim ao desfazer ações e percurso bidirecional.');
  addBullet('Árvore AVL: Mantém |altura(esq) - altura(dir)| <= 1 com rotações simples (LL, RR) e duplas (LR, RL), garantindo busca e inserção em O(log n).');
  addParagraph(
    `Evidência técnica AVL (Seção 8.3): Ao inserir a sequência [${demoKeys.join(', ')}], a árvore executou ${demoAvl.rotationCount} rotação(ões), atingiu altura ${demoAvl.treeHeight()} com invariante válida (${demoAvl.isValidAVL()}). Busca existente ('C|P:[SEQ]') = ${hitSearch.found} (${hitSearch.comparisons} comp.); busca inexistente ('Z|P:[INEXISTENTE]') = ${missSearch.found} (${missSearch.comparisons} comp.).`
  );

  // 6. IMPLEMENTAÇÃO E COMPARAÇÃO DOS ALGORITMOS
  addHeader('6. Implementação e Comparação dos Algoritmos');
  addParagraph(
    'Bubble Sort (O(n²), estável, O(1) espaço) realiza trocas adjacentes; Merge Sort (O(n log n) em todos os casos, estável, O(n) espaço) garante ordem relativa em empates; Quick Sort (O(n log n) médio, O(log n) pilha, pivô central) minimiza memória auxiliar. Na busca em grafos, a BFS garante o menor número de arestas em transições não-ponderadas (não necessariamente menor custo em energia ponderada!), enquanto a DFS Recursiva define caso-base, chamada recursiva e backtracking explícitos.'
  );

  // 7. ESTRATÉGIA E RESULTADOS DOS TESTES AUTOMATIZADOS
  addHeader('7. Estratégia e Resultados dos Testes Automatizados');
  const passedCount = testResults.filter((t) => t.passed).length;
  addParagraph(`Execução ao vivo da suíte completa (Seção 15): ${passedCount}/${testResults.length} casos aprovados.`);
  for (const t of testResults) {
    addBullet(`[${t.passed ? 'OK' : 'FALHA'}] ${t.id} (${t.module}): ${t.name} — ${t.details} (${t.durationMs}ms)`);
  }

  // 8. ANÁLISE DE COMPLEXIDADE E DESEMPENHO EMPÍRICO
  addHeader('8. Análise de Complexidade e Desempenho Empírico');
  addParagraph('Tabela comparativa de ordenação (chave composta zona -> seção -> horário):');
  for (const row of sortBench) {
    addBullet(
      `n=${row.size}: Bubble (${row.bubbleComparisons} comp, ${row.bubbleMovements} mov, ${row.bubbleMs}ms) | Merge (${row.mergeComparisons} comp, ${row.mergeMovements} mov, ${row.mergeMs}ms) | Quick (${row.quickComparisons} comp, ${row.quickMovements} mov, ${row.quickMs}ms)`
    );
  }
  addParagraph('Comparação BFS vs DFS nos dois cenários de Verídia (indexados via AVL):');
  for (const sc of searchBench) {
    addBullet(
      `${sc.scenarioTitle} (${sc.verticesCount} vértices, ${sc.edgesCount} arestas): BFS explorou ${sc.bfs.statesExplored} estados, fronteira máx=${sc.bfs.maxFrontierSize}, caminho=${sc.bfs.path.join('->')} (custo ${sc.bfs.totalCost}, AVL h=${sc.bfs.avlHeight}, podas=${sc.bfs.duplicatesAvoided}) | DFS explorou ${sc.dfs.statesExplored} estados, prof. máx=${sc.dfs.maxFrontierSize}, caminho=${sc.dfs.path.join('->')} (custo ${sc.dfs.totalCost}, podas=${sc.dfs.duplicatesAvoided}).`
    );
  }

  // 9. USO DE IAG E CURADORIA HUMANA (SEÇÃO 14.4)
  addHeader('9. Registro Obrigatório de Uso de IAG e Curadoria Humana');
  for (const [idx, log] of iagLogs.entries()) {
    addBullet(
      `Interação ${idx + 1} (${log.toolAndDate}) — Objetivo: ${log.promptGoal} | Aproveitado: ${log.excerptUsed} | Alterações humanas: ${log.humanModifications} | Validação: ${log.validationMethod}`
    );
  }

  // 10. DIFICULDADES, LIMITAÇÕES, MELHORIAS E CONCLUSÃO
  addHeader('10. Dificuldades, Limitações, Melhorias e Conclusão');
  addParagraph(
    'Principal desafio técnico: evitar que estados na mesma posição geográfica fossem tratados como idênticos quando possuíam pistas distintas, resolvido pela chave canônica na AVL. Limitação observada: o espaço de estados cresce exponencialmente O(V · 2^P) com o número de pistas P, tornando importante podar duplicatas e considerar buscas heurísticas (A*) para mapas muito grandes. Conclusão: todos os requisitos funcionais (RF01–RF12) e não funcionais foram atendidos com código modular, validado e demonstrável.'
  );

  doc.save('Relatorio_Tecnico_Urna_Logica.pdf');
}
