import os
import numpy as np
from openai import OpenAI

def get_embedding(text):
    """
    A simple embedding function that converts text to vector.
    
    In a real application, you would use a proper embedding model like OpenAI,
    Hugging Face, or other embedding services. For this example, we'll use a 
    simple approach based on character frequencies for demonstration purposes.
    """
    # Create a simple embedding (128-dimensional) based on character frequencies
    # This is just for demonstration - not a real embedding algorithm!
    embedding = np.zeros(128, dtype=np.float32)
    
    # Generate a deterministic but distributed embedding based on character frequency
    for i, char in enumerate(text):
        # Use modulo to distribute values across the embedding dimensions
        pos = ord(char) % 128
        embedding[pos] += 1.0
    
    # Normalize the embedding
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    
    return embedding

def get_openai_embedding(text):
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "YOUR_API_KEY"))
    
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    
    # Extract the embedding vector from the response
    embedding = response.data[0].embedding
    
    # Convert to numpy array for consistency with other embedding functions
    return np.array(embedding, dtype=np.float32)


if __name__ == "__main__":
    # Test the embedding function
    text1 = "The quick brown fox jumps over the lazy dog."
    text2 = "Python is a popular programming language for data science."
    
    emb1 = get_embedding(text1)
    emb2 = get_embedding(text2)
    
    print(f"Embedding 1 shape: {emb1.shape}")
    print(f"Embedding 2 shape: {emb2.shape}")
    
    # Calculate similarity (dot product)
    similarity = np.dot(emb1, emb2)
    print(f"Similarity between texts: {similarity:.4f}")
    
    # Compare with a different text
    text3 = "Machine learning is a subset of artificial intelligence."
    emb3 = get_embedding(text3)
    similarity13 = np.dot(emb1, emb3)
    similarity23 = np.dot(emb2, emb3)
    
    print(f"Similarity between text1 and text3: {similarity13:.4f}")
    print(f"Similarity between text2 and text3: {similarity23:.4f}")
    
    # These simple comparisons should show higher similarity 
    # between related concepts (text2 and text3) than between
    # unrelated texts (text1 and text3)
    
    # Uncomment to test OpenAI embeddings (requires API key)
    print("\nTesting OpenAI embeddings (requires API key):")
    oai_emb1 = get_openai_embedding(text1)
    oai_emb2 = get_openai_embedding(text2)
    print(f"OpenAI Embedding 1 shape: {oai_emb1.shape}")
    oai_similarity = np.dot(oai_emb1, oai_emb2)
    print(f"OpenAI similarity between texts: {oai_similarity:.4f}")