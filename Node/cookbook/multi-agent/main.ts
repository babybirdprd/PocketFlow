// src/cookbook/multi-agent/main.ts
import { AsyncNode, AsyncFlow } from '../../pocketflow';
import { callLLM } from './utils';

class AsyncHinter extends AsyncNode {
  async prepAsync(shared: Record<string, any>): Promise<any> {
    // Wait for message from guesser (or empty string at start)
    const guess = await shared.hinterQueue.get();
    if (guess === "GAME_OVER") {
      return null;
    }
    return [shared.targetWord, shared.forbiddenWords, shared.pastGuesses || []];
  }

  async execAsync(inputs: any): Promise<any> {
    if (inputs === null) {
      return null;
    }
    const [target, forbidden, pastGuesses] = inputs;
    let prompt = `Generate hint for '${target}'\nForbidden words: ${forbidden}`;
    if (pastGuesses.length > 0) {
      prompt += `\nPrevious wrong guesses: ${pastGuesses}\nMake hint more specific.`;
    }
    prompt += "\nUse at most 5 words.";
    
    const hint = await callLLM(prompt);
    console.log(`\nHinter: Here's your hint - ${hint}`);
    return hint;
  }

  async postAsync(shared: Record<string, any>, prepRes: any, execRes: any): Promise<string | null> {
    if (execRes === null) {
      return "end";
    }
    // Send hint to guesser
    await shared.guesserQueue.put(execRes);
    return "continue";
  }
}

class AsyncGuesser extends AsyncNode {
  async prepAsync(shared: Record<string, any>): Promise<any> {
    // Wait for hint from hinter
    const hint = await shared.guesserQueue.get();
    return [hint, shared.pastGuesses || []];
  }

  async execAsync(inputs: any): Promise<string> {
    const [hint, pastGuesses] = inputs;
    const prompt = `Given hint: ${hint}, past wrong guesses: ${pastGuesses}, make a new guess. Directly reply a single word:`;
    const guess = await callLLM(prompt);
    console.log(`Guesser: I guess it's - ${guess}`);
    return guess;
  }

  async postAsync(shared: Record<string, any>, prepRes: any, execRes: string): Promise<string | null> {
    // Check if guess is correct
    if (execRes.toLowerCase() === shared.targetWord.toLowerCase()) {
      console.log("Game Over - Correct guess!");
      await shared.hinterQueue.put("GAME_OVER");
      return "end";
    }
    
    // Store the guess in shared state
    if (!shared.pastGuesses) {
      shared.pastGuesses = [];
    }
    shared.pastGuesses.push(execRes);
    
    // Send guess to hinter
    await shared.hinterQueue.put(execRes);
    return "continue";
  }
}

// Create a simple Queue implementation
class AsyncQueue<T> {
  private queue: T[] = [];
  private resolvers: ((value: T) => void)[] = [];

  async put(item: T): Promise<void> {
    if (this.resolvers.length > 0) {
      const resolve = this.resolvers.shift()!;
      resolve(item);
    } else {
      this.queue.push(item);
    }
  }

  async get(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }
    
    return new Promise<T>(resolve => {
      this.resolvers.push(resolve);
    });
  }
}

async function main() {
  // Set up game
  const shared = {
    targetWord: "nostalgic",
    forbiddenWords: ["memory", "past", "remember", "feeling", "longing"],
    hinterQueue: new AsyncQueue<string>(),
    guesserQueue: new AsyncQueue<string>()
  };
  
  console.log("=========== Taboo Game Starting! ===========");
  console.log(`Target word: ${shared.targetWord}`);
  console.log(`Forbidden words: ${shared.forbiddenWords}`);
  console.log("============================================");

  // Initialize by sending empty guess to hinter
  await shared.hinterQueue.put("");

  // Create nodes and flows
  const hinter = new AsyncHinter();
  const guesser = new AsyncGuesser();

  // Set up flows
  const hinterFlow = new AsyncFlow(hinter);
  const guesserFlow = new AsyncFlow(guesser);

  // Connect nodes to themselves for looping
  hinter.addSuccessor(hinter, "continue");
  guesser.addSuccessor(guesser, "continue");

  // Run both agents concurrently
  await Promise.all([
    hinterFlow.runAsync(shared),
    guesserFlow.runAsync(shared)
  ]);
  
  console.log("=========== Game Complete! ===========");
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error running multi-agent example:", error);
  });
}

export { main, AsyncHinter, AsyncGuesser };
