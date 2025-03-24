// src/cookbook/thinking/utils.ts
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Call LLM with the given prompt using Anthropic's Claude API
 * @param prompt The prompt to send to the LLM
 * @returns The LLM response content
 */
export async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || 'your-api-key';
  
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    }
  );
  
  return response.data.content[0].text;
}

// Test function
if (require.main === module) {
  (async () => {
    console.log("## Testing callLLM");
    const prompt = "In a few words, what is the meaning of life?";
    console.log(`## Prompt: ${prompt}`);
    const response = await callLLM(prompt);
    console.log(`## Response: ${response}`);
  })().catch(error => {
    console.error("Error:", error);
  });
}
