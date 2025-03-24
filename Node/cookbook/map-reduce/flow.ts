// src/cookbook/map-reduce/flow.ts
import { Flow } from '../../pocketflow';
import { ReadResumesNode, EvaluateResumesNode, ReduceResultsNode } from './nodes';

/**
 * Create and configure the map-reduce flow for resume evaluation
 */
export function createMapReduceFlow(): Flow {
  // Create node instances
  const readResumesNode = new ReadResumesNode();
  const evaluateResumesNode = new EvaluateResumesNode();
  const reduceResultsNode = new ReduceResultsNode();
  
  // Connect nodes in sequence
  readResumesNode.addSuccessor(evaluateResumesNode);
  evaluateResumesNode.addSuccessor(reduceResultsNode);
  
  // Create flow starting with read node
  const mapReduceFlow = new Flow(readResumesNode);
  
  return mapReduceFlow;
}
