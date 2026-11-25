/**
 * MÓDULO: Aplicação Principal (Camada de Apresentação)
 * REFERÊNCIA NO PROGRAMA: Menu inicial, alternância entre as 5 fases, suíte de testes,
 * análises de complexidade, visualizador de código comentado e exportação em PDF.
 */

import { useState } from 'react';
import { CheckCircle2, FileDown } from 'lucide-react';
import { CodeInspectorModal } from './components/CodeInspectorModal';
import { ComplexityView } from './components/ComplexityView';
import { OverviewView } from './components/OverviewView';
import { Phase1Sorting } from './components/Phase1Sorting';
import { Phase2Triage } from './components/Phase2Triage';
import { Phase3Graph } from './components/Phase3Graph';
import { Phase4AVL } from './components/Phase4AVL';
import { Phase5FinalAudit } from './components/Phase5FinalAudit';
import { ReportView } from './components/ReportView';
import { TestsView } from './components/TestsView';
import { generateTechnicalReportPDF } from './core/report/pdfExport';
import { PHASE_CODE_SNIPPETS } from './core/sourceSnippets';
import { PhaseId } from './core/types';

type AppTab = 'overview' | 'phases' | 'tests' | 'complexity' | 'report';

const PHASE_TITLES: Record<PhaseId, string> = {
  1: 'Fase 1: O Arquivo Embaralhado',
  2: 'Fase 2: A Central de Triagem',
  3: 'Fase 3: O Mapa das Seções',
  4: 'Fase 4: O Cofre dos Estados',
  5: 'Fase 5: A Auditoria Final',
};

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [activePhase, setActivePhase] = useState<PhaseId>(1);
  const [completedPhases, setCompletedPhases] = useState<PhaseId[]>([]);
  const [seed, setSeed] = useState<number>(2042);
  const [codeModalPhase, setCodeModalPhase] = useState<PhaseId | null>(null);

  const markPhaseCompleted = (phase: PhaseId) => {
    setCompletedPhases((prev) => (prev.includes(phase) ? prev : [...prev, phase].sort()));
  };

  const handleStartPhase = (phase: PhaseId) => {
    setActivePhase(phase);
    setActiveTab('phases');
  };

  const handleExportPDF = () => {
    generateTechnicalReportPDF({
      seed,
      completedPhases,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 1 linha, exatamente 3 zonas separadas por gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zona 1: Brand Wordmark único */}
          <button
            onClick={() => setActiveTab('overview')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-700 transition-colors"
          >
            Urna Lógica
          </button>

          {/* Zona 2: 5 links de navegação concisos */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-sky-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => setActiveTab('phases')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'phases'
                  ? 'border-sky-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Fases ({completedPhases.length}/5)
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'tests'
                  ? 'border-sky-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Testes
            </button>
            <button
              onClick={() => setActiveTab('complexity')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'complexity'
                  ? 'border-sky-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Complexidade
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                activeTab === 'report'
                  ? 'border-sky-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Relatório
            </button>
          </nav>

          {/* Zona 3: 1 Ação Primária */}
          <div className="shrink-0">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Navegação mobile compacta */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-3 overflow-x-auto text-xs font-medium text-slate-600">
          {(
            [
              ['overview', 'Início'],
              ['phases', `Fases (${completedPhases.length}/5)`],
              ['tests', 'Testes'],
              ['complexity', 'Complexidade'],
              ['report', 'Relatório'],
            ] as Array<[AppTab, string]>
          ).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap shrink-0 px-2 py-1 rounded ${
                activeTab === tab ? 'bg-sky-50 text-sky-800 font-semibold' : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-7">
        {activeTab === 'overview' && (
          <OverviewView
            completedPhases={completedPhases}
            seed={seed}
            onStartPhase={handleStartPhase}
            onNavigateTab={setActiveTab}
            onExportPDF={handleExportPDF}
          />
        )}

        {activeTab === 'phases' && (
          <div className="space-y-6">
            {/* Seletor das 5 Fases */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit">
              {([1, 2, 3, 4, 5] as PhaseId[]).map((pid) => {
                const isDone = completedPhases.includes(pid);
                const isActive = activePhase === pid;
                return (
                  <button
                    key={pid}
                    onClick={() => setActivePhase(pid)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>
                      Fase {pid}
                      {pid === 1
                        ? ' · Ordenação'
                        : pid === 2
                        ? ' · Triagem'
                        : pid === 3
                        ? ' · Grafo'
                        : pid === 4
                        ? ' · AVL'
                        : ' · Auditoria'}
                    </span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {activePhase === 1 && (
              <Phase1Sorting
                seed={seed}
                onSeedChange={setSeed}
                isCompleted={completedPhases.includes(1)}
                onComplete={() => markPhaseCompleted(1)}
                onOpenCode={() => setCodeModalPhase(1)}
              />
            )}

            {activePhase === 2 && (
              <Phase2Triage
                isCompleted={completedPhases.includes(2)}
                onComplete={() => markPhaseCompleted(2)}
                onOpenCode={() => setCodeModalPhase(2)}
              />
            )}

            {activePhase === 3 && (
              <Phase3Graph
                isCompleted={completedPhases.includes(3)}
                onComplete={() => markPhaseCompleted(3)}
                onOpenCode={() => setCodeModalPhase(3)}
              />
            )}

            {activePhase === 4 && (
              <Phase4AVL
                isCompleted={completedPhases.includes(4)}
                onComplete={() => markPhaseCompleted(4)}
                onOpenCode={() => setCodeModalPhase(4)}
              />
            )}

            {activePhase === 5 && (
              <Phase5FinalAudit
                seed={seed}
                completedPhases={completedPhases}
                isCompleted={completedPhases.includes(5)}
                onComplete={() => markPhaseCompleted(5)}
                onOpenCode={() => setCodeModalPhase(5)}
                onExportPDF={handleExportPDF}
              />
            )}
          </div>
        )}

        {activeTab === 'tests' && <TestsView />}
        {activeTab === 'complexity' && <ComplexityView seed={seed} />}
        {activeTab === 'report' && (
          <ReportView
            seed={seed}
            completedPhases={completedPhases}
            onExportPDF={handleExportPDF}
          />
        )}
      </main>

      {/* Rodapé limpo */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Urna Lógica: O Enigma da Eleição de Verídia (Cenário Fictício 2042)</span>
          <span>IPT · Estruturas de Dados e Análise de Algoritmos</span>
        </div>
      </footer>

      {/* Modal de Inspeção de Código Comentado por Fase */}
      {codeModalPhase && (
        <CodeInspectorModal
          isOpen={true}
          onClose={() => setCodeModalPhase(null)}
          phaseTitle={PHASE_TITLES[codeModalPhase]}
          snippets={PHASE_CODE_SNIPPETS[codeModalPhase]}
        />
      )}
    </div>
  );
}

export default App;
