/**
 * ESTRUTURA DE DADOS: Fila (FIFO - First In, First Out)
 * REFERÊNCIA NO PROGRAMA:
 *  - Fase 2 (A Central de Triagem): Fila de entrada de solicitações/evidências aguardando conferência.
 *  - Fase 3 e 5 (Busca em Grafos): Estrutura de fronteira na BFS (Busca em Largura).
 *
 * Implementa ponteiro de cabeça (`headIndex`) para evitar O(n) no dequeue com shift contínuo.
 */

export class Queue<T> {
  private items: T[] = [];
  private headIndex = 0;

  /**
   * Insere um elemento no final da fila.
   * Complexidade: O(1) amortizado.
   */
  enqueue(element: T): void {
    this.items.push(element);
  }

  /**
   * Remove e retorna o primeiro elemento da fila (quem chegou primeiro sai primeiro).
   * Trata fila vazia com segurança retornando undefined.
   * Complexidade: O(1) amortizado (com compactação periódica).
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const element = this.items[this.headIndex];
    this.headIndex++;

    // Compacta o vetor interno quando mais da metade já foi desenfileirada
    if (this.headIndex > 32 && this.headIndex * 2 >= this.items.length) {
      this.items = this.items.slice(this.headIndex);
      this.headIndex = 0;
    }
    return element;
  }

  /**
   * Consulta o primeiro elemento da fila sem removê-lo.
   * Complexidade: O(1).
   */
  front(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.headIndex];
  }

  /**
   * Verifica se a fila está vazia.
   * Complexidade: O(1).
   */
  isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Retorna o número atual de elementos na fila.
   * Complexidade: O(1).
   */
  size(): number {
    return this.items.length - this.headIndex;
  }

  /**
   * Limpa a fila.
   */
  clear(): void {
    this.items = [];
    this.headIndex = 0;
  }

  /**
   * Retorna uma cópia ordenada (frente -> fim) para visualização na camada gráfica.
   */
  toArray(): T[] {
    return this.items.slice(this.headIndex);
  }
}
