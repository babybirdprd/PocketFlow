// src/cookbook/workflow/utils.ts
import { Configuration, OpenAIApi } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Call LLM with the given prompt
 * @param prompt The prompt to send to the LLM
 * @returns The LLM response content
 */
export async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || 'your-api-key';
  
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  
  const openai = new OpenAIApi(configuration);
  
  const response = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });
  
  return response.data.choices[0].message?.content || '';
}
