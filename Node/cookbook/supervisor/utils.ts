// src/cookbook/supervisor/utils.ts
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';
import axios from 'axios';

dotenv.config();

/**
 * Call LLM with the given prompt
 * @param prompt The prompt to send to the LLM
 * @returns The LLM response content
 */
export async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || 'your-api-key';
  const client = new OpenAI({ apiKey });
  
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }]
  });
  
  return response.choices[0].message.content || '';
}

/**
 * Search the web for the given query
 * @param query The search query
 * @returns The search results as a string
 */
export async function searchWeb(query: string): Promise<string> {
  // Since DuckDuckGo search isn't directly available in Node.js,
  // we'll simulate it with a simple implementation
  try {
    // Use a search API (this is a placeholder - in a real implementation,
    // you would use an actual search API or web scraping)
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json'
      }
    });
    
    // Process results
    const results = response.data.RelatedTopics || [];
    const resultsStr = results.slice(0, 5).map((result: any, index: number) => 
      `Title: Result ${index + 1}\nURL: ${result.FirstURL || 'N/A'}\nSnippet: ${result.Text || 'N/A'}`
    ).join('\n\n');
    
    return resultsStr || 'No results found';
  } catch (error) {
    console.error('Error searching web:', error);
    
    // Fallback to simulated results for demonstration
    return `
Title: Simulated Search Result 1 for "${query}"
URL: https://example.com/result1
Snippet: This is a simulated search result for the query. It contains relevant information about the topic.

Title: Simulated Search Result 2 for "${query}"
URL: https://example.com/result2
Snippet: Another simulated result with different information about the search query.

Title: Simulated Search Result 3 for "${query}"
URL: https://example.com/result3
Snippet: A third simulated result with additional context and information related to the search.
    `;
  }
}

// Test function
if (require.main === module) {
  (async () => {
    console.log("## Testing call_llm");
    const prompt = "In a few words, what is the meaning of life?";
    console.log(`## Prompt: ${prompt}`);
    const response = await callLLM(prompt);
    console.log(`## Response: ${response}`);

    console.log("## Testing search_web");
    const query = "Who won the Nobel Prize in Physics 2024?";
    console.log(`## Query: ${query}`);
    const results = await searchWeb(query);
    console.log(`## Results: ${results}`);
  })();
}
