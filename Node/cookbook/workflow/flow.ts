// src/cookbook/workflow/flow.ts
import { Flow } from '../../pocketflow/flow';
import { GenerateOutline, WriteSimpleContent, ApplyStyle } from './nodes';

/**
 * Create and configure the article writing workflow
 */
export function createArticleFlow(): Flow {
  // Create node instances
  const outlineNode = new GenerateOutline();
  const writeNode = new WriteSimpleContent();
  const styleNode = new ApplyStyle();
  
  // Connect nodes in sequence
  outlineNode.addSuccessor(writeNode);
  writeNode.addSuccessor(styleNode);
  
  // Create flow starting with outline node
  const articleFlow = new Flow(outlineNode);
  
  return articleFlow;
}
