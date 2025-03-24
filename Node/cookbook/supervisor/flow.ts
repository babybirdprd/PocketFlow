// src/cookbook/supervisor/flow.ts
import { Flow } from '../../pocketflow';
import { DecideAction, SearchWeb, UnreliableAnswerNode, SupervisorNode } from './nodes';

/**
 * Create the inner research agent flow without supervision.
 * 
 * This flow handles the research cycle:
 * 1. DecideAction node decides whether to search or answer
 * 2. If search, go to SearchWeb node and return to decide
 * 3. If answer, go to UnreliableAnswerNode
 * 
 * @returns A research agent flow
 */
export function createAgentInnerFlow(): Flow {
  // Create instances of each node
  const decide = new DecideAction();
  const search = new SearchWeb();
  const answer = new UnreliableAnswerNode();
  
  // Connect the nodes
  // If DecideAction returns "search", go to SearchWeb
  decide.addSuccessor(search, "search");
  
  // If DecideAction returns "answer", go to UnreliableAnswerNode
  decide.addSuccessor(answer, "answer");
  
  // After SearchWeb completes and returns "decide", go back to DecideAction
  search.addSuccessor(decide, "decide");
  
  // Create and return the inner flow, starting with the DecideAction node
  return new Flow(decide);
}

/**
 * Create a supervised agent flow by treating the entire agent flow as a node
 * and placing the supervisor outside of it.
 * 
 * The flow works like this:
 * 1. Inner agent flow does research and generates an answer
 * 2. SupervisorNode checks if the answer is valid
 * 3. If answer is valid, flow completes
 * 4. If answer is invalid, restart the inner agent flow
 * 
 * @returns A complete research agent flow with supervision
 */
export function createAgentFlow(): Flow {
  // Create the inner flow
  const agentFlow = createAgentInnerFlow();
  
  // Create the supervisor node
  const supervisor = new SupervisorNode();
  
  // Connect the components
  // After agent_flow completes, go to supervisor
  agentFlow.addSuccessor(supervisor);
  
  // If supervisor rejects the answer, go back to agent_flow
  supervisor.addSuccessor(agentFlow, "decide");
  
  // Create and return the outer flow, starting with the agent_flow
  return agentFlow;
}
