// src/cookbook/agent/main.ts
import { createAgentFlow } from './flow';

/**
 * Main entry point for the research agent example
 */
async function main() {
  // Create the agent flow
  const agentFlow = createAgentFlow();
  
  // Create shared context with the question
  const shared = {
    question: "What are the key differences between JavaScript and TypeScript?"
  };
  
  // Run the flow
  console.log("Starting research agent...");
  console.log(`Question: ${shared.question}`);
  console.log("-----------------------------------");
  
  const result = await agentFlow.run(shared);
  
  console.log("-----------------------------------");
  console.log("Research completed!");
  console.log("Final answer:");
  console.log(shared.answer);
  
  return result;
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error running agent:", error);
  });
}

export { main };
