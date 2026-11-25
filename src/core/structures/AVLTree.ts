/**
 * ESTRUTURA DE DADOS: Árvore Binária de Busca Balanceada (AVL)
 * REFERÊNCIA NO PROGRAMA:
 *  - Fase 4 (O Cofre dos Estados): Indexação e controle de estados já visitados sem repetição.
 *  - Fases 3 e 5 (Solver BFS/DFS): Consulta e inserção em O(log N) para evitar expansão redundante de estados.
 *
 * COMPLEXIDADE:
 *  Por manter a invariante |altura(esq) - altura(dir)| <= 1 em todos os nós,
 *  a altura h da árvore com n chaves satisfaz h <= 1.44 * log2(n + 2).
 *  Logo, busca, inserção e rotações têm complexidade garantida O(log n) no pior caso.
 */

import { AVLNodeSnapshot, AVLRotationEvent } from '../types';

export class AVLNode<T = unknown> {
  key: string;
  value: T;
  height = 1;
  left: AVLNode<T> | null = null;
  right: AVLNode<T> | null = null;

  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
  }
}

export class AVLTree<T = unknown> {
  private root: AVLNode<T> | null = null;
  private nodeCount = 0;
  public rotationCount = 0;
  public rotationEvents: AVLRotationEvent[] = [];

  /**
   * Retorna a altura de um nó (0 se nulo).
   */
  getHeight(node: AVLNode<T> | null): number {
    return node ? node.height : 0;
  }

  /**
   * Calcula o fator de balanceamento: altura(esquerda) - altura(direita).
   * Valores válidos na AVL: -1, 0 ou +1.
   */
  getBalanceFactor(node: AVLNode<T> | null): number {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  private updateHeight(node: AVLNode<T>): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  /**
   * Captura um retrato imutável da subárvore para visualização gráfica (antes/depois da rotação).
   */
  public createSnapshot(node: AVLNode<T> | null = this.root): AVLNodeSnapshot | null {
    if (!node) return null;
    return {
      key: node.key,
      height: node.height,
      balanceFactor: this.getBalanceFactor(node),
      left: this.createSnapshot(node.left),
      right: this.createSnapshot(node.right),
    };
  }

  /**
   * Rotação Simples à Direita (Caso LL - Left-Left).
   */
  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);
    this.rotationCount++;
    return x;
  }

  /**
   * Rotação Simples à Esquerda (Caso RR - Right-Right).
   */
  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);
    this.rotationCount++;
    return y;
  }

  /**
   * Busca uma chave canônica na árvore AVL.
   * Complexidade: O(log n).
   */
  search(key: string): { found: boolean; value?: T; comparisons: number; visitedPath: string[] } {
    let current = this.root;
    let comparisons = 0;
    const visitedPath: string[] = [];

    while (current) {
      comparisons++;
      visitedPath.push(current.key);
      if (key === current.key) {
        return { found: true, value: current.value, comparisons, visitedPath };
      } else if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return { found: false, comparisons, visitedPath };
  }

  /**
   * Insere uma chave única na AVL. Se a chave já existir, não duplica e retorna `inserted: false`.
   * Complexidade: O(log n).
   */
  insert(key: string, value: T): { inserted: boolean; rotated: boolean } {
    let inserted = false;
    let rotated = false;

    const insertRecursive = (node: AVLNode<T> | null): AVLNode<T> => {
      if (!node) {
        inserted = true;
        this.nodeCount++;
        return new AVLNode(key, value);
      }

      if (key < node.key) {
        node.left = insertRecursive(node.left);
      } else if (key > node.key) {
        node.right = insertRecursive(node.right);
      } else {
        // Chave idêntica já existe: impede duplicação de estado!
        return node;
      }

      this.updateHeight(node);
      const balance = this.getBalanceFactor(node);

      // Caso 1: Desequilíbrio Esquerda-Esquerda (LL) -> Rotação Simples à Direita
      if (balance > 1 && key < node.left!.key) {
        rotated = true;
        const before = this.createSnapshot(node);
        const newRoot = this.rotateRight(node);
        const after = this.createSnapshot(newRoot);
        this.rotationEvents.push({
          type: 'LL (Simples à Direita)',
          pivotKey: node.key,
          insertedKey: key,
          beforeSnapshot: before,
          afterSnapshot: after,
        });
        return newRoot;
      }

      // Caso 2: Desequilíbrio Direita-Direita (RR) -> Rotação Simples à Esquerda
      if (balance < -1 && key > node.right!.key) {
        rotated = true;
        const before = this.createSnapshot(node);
        const newRoot = this.rotateLeft(node);
        const after = this.createSnapshot(newRoot);
        this.rotationEvents.push({
          type: 'RR (Simples à Esquerda)',
          pivotKey: node.key,
          insertedKey: key,
          beforeSnapshot: before,
          afterSnapshot: after,
        });
        return newRoot;
      }

      // Caso 3: Desequilíbrio Esquerda-Direita (LR) -> Rotação Dupla (Esquerda no filho + Direita no pivô)
      if (balance > 1 && key > node.left!.key) {
        rotated = true;
        const before = this.createSnapshot(node);
        node.left = this.rotateLeft(node.left!);
        const newRoot = this.rotateRight(node);
        const after = this.createSnapshot(newRoot);
        this.rotationEvents.push({
          type: 'LR (Dupla Esquerda-Direita)',
          pivotKey: node.key,
          insertedKey: key,
          beforeSnapshot: before,
          afterSnapshot: after,
        });
        return newRoot;
      }

      // Caso 4: Desequilíbrio Direita-Esquerda (RL) -> Rotação Dupla (Direita no filho + Esquerda no pivô)
      if (balance < -1 && key < node.right!.key) {
        rotated = true;
        const before = this.createSnapshot(node);
        node.right = this.rotateRight(node.right!);
        const newRoot = this.rotateLeft(node);
        const after = this.createSnapshot(newRoot);
        this.rotationEvents.push({
          type: 'RL (Dupla Direita-Esquerda)',
          pivotKey: node.key,
          insertedKey: key,
          beforeSnapshot: before,
          afterSnapshot: after,
        });
        return newRoot;
      }

      return node;
    };

    this.root = insertRecursive(this.root);
    return { inserted, rotated };
  }

  /**
   * Percurso Em-Ordem (In-Order): retorna as chaves ordenadas lexicograficamente.
   */
  inOrder(): Array<{ key: string; height: number; balanceFactor: number }> {
    const out: Array<{ key: string; height: number; balanceFactor: number }> = [];
    const walk = (node: AVLNode<T> | null) => {
      if (!node) return;
      walk(node.left);
      out.push({
        key: node.key,
        height: node.height,
        balanceFactor: this.getBalanceFactor(node),
      });
      walk(node.right);
    };
    walk(this.root);
    return out;
  }

  /**
   * Verifica se toda a árvore satisfaz a propriedade AVL (|BF| <= 1) e propriedade de BST.
   */
  isValidAVL(): boolean {
    const check = (node: AVLNode<T> | null, min: string | null, max: string | null): boolean => {
      if (!node) return true;
      if (min !== null && node.key <= min) return false;
      if (max !== null && node.key >= max) return false;
      const bf = this.getBalanceFactor(node);
      if (Math.abs(bf) > 1) return false;
      return check(node.left, min, node.key) && check(node.right, node.key, max);
    };
    return check(this.root, null, null);
  }

  size(): number {
    return this.nodeCount;
  }

  treeHeight(): number {
    return this.getHeight(this.root);
  }
}
