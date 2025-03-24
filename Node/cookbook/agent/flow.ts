// src/cookbook/agent/flow.ts
import { Flow } from '../../pocketflow';
import { DecideAction, SearchWeb, AnswerQuestion } from './nodes';

/**
 * Create and connect the nodes to form a complete agent flow.
 * 
 * The flow works like this:
 * 1. DecideAction node decides whether to search or answer
 * 2. If search, go to SearchWeb node
 * 3. If answer, go to AnswerQuestion node
 * 4. After SearchWeb completes, go back to DecideAction
 * 
 * @returns A complete research agent flow
 */
export function createAgentFlow(): Flow {
  // Create instances of each node
  const decide = new DecideAction();
  const search = new SearchWeb();
  const answer = new AnswerQuestion();
  
  // Connect the nodes
  // If DecideAction returns "search", go to SearchWeb
  decide.addSuccessor(search, "search");
  
  // If DecideAction returns "answer", go to AnswerQuestion
  decide.addSuccessor(answer, "answer");
  
  // After SearchWeb completes and returns "decide", go back to DecideAction
  search.addSuccessor(decide, "decide");
  
  // Create and return the flow, starting with the DecideAction node
  return new Flow(decide);
}
