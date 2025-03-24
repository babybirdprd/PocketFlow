// src/cookbook/streaming/main.ts
import { Node, Flow } from '../../pocketflow';
import { fakeStreamLLM, streamLLM } from './utils';
import * as readline from 'readline';

class StreamNode extends Node {
  async prep(shared: Record<string, any>): Promise<any> {
    // Create interrupt controller
    const controller = new AbortController();
    const signal = controller.signal;

    // Set up user interrupt listener
    console.log("Press ENTER at any time to interrupt streaming...");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const interruptPromise = new Promise<void>(resolve => {
      rl.once('line', () => {
        controller.abort();
        resolve();
      });
    });

    // Get prompt from shared store
    const prompt = shared["prompt"];
    
    // Get streaming generator from LLM function
    const streamingGenerator = fakeStreamLLM(prompt);
    
    return { streamingGenerator, controller, rl, interruptPromise };
  }

  async exec(prepRes: any): Promise<any> {
    const { streamingGenerator, controller, rl, interruptPromise } = prepRes;
    
    // Create a promise that will resolve when streaming is complete
    const streamingPromise = (async () => {
      try {
        for await (const chunk of streamingGenerator) {
          if (controller.signal.aborted) {
            console.log("\nUser interrupted streaming.");
            break;
          }
          
          if (chunk.choices[0]?.delta?.content) {
            const chunkContent = chunk.choices[0].delta.content;
            process.stdout.write(chunkContent);
            
            // Simulate latency
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        console.log(); // Add a newline at the end
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log("\nUser interrupted streaming.");
        } else {
          console.error("\nError during streaming:", error);
        }
      }
    })();
    
    // Wait for either streaming to complete or user to interrupt
    await Promise.race([streamingPromise, interruptPromise]);
    
    return { controller, rl };
  }

  post(shared: Record<string, any>, prepRes: any, execRes: any): string | null {
    const { controller, rl } = execRes;
    
    // Clean up resources
    controller.abort();
    rl.close();
    
    return "default";
  }
}

// Usage:
async function main() {
  const node = new StreamNode();
  const flow = new Flow(node);

  const shared = { "prompt": "What's the meaning of life?" };
  await flow.run(shared);
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error running streaming example:", error);
  });
}

export { main, StreamNode };
