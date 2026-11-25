/**
 * ESTRUTURA DE DADOS: Lista Duplamente Ligada (Doubly Linked List)
 * REFERÊNCIA NO PROGRAMA:
 *  - Fase 2 (A Central de Triagem): Trilha dinâmica de custódia de evidências (ex: E2 -> E4 -> E1 -> E6).
 *
 * JUSTIFICATIVA TÉCNICA DA ESCOLHA (Lista Duplamente Ligada vs Simplesmente Ligada):
 *  Escolhemos uma lista DUPLAMENTE ligada (com ponteiros `prev`, `next`, `head` e `tail`)
 *  porque a Central de Triagem exige:
 *   1. Inserção e remoção em O(1) tanto no início quanto no fim da trilha de custódia;
 *   2. Ao desfazer uma inserção no fim (via Pilha de Histórico), o ponteiro `prev` permite
 *      remover o último nó em O(1) sem percorrer toda a lista desde o início;
 *   3. Permite auditoria bidirecional (do início ao fim e do fim ao início).
 */

export class LinkedListNode<T> {
  value: T;
  next: LinkedListNode<T> | null = null;
  prev: LinkedListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class DoublyLinkedList<T> {
  private head: LinkedListNode<T> | null = null;
  private tail: LinkedListNode<T> | null = null;
  private length = 0;

  /**
   * Insere um elemento no início da lista.
   * Complexidade: O(1).
   */
  insertAtStart(value: T): void {
    const newNode = new LinkedListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.length++;
  }

  /**
   * Insere um elemento no final da lista.
   * Complexidade: O(1).
   */
  insertAtEnd(value: T): void {
    const newNode = new LinkedListNode(value);
    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
  }

  /**
   * Insere um elemento em uma posição específica (0-indexada).
   * Complexidade: O(n).
   */
  insertAt(index: number, value: T): boolean {
    if (index < 0 || index > this.length) return false;
    if (index === 0) {
      this.insertAtStart(value);
      return true;
    }
    if (index === this.length) {
      this.insertAtEnd(value);
      return true;
    }

    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }

    const newNode = new LinkedListNode(value);
    const prevNode = current!.prev!;
    prevNode.next = newNode;
    newNode.prev = prevNode;
    newNode.next = current;
    current!.prev = newNode;
    this.length++;
    return true;
  }

  /**
   * Remove e retorna o primeiro elemento da lista.
   * Complexidade: O(1).
   */
  removeFirst(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      if (this.head) this.head.prev = null;
    }
    this.length--;
    return value;
  }

  /**
   * Remove e retorna o último elemento da lista.
   * Complexidade: O(1) graças ao ponteiro `tail` e `prev`.
   */
  removeLast(): T | undefined {
    if (!this.tail) return undefined;
    const value = this.tail.value;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = this.tail.prev;
      if (this.tail) this.tail.next = null;
    }
    this.length--;
    return value;
  }

  /**
   * Remove o primeiro elemento que satisfaz o predicado fornecido.
   * Complexidade: O(n).
   */
  removeByPredicate(predicate: (item: T) => boolean): T | undefined {
    let current = this.head;
    while (current) {
      if (predicate(current.value)) {
        if (current === this.head) return this.removeFirst();
        if (current === this.tail) return this.removeLast();
        current.prev!.next = current.next;
        current.next!.prev = current.prev;
        this.length--;
        return current.value;
      }
      current = current.next;
    }
    return undefined;
  }

  /**
   * Busca um elemento na lista usando um predicado.
   * Complexidade: O(n).
   */
  find(predicate: (item: T) => boolean): T | undefined {
    let current = this.head;
    while (current) {
      if (predicate(current.value)) return current.value;
      current = current.next;
    }
    return undefined;
  }

  /**
   * Consulta o início da lista sem remover.
   */
  getFirst(): T | undefined {
    return this.head?.value;
  }

  /**
   * Consulta o fim da lista sem remover.
   */
  getLast(): T | undefined {
    return this.tail?.value;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  size(): number {
    return this.length;
  }

  /**
   * Percorre todos os nós do início ao fim retornando um vetor para inspeção visual.
   * Complexidade: O(n).
   */
  traverse(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
}
