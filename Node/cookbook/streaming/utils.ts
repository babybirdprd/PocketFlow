// src/cookbook/streaming/utils.ts
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

/**
 * Stream responses from an LLM
 * @param prompt The prompt to send to the LLM
 * @returns A streaming response from the LLM
 */
export async function* streamLLM(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY || 'your-api-key';
  const client = new OpenAI({ apiKey });

  // Make a streaming chat completion request
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    stream: true  // Enable streaming
  });

  for await (const chunk of response) {
    yield chunk;
  }
}

/**
 * Fake streaming LLM for testing without API calls
 * @param prompt The prompt to send to the LLM
 * @param predefinedText The text to stream back in chunks
 * @returns An array of fake streaming response chunks
 */
export async function* fakeStreamLLM(
  prompt: string, 
  predefinedText: string = "This is a fake response. Today is a sunny day. The sun is shining. The birds are singing. The flowers are blooming. The bees are buzzing. The wind is blowing. The clouds are drifting. The sky is blue. The grass is green. The trees are tall. The water is clear. The fish are swimming. The sun is shining. The birds are singing. The flowers are blooming. The bees are buzzing. The wind is blowing. The clouds are drifting. The sky is blue. The grass is green. The trees are tall. The water is clear. The fish are swimming."
) {
  // Split text into small chunks
  const chunkSize = 10;
  
  // Build the chunks
  for (let i = 0; i < predefinedText.length; i += chunkSize) {
    const textChunk = predefinedText.slice(i, i + chunkSize);
    
    // Create a chunk object that mimics OpenAI's structure
    const chunk = {
      choices: [
        {
          delta: {
            content: textChunk
          }
        }
      ]
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    yield chunk;
  }
}

// Test function
if (require.main === module) {
  (async () => {
    console.log("## Testing streaming LLM");
    const prompt = "What's the meaning of life?";
    console.log(`## Prompt: ${prompt}`);
    
    // Choose which streaming function to use
    // const streamingResponse = fakeStreamLLM(prompt);
    const streamingResponse = streamLLM(prompt);
    
    console.log("## Response: ");
    for await (const chunk of streamingResponse) {
      if (chunk.choices[0]?.delta?.content) {
        const chunkContent = chunk.choices[0].delta.content;
        // Print the incoming text without a newline (simulate real-time streaming)
        process.stdout.write(chunkContent);
      }
    }
    console.log(); // Add a newline at the end
  })();
}
