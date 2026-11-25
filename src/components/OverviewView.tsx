import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  Lock,
  Play,
} from 'lucide-react';
import { PhaseId } from '../core/types';

interface OverviewViewProps {
  completedPhases: PhaseId[];
  seed: number;
  onStartPhase: (phase: PhaseId) => void;
  onNavigateTab: (tab: 'overview' | 'phases' | 'tests' | 'complexity' | 'report') => void;
  onExportPDF: () => void;
}

const PHASE_CARDS: Array<{
  id: PhaseId;
  name: string;
  structures: string;
  challenge: string;
  kidSummary: string;
}> = [
  {
    id: 1,
    name: '01. O Arquivo Embaralhado',
    structures: 'Vetores · Bubble, Merge e Quick Sort',
    challenge: 'Organize registros fora de ordem por Zona, Seção e Horário sem perder dados.',
    kidSummary: 'Coloque as fichas de votação em fila perfeita usando três robôs organizadores.',
  },
  {
    id: 2,
    name: '02. A Central de Triagem',
    structures: 'Fila (FIFO) · Pilha (LIFO) · Lista Duplamente Ligada',
    challenge: 'Monte a trilha de custódia E2 → E4 → E1 → E6 respeitando entrada e reserva.',
    kidSummary: 'Use uma fila de lanche, uma pilha de pratos para desfazer e um trem de vagões!',
  },
  {
    id: 3,
    name: '03. O Mapa das Seções',
    structures: 'Grafo (Lista de Adjacência) · BFS · DFS',
    challenge: 'Percorra o mapa de 8 locais, libere portas com pistas e chegue ao Centro de Validação.',
    kidSummary: 'Encontre o caminho certo no mapa pegando a chave certa antes da porta final.',
  },
  {
    id: 4,
    name: '04. O Cofre dos Estados',
    structures: 'Árvore AVL · Rotações LL, RR, LR, RL · Chave Canônica',
    challenge: 'Impeça loops infinitos diferenciando estados no mesmo local com pistas diferentes.',
    kidSummary: 'Construa um fichário mágico que se equilibra sozinho para nunca repetir lugares.',
  },
  {
    id: 5,
    name: '05. A Auditoria Final',
    structures: 'Integração · Solver · Árvore de Busca · Ordenação',
    challenge: 'Execute o Solver automático, compare BFS vs DFS em 2 cenários e abra o Cofre.',
    kidSummary: 'Junte todas as peças e gere o certificado em PDF da eleição fictícia de Verídia.',
  },
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  completedPhases,
  seed,
  onStartPhase,
  onNavigateTab,
  onExportPDF,
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Educacional */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>IPT · Mestrado Profissional em Computação Aplicada</span>
              <span aria-hidden="true">·</span>
              <span>Ano fictício 2042</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Seed {seed}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-balance">
              Urna Lógica: O Enigma da Eleição de Verídia
            </h1>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl">
              Uma falha de sincronização embaralhou registros e interrompeu conexões entre locais de
              auditoria. Assuma o papel de Analista de Integridade, conquiste os 5 selos resolvendo
              desafios passo a passo e compare estratégias com o Solver automático.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartPhase(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              <span>Jogar Agora (Fase 1)</span>
            </button>

            <button
              onClick={() => onStartPhase(5)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              <Bot className="w-4 h-4" />
              <span>Executar Solver (Fase 5)</span>
            </button>

            <button
              onClick={onExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              <FileDown className="w-4 h-4 text-sky-700" />
              <span>Exportar Relatório PDF</span>
            </button>
          </div>
        </div>

        {/* Painel de Progresso dos 5 Selos e Menu de Navegação Rápida */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Cofre de Verificação ({completedPhases.length}/5 Selos)
              </h2>
              <span className="text-xs font-mono font-semibold text-sky-700">
                {Math.round((completedPhases.length / 5) * 100)}% concluído
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedPhases.length / 5) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              {PHASE_CARDS.map((p) => {
                const done = completedPhases.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => onStartPhase(p.id)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-sky-300 text-left transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-800">{p.name}</span>
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selo OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Lock className="w-3.5 h-3.5" /> Pendente
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => onNavigateTab('tests')}
              className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 inline-flex items-center justify-center gap-1.5"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Testes (10/10)</span>
            </button>
            <button
              onClick={() => onNavigateTab('complexity')}
              className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 inline-flex items-center justify-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-700" />
              <span>Complexidade</span>
            </button>
          </div>
        </div>
      </section>

      {/* Mapa das 5 Fases + Explicação Didática */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Jornada Modular das 5 Fases</h2>
            <p className="text-xs text-slate-600">
              Cada fase inclui gráficos interativos, explicação passo a passo simples e botão para inspecionar o código-fonte comentado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PHASE_CARDS.map((card) => {
            const done = completedPhases.includes(card.id);
            return (
              <article
                key={card.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-sky-300 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{card.structures}</span>
                    {done && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{card.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.challenge}</p>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 text-xs text-slate-700">
                    <strong className="text-slate-900">Como funciona:</strong> {card.kidSummary}
                  </div>
                </div>

                <button
                  onClick={() => onStartPhase(card.id)}
                  className="mt-4 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Abrir Fase {card.id}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </article>
            );
          })}

          {/* Card de Instruções / Regras Gerais */}
          <article className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-sky-300">
                <BookOpen className="w-4 h-4" />
                <span>Instruções e Regras Gerais</span>
              </div>
              <h3 className="text-base font-bold">Apartidário, Reproduzível e Modular</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <li>• 100% fictício: Verídia (2042) sem nomes ou partidos reais.</li>
                <li>• Reprodutível por semente (seed) fixa em geração e embaralhamento.</li>
                <li>• Reinício independente por fase e Desfazer com Pilha LIFO.</li>
                <li>• Modo Manual e Solver usam exatamente as mesmas funções de regra.</li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateTab('report')}
              className="mt-4 w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Ver Relatório & Log IAG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </article>
        </div>
      </section>
    </div>
  );
};
