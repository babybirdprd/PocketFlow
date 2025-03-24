// src/cookbook/map-reduce/main.ts
import { createMapReduceFlow } from './flow';

/**
 * Main entry point for the map-reduce resume evaluation example
 */
async function main() {
  // Create the map-reduce flow
  const mapReduceFlow = createMapReduceFlow();
  
  // Create shared context
  const shared: Record<string, any> = {};
  
  // Run the flow
  console.log("Starting map-reduce resume evaluation...");
  console.log("-----------------------------------");
  
  const result = await mapReduceFlow.run(shared);
  
  console.log("-----------------------------------");
  console.log("Map-reduce flow completed!");
  
  return result;
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error("Error running map-reduce flow:", error);
  });
}

export { main };
