import sys
from flow import offline_flow, online_flow

def run_rag_demo():
    """
    Run a demonstration of the RAG system.
    
    This function:
    1. Indexes a set of sample documents (offline flow)
    2. Takes a query from the command line
    3. Retrieves the most relevant document (online flow)
    """

    # Sample texts - corpus of documents to search
    texts = [
        "The quick brown fox jumps over the lazy dog.",
        "Machine learning is a subset of artificial intelligence.",
        "Python is a popular programming language for data science.",
        "PocketFlow is a 100-line Large Language Model Framework.",
        "The weather is sunny and warm today.",
    ]
    
    print("=" * 50)
    print("PocketFlow RAG Document Retrieval")
    print("=" * 50)
    
    # Default query
    default_query = "Large Language Model"
    
    # Get query from command line if provided with --
    query = default_query
    for arg in sys.argv[1:]:
        if arg.startswith("--"):
            query = arg[2:]
            break
    
    # Single shared store for both flows
    shared = {
        "texts": texts,
        "embeddings": None,
        "index": None,
        "query": query,
        "query_embedding": None,
        "retrieved_document": None
    }
    
    # Initialize and run the offline flow (document indexing)
    offline_flow.run(shared)
    
    # Run the online flow to retrieve the most relevant document
    online_flow.run(shared)


if __name__ == "__main__":
    run_rag_demo()