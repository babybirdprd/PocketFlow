// src/cookbook/rag/nodes.ts
import { Node, BatchNode } from '../../pocketflow';
import { getEmbedding } from './utils';

// For TypeScript, we'll use a simple vector library instead of numpy and FAISS
// In a real application, you might want to use a proper vector database or library

/**
 * Simple vector operations to replace numpy and FAISS functionality
 */
class VectorOps {
  /**
   * Create a simple L2 index for vector search
   */
  static createIndex(vectors: number[][]): {
    vectors: number[][],
    search: (query: number[], k: number) => { distances: number[], indices: number[] }
  } {
    return {
      vectors,
      search: (query: number[], k: number) => {
        // Calculate L2 distances between query and all vectors
        const distances = vectors.map(vector => {
          let sum = 0;
          for (let i = 0; i < vector.length; i++) {
            const diff = vector[i] - query[i];
            sum += diff * diff;
          }
          return Math.sqrt(sum);
        });
        
        // Create array of indices
        const indices = Array.from({ length: vectors.length }, (_, i) => i);
        
        // Sort indices by distances
        indices.sort((a, b) => distances[a] - distances[b]);
        
        // Return top k results
        return {
          distances: indices.slice(0, k).map(i => distances[i]),
          indices: indices.slice(0, k)
        };
      }
    };
  }
}

// Nodes for the offline flow
export class EmbedDocumentsNode extends BatchNode {
  prep(shared: Record<string, any>): any {
    /**
     * Read texts from shared store and return as an iterable
     */
    return shared["texts"];
  }
  
  exec(text: string): number[] {
    /**
     * Embed a single text
     */
    return getEmbedding(text);
  }
  
  post(shared: Record<string, any>, prepRes: any, execResList: number[][]): string | null {
    /**
     * Store embeddings in the shared store
     */
    const embeddings = execResList;
    shared["embeddings"] = embeddings;
    console.log(`✅ Created ${embeddings.length} document embeddings`);
    return "default";
  }
}

export class CreateIndexNode extends Node {
  prep(shared: Record<string, any>): any {
    /**
     * Get embeddings from shared store
     */
    return shared["embeddings"];
  }
  
  exec(embeddings: number[][]): any {
    /**
     * Create vector index and add embeddings
     */
    console.log("🔍 Creating search index...");
    
    // Create a simple vector index
    const index = VectorOps.createIndex(embeddings);
    
    return index;
  }
  
  post(shared: Record<string, any>, prepRes: any, execRes: any): string | null {
    /**
     * Store the index in shared store
     */
    shared["index"] = execRes;
    console.log(`✅ Index created with ${execRes.vectors.length} vectors`);
    return "default";
  }
}

// Nodes for the online flow
export class EmbedQueryNode extends Node {
  prep(shared: Record<string, any>): any {
    /**
     * Get query from shared store
     */
    return shared["query"];
  }
  
  exec(query: string): number[] {
    /**
     * Embed the query
     */
    console.log(`🔍 Embedding query: ${query}`);
    const queryEmbedding = getEmbedding(query);
    return queryEmbedding;
  }
  
  post(shared: Record<string, any>, prepRes: any, execRes: number[]): string | null {
    /**
     * Store query embedding in shared store
     */
    shared["query_embedding"] = execRes;
    return "default";
  }
}

export class RetrieveDocumentNode extends Node {
  prep(shared: Record<string, any>): any {
    /**
     * Get query embedding, index, and texts from shared store
     */
    return [shared["query_embedding"], shared["index"], shared["texts"]];
  }
  
  exec(inputs: [number[], any, string[]]): any {
    /**
     * Search the index for similar documents
     */
    console.log("🔎 Searching for relevant documents...");
    const [queryEmbedding, index, texts] = inputs;
    
    // Search for the most similar document
    const { distances, indices } = index.search(queryEmbedding, 1);
    
    // Get the index of the most similar document
    const bestIdx = indices[0];
    const distance = distances[0];
    
    // Get the corresponding text
    const mostRelevantText = texts[bestIdx];
    
    return {
      text: mostRelevantText,
      index: bestIdx,
      distance: distance
    };
  }
  
  post(shared: Record<string, any>, prepRes: any, execRes: any): string | null {
    /**
     * Store retrieved document in shared store
     */
    shared["retrieved_document"] = execRes;
    console.log(`📄 Retrieved document (index: ${execRes.index}, distance: ${execRes.distance.toFixed(4)})`);
    console.log(`📄 Most relevant text: "${execRes.text}"`);
    return "default";
  }
}
