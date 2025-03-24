// src/cookbook/workflow/main.ts
import { createArticleFlow } from './flow';

/**
 * Main entry point for the article writing workflow example
 */
async function main() {
  // Create the article flow
  const articleFlow = createArticleFlow();
  
  // Create shared context with the topic
  const shared = {
    topic: "The benefits of artificial intelligence in healthcare"
  };
  
  // Run the flow
  console.log("Starting article writing workflow...");
  console.log(`Topic: ${shared.topic}`);
  console.log("-----------------------------------");
  
  const result = await articleFlow.run(shared);
  
  console.log("-----------------------------------");
  console.log("Workflow completed!");
  
  return result;
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error running workflow:", error);
  });
}
