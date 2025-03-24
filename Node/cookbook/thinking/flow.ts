// src/cookbook/thinking/flow.ts
import { Flow } from '../../pocketflow/flow';
import { ChainOfThoughtNode } from './nodes';

/**
 * Create and configure the chain of thought flow
 */
export function createChainOfThoughtFlow(): Flow {
  // Create a ChainOfThoughtNode
  const cotNode = new ChainOfThoughtNode();
  
  // Connect the node to itself for the "continue" action
  cotNode.addSuccessor(cotNode, "continue");
  
  // Create the flow
  const cotFlow = new Flow(cotNode);
  return cotFlow;
}
