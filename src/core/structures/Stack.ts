/**
 * ESTRUTURA DE DADOS: Pilha (LIFO - Last In, First Out)
 * REFERÊNCIA NO PROGRAMA:
 *  - Fase 2 (A Central de Triagem): Armazenamento temporário de evidências e histórico para "Desfazer" (Undo).
 *  - Fase 3 e 5 (Busca em Grafos): Estrutura de fronteira na DFS iterativa.
 *
 * Implementação própria modular sem dependência de bibliotecas externas.
 */

export class Stack<T> {
  private items: T[] = [];

  /**
   * Insere um elemento no topo da pilha.
   * Complexidade: O(1) amortizado.
   */
  push(element: T): void {
    this.items.push(element);
  }

  /**
   * Remove e retorna o elemento do topo da pilha.
   * Trata pilha vazia de forma segura retornando undefined (sem lançar exceção inesperada).
   * Complexidade: O(1).
   */
  pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items.pop();
  }

  /**
   * Consulta o elemento no topo sem removê-lo.
   * Complexidade: O(1).
   */
  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.items.length - 1];
  }

  /**
   * Verifica se a pilha está vazia.
   * Complexidade: O(1).
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Retorna a quantidade atual de elementos na pilha.
   * Complexidade: O(1).
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Limpa todos os elementos da pilha.
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Retorna uma cópia rasa dos elementos (base -> topo) para exibição na interface visual.
   */
  toArray(): T[] {
    return [...this.items];
  }
}
