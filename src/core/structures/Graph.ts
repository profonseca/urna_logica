/**
 * ESTRUTURA DE DADOS: Grafo por Lista de Adjacência
 * REFERÊNCIA NO PROGRAMA:
 *  - Fase 3 (O Mapa das Seções): Mapa de locais fictícios de votação com bifurcações, portas e custos.
 *  - Fase 5 (A Auditoria Final): Cenários expandidos para comparação entre BFS e DFS.
 *
 * JUSTIFICATIVA DA REPRESENTAÇÃO (Lista de Adjacência vs Matriz de Adjacência):
 *  O mapa de auditoria é um grafo esparso (E ≈ 1.4*V a 2*V, ex: 8 vértices e 11 arestas).
 *  A Lista de Adjacência consome espaço O(V + E), enquanto a Matriz consumiria O(V²).
 *  Além disso, iterar sobre os vizinhos de um vértice `u` leva tempo O(deg(u)) na lista,
 *  acelerando a geração de sucessores na BFS e DFS.
 */

import { GraphEdge, GraphVertex } from '../types';

export class AuditGraph {
  private vertices = new Map<string, GraphVertex>();
  private adjacencyList = new Map<string, GraphEdge[]>();

  /**
   * Adiciona um vértice ao grafo.
   * Complexidade: O(1).
   */
  addVertex(vertex: GraphVertex): void {
    if (!this.vertices.has(vertex.id)) {
      this.vertices.set(vertex.id, vertex);
      this.adjacencyList.set(vertex.id, []);
    }
  }

  /**
   * Adiciona uma conexão (aresta) entre dois vértices, evitando arestas duplicadas idênticas.
   * Se `bidirectional` for verdadeiro, adiciona também a volta automaticamente.
   * Complexidade: O(deg(u) + deg(v)).
   */
  addEdge(edge: GraphEdge): boolean {
    if (!this.vertices.has(edge.from) || !this.vertices.has(edge.to)) {
      return false;
    }

    const addSingle = (fromId: string, toId: string, edgeObj: GraphEdge) => {
      const list = this.adjacencyList.get(fromId)!;
      const alreadyExists = list.some((e) => e.to === toId);
      if (!alreadyExists) {
        list.push({ ...edgeObj, from: fromId, to: toId });
      }
    };

    addSingle(edge.from, edge.to, edge);
    if (edge.bidirectional && edge.from !== edge.to) {
      addSingle(edge.to, edge.from, edge);
    }
    return true;
  }

  /**
   * Retorna os vizinhos diretos de um vértice (geração de vizinhos para BFS/DFS).
   * Complexidade: O(1) para acesso à lista.
   */
  getNeighbors(vertexId: string): GraphEdge[] {
    return this.adjacencyList.get(vertexId) ?? [];
  }

  getVertex(vertexId: string): GraphVertex | undefined {
    return this.vertices.get(vertexId);
  }

  getAllVertices(): GraphVertex[] {
    return Array.from(this.vertices.values());
  }

  /**
   * Retorna lista única de arestas para renderização visual no mapa SVG.
   */
  getUniqueEdges(): GraphEdge[] {
    const seen = new Set<string>();
    const result: GraphEdge[] = [];
    for (const [fromId, edges] of this.adjacencyList.entries()) {
      for (const edge of edges) {
        const pairKey = edge.bidirectional
          ? [fromId, edge.to].sort().join('--')
          : `${fromId}->${edge.to}`;
        if (!seen.has(pairKey)) {
          seen.add(pairKey);
          result.push(edge);
        }
      }
    }
    return result;
  }

  vertexCount(): number {
    return this.vertices.size;
  }
}
