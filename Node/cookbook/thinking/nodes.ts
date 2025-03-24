// src/cookbook/thinking/nodes.ts
import { Node } from '../../pocketflow/node';
import * as yaml from 'js-yaml';
import { callLLM } from './utils';

interface SharedContext {
  [key: string]: any;
}

interface Thought {
  thought_number: number;
  content: string;
  next_thought_needed: boolean;
  is_revision?: boolean;
  revises_thought?: number | null;
  branch_from_thought?: number | null;
  branch_id?: string | null;
  total_thoughts?: number;
}

export class ChainOfThoughtNode extends Node {
  prep(shared: SharedContext): any {
    // Gather problem and previous thoughts
    const problem = shared.problem || "";
    const thoughts = shared.thoughts || [];
    const currentThoughtNumber = shared.current_thought_number || 0;
    
    // Increment the current thought number in the shared store
    shared.current_thought_number = currentThoughtNumber + 1;
    const totalThoughtsEstimate = shared.total_thoughts_estimate || 5;
    
    // Format previous thoughts
    const thoughtsText = thoughts.map((t: Thought) => {
      let text = `Thought ${t.thought_number}: ${t.content}`;
      
      if (t.is_revision && t.revises_thought) {
        text += ` (Revision of Thought ${t.revises_thought})`;
      }
      
      if (t.branch_from_thought) {
        text += ` (Branch from Thought ${t.branch_from_thought}, Branch ID: ${t.branch_id})`;
      }
      
      return text;
    }).join("\n");
    
    return {
      problem,
      thoughts_text: thoughtsText,
      thoughts,
      current_thought_number: currentThoughtNumber + 1,
      total_thoughts_estimate: totalThoughtsEstimate
    };
  }
  
  async exec(prepRes: any): Promise<any> {
    const problem = prepRes.problem;
    const thoughtsText = prepRes.thoughts_text;
    const currentThoughtNumber = prepRes.current_thought_number;
    const totalThoughtsEstimate = prepRes.total_thoughts_estimate;
    
    // Create the prompt for the LLM
    const prompt = `
You are solving a hard problem using Chain of Thought reasoning. Think step-by-step.

Problem: ${problem}

Previous thoughts:
${thoughtsText || "No previous thoughts yet."}

Please generate the next thought (Thought ${currentThoughtNumber}). You can:
1. Continue with the next logical step
2. Revise a previous thought if needed
3. Branch into a new line of thinking
4. Generate a hypothesis if you have enough information
5. Verify a hypothesis against your reasoning
6. Provide a final solution if you've reached a conclusion

Current thought number: ${currentThoughtNumber}
Current estimate of total thoughts needed: ${totalThoughtsEstimate}

Format your response as a YAML structure with these fields:
- content: Your thought content
- next_thought_needed: true/false (true if more thinking is needed)
- is_revision: true/false (true if revising a previous thought)
- revises_thought: null or number (if is_revision is true)
- branch_from_thought: null or number (if branching from previous thought)
- branch_id: null or string (a short identifier for this branch)
- total_thoughts: number (your updated estimate if changed)

Only set next_thought_needed to false when you have a complete solution and the content explains the solution.
Output in YAML format:
\`\`\`yaml
content: |
  # If you have a complete solution, explain the solution here.
  # If it's a revision, provide the updated thought here.
  # If it's a branch, provide the new thought here.
next_thought_needed: true/false
is_revision: true/false
revises_thought: null or number
branch_from_thought: null or number
branch_id: null or string
total_thoughts: number
\`\`\``;
    
    const response = await callLLM(prompt);
    const yamlStr = response.split("```yaml")[1].split("```")[0].trim();
    const thoughtData = yaml.load(yamlStr) as Thought;
    
    // Add thought number
    thoughtData.thought_number = currentThoughtNumber;
    return thoughtData;
  }
  
  post(shared: SharedContext, prepRes: any, execRes: any): string | null {
    // Add the new thought to the list
    if (!shared.thoughts) {
      shared.thoughts = [];
    }
    
    shared.thoughts.push(execRes);
    
    // Update total_thoughts_estimate if changed
    if (execRes.total_thoughts && execRes.total_thoughts !== shared.total_thoughts_estimate) {
      shared.total_thoughts_estimate = execRes.total_thoughts;
    }
    
    // If we're done, extract the solution from the last thought
    if (execRes.next_thought_needed === false) {
      shared.solution = execRes.content;
      console.log("\n=== FINAL SOLUTION ===");
      console.log(execRes.content);
      console.log("======================\n");
      return "end";
    }
    
    // Otherwise, continue the chain
    console.log(`\n${execRes.content}`);
    console.log(`Next thought needed: ${execRes.next_thought_needed !== false}`);
    console.log(`Total thoughts estimate: ${shared.total_thoughts_estimate || 5}`);
    console.log("-".repeat(50));
    
    return "continue";
  }
}
