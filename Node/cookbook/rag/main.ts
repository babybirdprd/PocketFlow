// src/cookbook/rag/main.ts
import { offlineFlow, onlineFlow } from './flow';

/**
 * Run a demonstration of the RAG system.
 * 
 * This function:
 * 1. Indexes a set of sample documents (offline flow)
 * 2. Takes a query from the command line
 * 3. Retrieves the most relevant document (online flow)
 */
async function runRagDemo() {
  // Sample texts - corpus of documents to search
  const texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Machine learning is a subset of artificial intelligence.",
    "TypeScript is a popular programming language for web development.",
    "PocketFlowJS is a TypeScript Large Language Model Framework.",
    "The weather is sunny and warm today.",
  ];
  
  console.log("=".repeat(50));
  console.log("PocketFlowJS RAG Document Retrieval");
  console.log("=".repeat(50));
  
  // Default query
  let defaultQuery = "Large Language Model";
  
  // Get query from command line if provided
  let query = defaultQuery;
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith("--")) {
      query = arg.substring(2);
      break;
    }
  }
  
  // Single shared store for both flows
  const shared = {
    "texts": texts,
    "embeddings": null,
    "index": null,
    "query": query,
    "query_embedding": null,
    "retrieved_document": null
  };
  
  // Initialize and run the offline flow (document indexing)
  await offlineFlow.run(shared);
  
  // Run the online flow to retrieve the most relevant document
  await onlineFlow.run(shared);
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runRagDemo().catch(error => {
    console.error("Error running RAG demo:", error);
  });
}

export { runRagDemo };
