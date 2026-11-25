import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  bubbleSort,
  mergeSort,
  quickSort,
  runSortingAlgorithm,
  verifyAuditOrder,
} from '../core/algorithms/sorting';
import { generateFictitiousRecords, shuffleRecordsWithSeed } from '../core/prng';
import { SortAlgorithmName, SortCriterion, SortResult, VotingRecord } from '../core/types';
import { PhaseHeaderBanner } from './PhaseHeaderBanner';

interface Phase1SortingProps {
  seed: number;
  onSeedChange: (newSeed: number) => void;
  isCompleted: boolean;
  onComplete: () => void;
  onOpenCode: () => void;
}

export const Phase1Sorting: React.FC<Phase1SortingProps> = ({
  seed,
  onSeedChange,
  isCompleted,
  onComplete,
  onOpenCode,
}) => {
  const [batchSize, setBatchSize] = useState<number>(10);
  const [criterion, setCriterion] = useState<SortCriterion>('timestamp');
  const [algorithm, setAlgorithm] = useState<SortAlgorithmName>('merge');

  const initialRecords = useMemo(() => {
    const base = generateFictitiousRecords(batchSize, seed);
    return shuffleRecordsWithSeed(base, seed + 17);
  }, [batchSize, seed]);

  const [lastResult, setLastResult] = useState<SortResult | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Reinicia visualização quando seed ou tamanho mudam
  useEffect(() => {
    setLastResult(null);
    setStepIndex(0);
    setIsPlaying(false);
  }, [seed, batchSize]);

  // Controle automático da animação passo a passo
  useEffect(() => {
    if (!isPlaying || !lastResult) return;
    if (stepIndex >= lastResult.steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setStepIndex((prev) => prev + 1);
    }, 180);
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, lastResult]);

  // Comparação simultânea dos 3 algoritmos no mesmo vetor embaralhado para o gráfico
  const comparisonAllThree = useMemo(() => {
    const b = bubbleSort(initialRecords, criterion, false);
    const m = mergeSort(initialRecords, criterion, false);
    const q = quickSort(initialRecords, criterion, false);
    return [
      { name: 'Bubble Sort', comparisons: b.comparisons, movements: b.movements, ms: b.executionTimeMs },
      { name: 'Merge Sort', comparisons: m.comparisons, movements: m.movements, ms: m.executionTimeMs },
      { name: 'Quick Sort', comparisons: q.comparisons, movements: q.movements, ms: q.executionTimeMs },
    ];
  }, [initialRecords, criterion]);

  const handleRunSort = () => {
    const res = runSortingAlgorithm(algorithm, initialRecords, criterion, true);
    setLastResult(res);
    setStepIndex(0);
    setIsPlaying(true);

    // Verifica contra a regra oficial da auditoria (chave composta: zona -> secao -> horario)
    const auditCheck = verifyAuditOrder(initialRecords, res.sorted, 'composta');
    if (auditCheck.valid) {
      onComplete();
    }
  };

  const handleRestart = () => {
    setLastResult(null);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const currentStep = lastResult?.steps[stepIndex] ?? null;
  const displayedRecords: VotingRecord[] = currentStep ? currentStep.arraySnapshot : initialRecords;

  // Sempre avalia a lista final contra a regra estrita da auditoria ('composta')
  const auditVerification = useMemo(() => {
    if (!lastResult) return null;
    return verifyAuditOrder(initialRecords, lastResult.sorted, 'composta');
  }, [lastResult, initialRecords]);

  // Calcula valor visual normalizado para altura das barras do gráfico
  const getBarHeightPercent = (rec: VotingRecord) => {
    const z = parseInt(rec.zona, 10) || 1;
    const s = parseInt(rec.secao, 10) || 1;
    const score = z * 35 + s;
    return Math.min(96, Math.max(18, Math.round((score / 180) * 100)));
  };

  const maxMetric = Math.max(
    1,
    ...comparisonAllThree.map((c) => Math.max(c.comparisons, c.movements))
  );

  return (
    <div>
      <PhaseHeaderBanner
        phaseNumber={1}
        title="Fase 1 — O Arquivo Embaralhado"
        openingMessage="Alerta: o arquivo de registros chegou fora de ordem e a sequência original foi perdida. Antes de investigar, organize os registros por Zona, depois por Seção e, em caso de empate, por Horário — sem perder nenhum dado."
        kidGuideSteps={[
          'Imagine caixinhas bagunçadas no chão. Cada caixinha tem Zona, Seção e Relógio.',
          'Se você organizar só pelo Relógio, caixinhas de Zonas diferentes ficam misturadas! Precisamos de uma regra em cascata (Chave Composta).',
          'Escolha o algoritmo (Bubble, Merge ou Quick Sort) e clique em Executar para ver as barras se organizarem passo a passo.',
        ]}
        isCompleted={isCompleted}
        onRestart={handleRestart}
        onOpenCode={onOpenCode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ZONA ESQUERDA (65%): Gráfico Animado do Vetor + Tabela de Registros */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Visualizador Dinâmico do Vetor de Registros
                </h2>
                <p className="text-xs text-slate-500">
                  {currentStep
                    ? `Passo ${stepIndex + 1} de ${lastResult!.steps.length}: ${currentStep.description}`
                    : 'Vetor embaralhado aguardando execução do algoritmo de ordenação.'}
                </p>
              </div>

              {lastResult && lastResult.steps.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIndex((p) => Math.max(0, p - 1));
                    }}
                    disabled={stepIndex === 0}
                    className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    title="Passo anterior"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIndex((p) => Math.min(lastResult.steps.length - 1, p + 1));
                    }}
                    disabled={stepIndex >= lastResult.steps.length - 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    title="Próximo passo"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIndex(lastResult.steps.length - 1);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50 rounded-lg"
                  >
                    Ir ao Final
                  </button>
                </div>
              )}
            </div>

            {/* Gráfico de Barras Interativo */}
            <div className="h-52 bg-slate-50 border border-slate-200/80 rounded-lg p-4 flex items-end gap-2 overflow-x-auto">
              {displayedRecords.map((rec, idx) => {
                const isCompared =
                  currentStep?.comparedIndices?.[0] === idx ||
                  currentStep?.comparedIndices?.[1] === idx;
                const isSwapped =
                  currentStep?.swappedIndices?.[0] === idx ||
                  currentStep?.swappedIndices?.[1] === idx;
                const isErrorPoint =
                  auditVerification &&
                  !auditVerification.valid &&
                  stepIndex === (lastResult?.steps.length ?? 1) - 1 &&
                  auditVerification.firstErrorIndex === idx;

                let barColor = 'bg-sky-600';
                if (isErrorPoint) barColor = 'bg-red-600';
                else if (isSwapped) barColor = 'bg-emerald-600';
                else if (isCompared) barColor = 'bg-amber-500';

                return (
                  <div
                    key={rec.id_registro}
                    className="flex-1 min-w-[44px] h-full flex flex-col justify-end items-center gap-1"
                  >
                    <span className="text-[10px] font-mono tabular-nums text-slate-500">
                      Z{rec.zona}·S{rec.secao}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-transform duration-150 ${barColor}`}
                      style={{ height: `${getBarHeightPercent(rec)}%` }}
                      title={`${rec.id_registro} | Zona ${rec.zona} | Seção ${rec.secao} | ${rec.timestamp}`}
                    />
                    <span className="text-[10px] font-mono text-slate-700 truncate max-w-full">
                      {rec.id_registro.replace('VR-', '')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-sky-600 inline-block" /> Registro em repouso
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> Em comparação
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" /> Movimentado / Trocado
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-red-600 inline-block" /> Primeiro erro detectado
              </span>
            </div>
          </div>

          {/* Feedback de Verificação da Auditoria */}
          {auditVerification && (
            <div
              className={`rounded-xl border p-4 flex items-start gap-3 ${
                auditVerification.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {auditVerification.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <p className="font-semibold text-sm mb-0.5">
                  {auditVerification.valid
                    ? 'Selo 1 Desbloqueado — Lote Aprovado pela Auditoria!'
                    : 'Atenção: Lote Recusado pela Regra Composta da Auditoria'}
                </p>
                <p>{auditVerification.message}</p>
                {!auditVerification.valid && (
                  <p className="mt-1 font-medium text-amber-900">
                    Dica do enigma: mude o critério para &ldquo;Chave Composta (Zona → Seção → Horário)&rdquo; e execute novamente.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tabela de Registros */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Registros Atuais ({displayedRecords.length} itens)
              </h3>
              <span className="text-xs text-slate-500 font-mono">Seed ativa: {seed}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">#</th>
                    <th className="py-2.5 px-4 font-semibold">ID</th>
                    <th className="py-2.5 px-4 font-semibold">Zona</th>
                    <th className="py-2.5 px-4 font-semibold">Seção</th>
                    <th className="py-2.5 px-4 font-semibold">Opção</th>
                    <th className="py-2.5 px-4 font-semibold">Horário</th>
                    <th className="py-2.5 px-4 font-semibold">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {displayedRecords.map((rec, idx) => {
                    const isErr =
                      auditVerification &&
                      !auditVerification.valid &&
                      auditVerification.firstErrorIndex === idx;
                    return (
                      <tr key={rec.id_registro} className={isErr ? 'bg-red-50' : 'hover:bg-slate-50/70'}>
                        <td className="py-2 px-4 text-slate-400">{idx}</td>
                        <td className="py-2 px-4 font-semibold text-slate-900">{rec.id_registro}</td>
                        <td className="py-2 px-4 text-slate-700">{rec.zona}</td>
                        <td className="py-2 px-4 text-slate-700">{rec.secao}</td>
                        <td className="py-2 px-4 text-slate-600">{rec.opcao}</td>
                        <td className="py-2 px-4 text-slate-700">{rec.timestamp}</td>
                        <td className="py-2 px-4 font-sans text-slate-600">{rec.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ZONA DIREITA (35%): Controles de Parâmetros + Comparativo Gráfico */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Painel de Controle da Ordenação</h2>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Semente Reproduzível (Seed)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => onSeedChange(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={() => onSeedChange(seed + 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                  title="Gerar novo embaralhamento"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Nova Seed
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tamanho do Lote: <span className="font-mono font-semibold">{batchSize}</span> registros
              </label>
              <input
                type="range"
                min={6}
                max={20}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full accent-sky-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Critério de Comparação
              </label>
              <select
                value={criterion}
                onChange={(e) => setCriterion(e.target.value as SortCriterion)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="timestamp">Apenas Horário (falha no enigma!)</option>
                <option value="zona">Apenas Zona (desempate ausente)</option>
                <option value="secao">Apenas Seção</option>
                <option value="composta">Chave Composta: Zona → Seção → Horário</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Algoritmo de Ordenação
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                {(['bubble', 'merge', 'quick'] as SortAlgorithmName[]).map((alg) => (
                  <button
                    key={alg}
                    onClick={() => setAlgorithm(alg)}
                    className={`py-2 text-xs font-medium rounded-md capitalize transition-colors ${
                      algorithm === alg
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {alg === 'bubble' ? 'Bubble' : alg === 'merge' ? 'Merge' : 'Quick'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunSort}
              className="w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Executar Ordenação</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {lastResult && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[11px] text-slate-500">Comparações</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {lastResult.comparisons}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[11px] text-slate-500">Movimentos</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {lastResult.movements}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-[11px] text-slate-500">Tempo</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {lastResult.executionTimeMs.toFixed(2)}ms
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico Comparativo dos 3 Algoritmos */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Comparativo ao Vivo (n = {batchSize})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Compara Bubble, Merge e Quick Sort no mesmo vetor embaralhado.
            </p>
            <div className="space-y-4">
              {comparisonAllThree.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {item.comparisons} comp · {item.movements} mov
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-2 rounded-full"
                        style={{ width: `${Math.max(4, (item.comparisons / maxMetric) * 100)}%` }}
                      />
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${Math.max(4, (item.movements / maxMetric) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-sky-600 rounded-xs inline-block" /> Comparações
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs inline-block" /> Movimentações
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
