// src/cookbook/agent/nodes.ts
import { Node } from '../../pocketflow';
import { callLLM, searchWeb } from './utils';
import * as yaml from 'js-yaml';

interface SharedContext {
  [key: string]: any;
}

export class DecideAction extends Node {
  prep(shared: SharedContext): any {
    /**
     * Prepare the context and question for the decision-making process.
     */
    // Get the current context (default to "No previous search" if none exists)
    const context = shared.context || "No previous search";
    // Get the question from the shared store
    const question = shared.question;
    // Return both for the exec step
    return [question, context];
  }
  
  async exec(inputs: [string, string]): Promise<any> {
    /**
     * Call the LLM to decide whether to search or answer.
     */
    const [question, context] = inputs;
    
    console.log("🤔 Agent deciding what to do next...");
    
    // Create a prompt to help the LLM decide what to do next with proper yaml formatting
    const prompt = `
### CONTEXT
You are a research assistant that can search the web.
Question: ${question}
Previous Research: ${context}

### ACTION SPACE
[1] search
  Description: Look up more information on the web
  Parameters:
    - query (str): What to search for

[2] answer
  Description: Answer the question with current knowledge
  Parameters:
    - answer (str): Final answer to the question

## NEXT ACTION
Decide the next action based on the context and available actions.
Return your response in this format:

\`\`\`yaml
thinking: |
    <your step-by-step reasoning process>
action: search OR answer
reason: <why you chose this action>
answer: <if action is answer>
search_query: <specific search query if action is search>
\`\`\`
IMPORTANT: Make sure to:
1. Use proper indentation (4 spaces) for all multi-line fields
2. Use the | character for multi-line text fields
3. Keep single-line fields without the | character
`;
    
    // Call the LLM to make a decision
    const response = await callLLM(prompt);
    
    // Parse the response to get the decision
    const yamlStr = response.split("```yaml")[1].split("```")[0].trim();
    const decision = yaml.load(yamlStr) as any;
    
    return decision;
  }
  
  post(shared: SharedContext, prepRes: any, execRes: any): string | null {
    /**
     * Save the decision and determine the next step in the flow.
     */
    // If LLM decided to search, save the search query
    if (execRes.action === "search") {
      shared.search_query = execRes.search_query;
      console.log(`🔍 Agent decided to search for: ${execRes.search_query}`);
    } else {
      shared.context = execRes.answer; // save the context if LLM gives the answer without searching
      console.log("💡 Agent decided to answer the question");
    }
    
    // Return the action to determine the next node in the flow
    return execRes.action;
  }
}

export class SearchWeb extends Node {
  prep(shared: SharedContext): any {
    /**
     * Get the search query from the shared store.
     */
    return shared.search_query;
  }
  
  async exec(searchQuery: string): Promise<string> {
    /**
     * Search the web for the given query.
     */
    // Call the search utility function
    console.log(`🌐 Searching the web for: ${searchQuery}`);
    const results = await searchWeb(searchQuery);
    return results;
  }
  
  post(shared: SharedContext, prepRes: any, execRes: string): string | null {
    /**
     * Save the search results and go back to the decision node.
     */
    // Add the search results to the context in the shared store
    const previous = shared.context || "";
    shared.context = previous + "\n\nSEARCH: " + shared.search_query + "\nRESULTS: " + execRes;
    
    console.log("📚 Found information, analyzing results...");
    
    // Always go back to the decision node after searching
    return "decide";
  }
}

export class AnswerQuestion extends Node {
  prep(shared: SharedContext): any {
    /**
     * Get the question and context for answering.
     */
    return [shared.question, shared.context || ""];
  }
  
  async exec(inputs: [string, string]): Promise<string> {
    /**
     * Call the LLM to generate a final answer.
     */
    const [question, context] = inputs;
    
    console.log("✍️ Crafting final answer...");
    
    // Create a prompt for the LLM to answer the question
    const prompt = `
### CONTEXT
Based on the following information, answer the question.
Question: ${question}
Research: ${context}

## YOUR ANSWER:
Provide a comprehensive answer using the research results.
`;
    // Call the LLM to generate an answer
    const answer = await callLLM(prompt);
    return answer;
  }
  
  post(shared: SharedContext, prepRes: any, execRes: string): string | null {
    /**
     * Save the final answer and complete the flow.
     */
    // Save the answer in the shared store
    shared.answer = execRes;
    
    console.log("✅ Answer generated successfully");
    
    // We're done - no need to continue the flow
    return "done";
  }
}
