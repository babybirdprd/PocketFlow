// src/cookbook/supervisor/main.ts
import { createAgentFlow } from './flow';

/**
 * Simple function to process a question with supervised answers.
 * @param question The question to process
 */
async function processQuestion(question: string): Promise<string> {
  // Create the agent flow with supervision
  const agentFlow = createAgentFlow();
  
  // Process the question
  const shared = { question };
  console.log(`🤔 Processing question: ${question}`);
  await agentFlow.run(shared);
  
  console.log("\n🎯 Final Answer:");
  const answer = shared.answer || "No answer found";
  console.log(answer);
  
  return answer;
}

/**
 * Main entry point for the supervisor example
 */
async function main() {
  // Default question
  let question = "Who won the Nobel Prize in Physics 2024?";
  
  // Get question from command line if provided
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith("--")) {
      question = arg.substring(2);
      break;
    }
  }
  
  await processQuestion(question);
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error running supervisor example:", error);
  });
}

export { main, processQuestion };
