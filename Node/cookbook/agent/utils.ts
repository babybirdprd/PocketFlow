// src/cookbook/agent/utils.ts
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Call LLM with the given prompt
 * @param prompt The prompt to send to the LLM
 * @returns The LLM response content
 */
export async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || 'your-api-key';
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling LLM:', error);
    return 'Error: Unable to get response from LLM';
  }
}

/**
 * Search the web for the given query
 * @param query The search query
 * @returns The search results as a string
 */
export async function searchWeb(query: string): Promise<string> {
  // In a real implementation, this would use a search API like Google, Bing, etc.
  // For this example, we'll simulate search results
  
  console.log(`Simulating web search for: ${query}`);
  
  // Simulate a delay for the search
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return simulated search results based on the query
  if (query.toLowerCase().includes('javascript') || query.toLowerCase().includes('typescript')) {
    return `
    - JavaScript is a programming language that is one of the core technologies of the World Wide Web.
    - TypeScript is a strongly typed programming language that builds on JavaScript.
    - Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.
    - TypeScript adds optional static typing to JavaScript, which can help catch errors early.
    - TypeScript is maintained by Microsoft and is designed for development of large applications.
    `;
  } else if (query.toLowerCase().includes('python')) {
    return `
    - Python is a high-level, general-purpose programming language.
    - Python's design philosophy emphasizes code readability with its use of significant indentation.
    - Python is dynamically-typed and garbage-collected.
    - Python supports multiple programming paradigms, including structured, object-oriented, and functional programming.
    - Python is often used in data analysis, machine learning, and artificial intelligence.
    `;
  } else if (query.toLowerCase().includes('ai') || query.toLowerCase().includes('artificial intelligence')) {
    return `
    - Artificial intelligence (AI) is intelligence demonstrated by machines.
    - Machine learning is a subset of AI that focuses on the development of algorithms that can learn from and make predictions on data.
    - Deep learning is a subset of machine learning that uses neural networks with many layers.
    - Natural language processing (NLP) is a field of AI that focuses on the interaction between computers and humans through natural language.
    - Computer vision is a field of AI that focuses on enabling computers to see, identify, and process images in the same way that human vision does.
    `;
  } else {
    return `
    - No specific information found for "${query}".
    - Try refining your search query to get more relevant results.
    - Consider using more specific keywords related to your topic of interest.
    `;
  }
}
