// src/cookbook/multi-agent/utils.ts
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';

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
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });
  
  return response.choices[0].message.content || '';
}

// Example usage
if (require.main === module) {
  (async () => {
    const result = await callLLM("Hello, how are you?");
    console.log(result);
  })();
}
