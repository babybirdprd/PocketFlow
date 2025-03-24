// src/cookbook/thinking/main.ts
import { createChainOfThoughtFlow } from './flow';

/**
 * Main entry point for the chain of thought reasoning example
 */
async function main() {
  // Create the chain of thought flow
  const cotFlow = createChainOfThoughtFlow();
  
  // Create shared context with the problem
  const shared = {
    problem: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    current_thought_number: 0,
    total_thoughts_estimate: 5,
    thoughts: []
  };
  
  // Run the flow
  console.log("Starting chain of thought reasoning...");
  console.log(`Problem: ${shared.problem}`);
  console.log("-----------------------------------");
  
  const result = await cotFlow.run(shared);
  
  console.log("-----------------------------------");
  console.log("Reasoning completed!");
  if (shared.solution) {
    console.log("Solution found:", shared.solution);
  }
  
  return result;
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error running chain of thought:", error);
  });
}
