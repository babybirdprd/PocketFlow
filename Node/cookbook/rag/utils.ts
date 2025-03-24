// src/cookbook/rag/utils.ts
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * A simple embedding function that converts text to vector.
 * 
 * In a real application, you would use a proper embedding model like OpenAI,
 * Hugging Face, or other embedding services. For this example, we'll use a 
 * simple approach based on character frequencies for demonstration purposes.
 */
export function getEmbedding(text: string): number[] {
  // Create a simple embedding (128-dimensional) based on character frequencies
  // This is just for demonstration - not a real embedding algorithm!
  const embedding = new Array(128).fill(0);
  
  // Generate a deterministic but distributed embedding based on character frequency
  for (let i = 0; i < text.length; i++) {
    // Use modulo to distribute values across the embedding dimensions
    const pos = text.charCodeAt(i) % 128;
    embedding[pos] += 1.0;
  }
  
  // Normalize the embedding
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = embedding[i] / norm;
    }
  }
  
  return embedding;
}

/**
 * Get embeddings from OpenAI API
 */
export async function getOpenAIEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY || 'YOUR_API_KEY';
  
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      model: 'text-embedding-ada-002',
      input: text
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  // Extract the embedding vector from the response
  const embedding = response.data.data[0].embedding;
  
  return embedding;
}

// Test function
if (require.main === module) {
  (async () => {
    // Test the embedding function
    const text1 = "The quick brown fox jumps over the lazy dog.";
    const text2 = "TypeScript is a popular programming language for web development.";
    
    const emb1 = getEmbedding(text1);
    const emb2 = getEmbedding(text2);
    
    console.log(`Embedding 1 length: ${emb1.length}`);
    console.log(`Embedding 2 length: ${emb2.length}`);
    
    // Calculate similarity (dot product)
    const similarity = emb1.reduce((sum, val, i) => sum + val * emb2[i], 0);
    console.log(`Similarity between texts: ${similarity.toFixed(4)}`);
    
    // Compare with a different text
    const text3 = "Machine learning is a subset of artificial intelligence.";
    const emb3 = getEmbedding(text3);
    const similarity13 = emb1.reduce((sum, val, i) => sum + val * emb3[i], 0);
    const similarity23 = emb2.reduce((sum, val, i) => sum + val * emb3[i], 0);
    
    console.log(`Similarity between text1 and text3: ${similarity13.toFixed(4)}`);
    console.log(`Similarity between text2 and text3: ${similarity23.toFixed(4)}`);
    
    // These simple comparisons should show higher similarity 
    // between related concepts (text2 and text3) than between
    // unrelated texts (text1 and text3)
    
    // Uncomment to test OpenAI embeddings (requires API key)
    console.log("\nTesting OpenAI embeddings (requires API key):");
    try {
      const oaiEmb1 = await getOpenAIEmbedding(text1);
      const oaiEmb2 = await getOpenAIEmbedding(text2);
      console.log(`OpenAI Embedding 1 length: ${oaiEmb1.length}`);
      const oaiSimilarity = oaiEmb1.reduce((sum, val, i) => sum + val * oaiEmb2[i], 0);
      console.log(`OpenAI similarity between texts: ${oaiSimilarity.toFixed(4)}`);
    } catch (error) {
      console.error("Error with OpenAI embeddings:", error.message);
    }
  })();
}
