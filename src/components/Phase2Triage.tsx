import React, { useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Play,
  Trash2,
  Undo2,
} from 'lucide-react';
import { PHASE2_INITIAL_EVIDENCES } from '../core/data/scenarios';
import {
  canInsertIntoCustodyList,
  canMoveQueueToStack,
  isCustodyListComplete,
  TARGET_CUSTODY_SEQUENCE,
} from '../core/engine/gameRules';
import { DoublyLinkedList } from '../core/structures/LinkedList';
import { Queue } from '../core/structures/Queue';
import { Stack } from '../core/structures/Stack';
import { EvidenceItem } from '../core/types';
import { PhaseHeaderBanner } from './PhaseHeaderBanner';

interface UndoRecord {
  actionLabel: string;
  queueSnapshot: EvidenceItem[];
  stackSnapshot: EvidenceItem[];
  listSnapshot: EvidenceItem[];
  archivedSnapshot: EvidenceItem[];
}

interface Phase2TriageProps {
  isCompleted: boolean;
  onComplete: () => void;
  onOpenCode: () => void;
}

export const Phase2Triage: React.FC<Phase2TriageProps> = ({
  isCompleted,
  onComplete,
  onOpenCode,
}) => {
  const createInitialState = () => {
    const q = new Queue<EvidenceItem>();
    PHASE2_INITIAL_EVIDENCES.forEach((ev) => q.enqueue(ev));
    return {
      queue: q,
      stack: new Stack<EvidenceItem>(),
      list: new DoublyLinkedList<EvidenceItem>(),
      undoStack: new Stack<UndoRecord>(),
      archived: [] as EvidenceItem[],
    };
  };

  const [structures, setStructures] = useState(createInitialState);
  const [, setTick] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'info' | 'error' | 'success'; message: string }>({
    type: 'info',
    message: 'Consulte a frente da Fila (FIFO) e monte a Lista de Custódia na ordem E2 → E4 → E1 → E6.',
  });

  const refresh = () => setTick((t) => t + 1);

  const pushUndoSnapshot = (label: string) => {
    structures.undoStack.push({
      actionLabel: label,
      queueSnapshot: structures.queue.toArray(),
      stackSnapshot: structures.stack.toArray(),
      listSnapshot: structures.list.traverse(),
      archivedSnapshot: [...structures.archived],
    });
  };

  const handleRestart = () => {
    setStructures(createInitialState());
    setFeedback({
      type: 'info',
      message: 'Fase reiniciada. Todas as 6 evidências retornaram para a Fila de entrada.',
    });
    refresh();
  };

  const handleQueueToStack = () => {
    const check = canMoveQueueToStack(structures.queue, structures.stack);
    if (!check.allowed) {
      setFeedback({ type: 'error', message: check.reason });
      return;
    }
    pushUndoSnapshot('Fila → Pilha');
    const item = structures.queue.dequeue()!;
    structures.stack.push(item);
    setFeedback({
      type: 'info',
      message: `Evidência ${item.id} movida da Fila para o topo da Pilha (LIFO).`,
    });
    refresh();
  };

  const handleQueueToList = () => {
    const candidate = structures.queue.front();
    const check = canInsertIntoCustodyList(candidate, structures.list);
    if (!check.allowed) {
      setFeedback({ type: 'error', message: check.reason });
      return;
    }
    pushUndoSnapshot('Fila → Lista');
    const item = structures.queue.dequeue()!;
    structures.list.insertAtEnd(item);
    const done = isCustodyListComplete(structures.list);
    if (done) {
      onComplete();
      setFeedback({
        type: 'success',
        message: 'Selo 2 Desbloqueado! Trilha de custódia E2 → E4 → E1 → E6 montada com sucesso.',
      });
    } else {
      setFeedback({ type: 'info', message: check.reason });
    }
    refresh();
  };

  const handleStackToList = () => {
    const candidate = structures.stack.peek();
    const check = canInsertIntoCustodyList(candidate, structures.list);
    if (!check.allowed) {
      setFeedback({ type: 'error', message: check.reason });
      return;
    }
    pushUndoSnapshot('Pilha → Lista');
    const item = structures.stack.pop()!;
    structures.list.insertAtEnd(item);
    const done = isCustodyListComplete(structures.list);
    if (done) {
      onComplete();
      setFeedback({
        type: 'success',
        message: 'Selo 2 Desbloqueado! Trilha de custódia E2 → E4 → E1 → E6 montada com sucesso.',
      });
    } else {
      setFeedback({ type: 'info', message: check.reason });
    }
    refresh();
  };

  const handleArchiveQueueFront = () => {
    const front = structures.queue.front();
    if (!front) {
      setFeedback({ type: 'error', message: 'A Fila está vazia. Nada para arquivar.' });
      return;
    }
    if (TARGET_CUSTODY_SEQUENCE.includes(front.id)) {
      setFeedback({
        type: 'error',
        message: `Recusado: ${front.id} é um elo obrigatório da custódia! Reserve na Pilha em vez de descartar.`,
      });
      return;
    }
    pushUndoSnapshot(`Arquivar ${front.id}`);
    const removed = structures.queue.dequeue()!;
    structures.archived.push(removed);
    setFeedback({
      type: 'info',
      message: `Log auxiliar ${removed.id} (${removed.label}) arquivado fora da trilha principal.`,
    });
    refresh();
  };

  const handleRemoveLastFromList = () => {
    if (structures.list.isEmpty()) {
      setFeedback({
        type: 'error',
        message: 'Operação segura: a Lista Duplamente Ligada já está vazia.',
      });
      return;
    }
    pushUndoSnapshot('Remover último da Lista');
    const removed = structures.list.removeLast()!;
    structures.stack.push(removed);
    setFeedback({
      type: 'info',
      message: `Último nó ${removed.id} removido da Lista (via ponteiro tail) e devolvido à Pilha.`,
    });
    refresh();
  };

  const handleUndo = () => {
    if (structures.undoStack.isEmpty()) {
      setFeedback({
        type: 'error',
        message: 'Histórico vazio: nenhuma ação anterior para desfazer na Pilha.',
      });
      return;
    }
    const prev = structures.undoStack.pop()!;
    structures.queue.clear();
    prev.queueSnapshot.forEach((i) => structures.queue.enqueue(i));

    structures.stack.clear();
    prev.stackSnapshot.forEach((i) => structures.stack.push(i));

    structures.list.clear();
    prev.listSnapshot.forEach((i) => structures.list.insertAtEnd(i));

    structures.archived = [...prev.archivedSnapshot];

    setFeedback({
      type: 'info',
      message: `Ação desfeita via Pilha LIFO: "${prev.actionLabel}".`,
    });
    refresh();
  };

  // Demonstração guiada automática
  const handleAutoSolveDemo = () => {
    const fresh = createInitialState();
    // Passo 1: E1 -> Pilha
    fresh.stack.push(fresh.queue.dequeue()!);
    // Passo 2: E2 -> Lista
    fresh.list.insertAtEnd(fresh.queue.dequeue()!);
    // Passo 3: E3 -> Arquivado
    fresh.archived.push(fresh.queue.dequeue()!);
    // Passo 4: E4 -> Lista
    fresh.list.insertAtEnd(fresh.queue.dequeue()!);
    // Passo 5: E1 (da Pilha) -> Lista
    fresh.list.insertAtEnd(fresh.stack.pop()!);
    // Passo 6: E5 -> Arquivado
    fresh.archived.push(fresh.queue.dequeue()!);
    // Passo 7: E6 -> Lista
    fresh.list.insertAtEnd(fresh.queue.dequeue()!);

    fresh.undoStack.push({
      actionLabel: 'Simulação Guiada',
      queueSnapshot: PHASE2_INITIAL_EVIDENCES,
      stackSnapshot: [],
      listSnapshot: [],
      archivedSnapshot: [],
    });

    setStructures(fresh);
    onComplete();
    setFeedback({
      type: 'success',
      message: 'Sequência concluída! Observe como E1 foi reservado na Pilha, E3/E5 arquivados e E2→E4→E1→E6 encadeados.',
    });
    refresh();
  };

  const queueItems = structures.queue.toArray();
  const stackItems = structures.stack.toArray();
  const listItems = structures.list.traverse();

  return (
    <div>
      <PhaseHeaderBanner
        phaseNumber={2}
        title="Fase 2 — A Central de Triagem"
        openingMessage="Os registros foram organizados. Agora precisamos movimentar as evidências sem quebrar a sequência de processamento: receba itens pela Fila (FIFO), use a Pilha (LIFO) como reserva/desfazer e monte a Lista Duplamente Ligada na trilha E2 → E4 → E1 → E6."
        kidGuideSteps={[
          'A Fila (FIFO) só deixa você pegar quem está na frente (E1 primeiro, depois E2...).',
          'Como queremos E2 antes de E1, guarde E1 na Pilha (LIFO), coloque E2 na Lista e arquive os logs extras (E3 e E5) para não entupir a Pilha!',
          'Cada vagão da Lista Ligada tem duas setas (anterior e próximo), permitindo conferir nos dois sentidos e desfazer erros.',
        ]}
        isCompleted={isCompleted}
        onRestart={handleRestart}
        onOpenCode={onOpenCode}
      />

      {/* Feedback Banner */}
      <div
        className={`mb-6 rounded-xl border p-4 flex items-start gap-3 ${
          feedback.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-900'
            : feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-sky-50/80 border-sky-200 text-sky-950'
        }`}
      >
        {feedback.type === 'error' ? (
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              feedback.type === 'success' ? 'text-emerald-700' : 'text-sky-700'
            }`}
          />
        )}
        <div className="text-xs leading-relaxed">
          <span className="font-semibold block text-sm mb-0.5">
            {feedback.type === 'error'
              ? 'Jogada Recusada pelo Validador'
              : feedback.type === 'success'
              ? 'Sequência de Custódia Validada'
              : 'Status da Central de Triagem'}
          </span>
          {feedback.message}
        </div>
      </div>

      {/* ZONA INTERATIVA PRINCIPAL: 3 ESTRUTURAS LINEARES VISUALIZADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* 1. FILA (FIFO) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  1. Fila de Entrada (FIFO — First In, First Out)
                </h2>
                <p className="text-xs text-slate-500">
                  Apenas o primeiro item à esquerda (Frente) pode ser consultado ou removido.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Tamanho: {structures.queue.size()}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 flex items-center gap-2 overflow-x-auto min-h-[84px]">
              {queueItems.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Fila vazia (Empty)</span>
              ) : (
                queueItems.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <div
                      className={`shrink-0 px-3 py-2 rounded-lg border text-xs ${
                        idx === 0
                          ? 'bg-sky-700 text-white border-sky-800 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="font-mono font-bold">
                        {item.id} {idx === 0 && '· FRENTE'}
                      </div>
                      <div className={`text-[11px] ${idx === 0 ? 'text-sky-100' : 'text-slate-500'}`}>
                        {item.label}
                      </div>
                    </div>
                    {idx < queueItems.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* 2. PILHA (LIFO) + ARQUIVO AUXILIAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    2. Pilha de Reserva (LIFO)
                  </h2>
                  <p className="text-xs text-slate-500">Último a entrar sai primeiro (máx. 4).</p>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Topo: {structures.stack.peek()?.id ?? 'Vazio'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 min-h-[140px] flex flex-col-reverse gap-2 justify-start">
                {stackItems.length === 0 ? (
                  <span className="text-xs text-slate-400 italic m-auto">Pilha vazia</span>
                ) : (
                  stackItems.map((item, idx) => {
                    const isTop = idx === stackItems.length - 1;
                    return (
                      <div
                        key={item.id}
                        className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between ${
                          isTop
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-mono">{item.id} · {item.label}</span>
                        {isTop && <span className="text-[10px] font-mono text-amber-800">TOPO</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Itens Auxiliares Arquivados
                  </h2>
                  <p className="text-xs text-slate-500">Logs técnicos fora da trilha principal.</p>
                </div>
                <Archive className="w-4 h-4 text-slate-400" />
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 min-h-[140px] space-y-2">
                {structures.archived.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum item auxiliar arquivado (E3 e E5 são auxiliares).
                  </p>
                ) : (
                  structures.archived.map((item) => (
                    <div
                      key={item.id}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 flex justify-between"
                    >
                      <span className="font-mono font-semibold">{item.id}</span>
                      <span>{item.label}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 3. LISTA DUPLAMENTE LIGADA */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  3. Lista Duplamente Ligada de Custódia (Meta: E2 → E4 → E1 → E6)
                </h2>
                <p className="text-xs text-slate-500">
                  Cada nó mantém ponteiros `prev` e `next`, permitindo inserção e remoção O(1) nas extremidades.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600">
                head: {structures.list.getFirst()?.id ?? 'null'} · tail: {structures.list.getLast()?.id ?? 'null'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 flex items-center gap-2 overflow-x-auto min-h-[96px]">
              {listItems.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Lista vazia (head = null, tail = null)
                </span>
              ) : (
                listItems.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <div className="shrink-0 bg-emerald-700 text-white px-3.5 py-2.5 rounded-lg border border-emerald-800 text-xs">
                      <div className="font-mono font-bold">
                        {item.id}
                        {idx === 0 ? ' [HEAD]' : ''}
                        {idx === listItems.length - 1 ? ' [TAIL]' : ''}
                      </div>
                      <div className="text-[11px] text-emerald-100">{item.label}</div>
                    </div>
                    {idx < listItems.length - 1 && (
                      <ArrowLeftRight className="w-4 h-4 text-emerald-700 shrink-0" />
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PAINEL DIREITO: AÇÕES DE TRIAGEM & PILHA DE DESFAZER */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Ações de Movimentação</h2>

            <button
              onClick={handleQueueToStack}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors"
            >
              <span>Mover Frente da Fila → Pilha</span>
              <ArrowDown className="w-4 h-4 text-amber-600" />
            </button>

            <button
              onClick={handleQueueToList}
              className="w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg flex items-center justify-between transition-colors"
            >
              <span>Inserir Frente da Fila → Lista Ligada</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleStackToList}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-between transition-colors"
            >
              <span>Inserir Topo da Pilha → Lista Ligada</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleArchiveQueueFront}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-between transition-colors"
            >
              <span>Arquivar Item Auxiliar (Fila)</span>
              <Archive className="w-4 h-4 text-slate-500" />
            </button>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={handleRemoveLastFromList}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg flex items-center justify-between transition-colors"
              >
                <span>Remover Último da Lista (tail)</span>
                <Trash2 className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                onClick={handleUndo}
                className="w-full py-2 px-3 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors"
              >
                <span>Desfazer Ação (Pilha: {structures.undoStack.size()})</span>
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleAutoSolveDemo}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Executar Demonstração Guiada</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-2">
              Por que Lista Duplamente Ligada?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diferente de uma lista simplesmente ligada, a lista duplamente ligada possui ponteiros{' '}
              <code className="font-mono text-sky-800">prev</code> e{' '}
              <code className="font-mono text-sky-800">tail</code>. Isso permite remover o último elo
              em tempo <strong className="text-slate-900">O(1)</strong> ao desfazer e percorrer a
              custódia nos dois sentidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
