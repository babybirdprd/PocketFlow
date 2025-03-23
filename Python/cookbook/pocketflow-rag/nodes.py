from pocketflow import Node, Flow, BatchNode
import numpy as np
import faiss
from utils import get_embedding, get_openai_embedding

# Nodes for the offline flow
class EmbedDocumentsNode(BatchNode):
    def prep(self, shared):
        """Read texts from shared store and return as an iterable"""
        return shared["texts"]
    
    def exec(self, text):
        """Embed a single text"""
        return get_embedding(text)
    
    def post(self, shared, prep_res, exec_res_list):
        """Store embeddings in the shared store"""
        embeddings = np.array(exec_res_list, dtype=np.float32)
        shared["embeddings"] = embeddings
        print(f"✅ Created {len(embeddings)} document embeddings")
        return "default"

class CreateIndexNode(Node):
    def prep(self, shared):
        """Get embeddings from shared store"""
        return shared["embeddings"]
    
    def exec(self, embeddings):
        """Create FAISS index and add embeddings"""
        print("🔍 Creating search index...")
        dimension = embeddings.shape[1]
        
        # Create a flat L2 index
        index = faiss.IndexFlatL2(dimension)
        
        # Add the embeddings to the index
        index.add(embeddings)
        
        return index
    
    def post(self, shared, prep_res, exec_res):
        """Store the index in shared store"""
        shared["index"] = exec_res
        print(f"✅ Index created with {exec_res.ntotal} vectors")
        return "default"

# Nodes for the online flow
class EmbedQueryNode(Node):
    def prep(self, shared):
        """Get query from shared store"""
        return shared["query"]
    
    def exec(self, query):
        """Embed the query"""
        print(f"🔍 Embedding query: {query}")
        query_embedding = get_embedding(query)
        return np.array([query_embedding], dtype=np.float32)
    
    def post(self, shared, prep_res, exec_res):
        """Store query embedding in shared store"""
        shared["query_embedding"] = exec_res
        return "default"

class RetrieveDocumentNode(Node):
    def prep(self, shared):
        """Get query embedding, index, and texts from shared store"""
        return shared["query_embedding"], shared["index"], shared["texts"]
    
    def exec(self, inputs):
        """Search the index for similar documents"""
        print("🔎 Searching for relevant documents...")
        query_embedding, index, texts = inputs
        
        # Search for the most similar document
        distances, indices = index.search(query_embedding, k=1)
        
        # Get the index of the most similar document
        best_idx = indices[0][0]
        distance = distances[0][0]
        
        # Get the corresponding text
        most_relevant_text = texts[best_idx]
        
        return {
            "text": most_relevant_text,
            "index": best_idx,
            "distance": distance
        }
    
    def post(self, shared, prep_res, exec_res):
        """Store retrieved document in shared store"""
        shared["retrieved_document"] = exec_res
        print(f"📄 Retrieved document (index: {exec_res['index']}, distance: {exec_res['distance']:.4f})")
        print(f"📄 Most relevant text: \"{exec_res['text']}\"")
        return "default"