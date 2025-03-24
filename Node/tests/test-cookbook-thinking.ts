// tests/test-cookbook-thinking.ts
import { Flow } from '../src/pocketflow';
import { createChainOfThoughtFlow } from '../cookbook/thinking/flow';

// Mock the callLLM function to avoid actual API calls during tests
jest.mock('../cookbook/thinking/utils', () => ({
  callLLM: jest.fn().mockImplementation(async (prompt) => {
    // First thought
    if (prompt.includes('No previous thoughts yet')) {
      return '```yaml\ncontent: |\n  Let me break down this problem step by step. We know that a bat and ball cost $1.10 in total, and the bat costs $1.00 more than the ball.\n  Let\'s call the cost of the ball x. Then the cost of the bat would be x + $1.00.\n  So we can write the equation: x + (x + $1.00) = $1.10\nnext_thought_needed: true\nis_revision: false\nrevises_thought: null\nbranch_from_thought: null\nbranch_id: null\ntotal_thoughts: 3\n```';
    } 
    // Second thought
    else if (prompt.includes('Thought 1:')) {
      return '```yaml\ncontent: |\n  Now I can solve the equation I set up:\n  x + (x + $1.00) = $1.10\n  2x + $1.00 = $1.10\n  2x = $0.10\n  x = $0.05\n  \n  So the ball costs $0.05, and the bat costs $1.05 (which is $1.00 more than the ball).\n  Let\'s verify: $0.05 + $1.05 = $1.10 ✓\nnext_thought_needed: false\nis_revision: false\nrevises_thought: null\nbranch_from_thought: null\nbranch_id: null\ntotal_thoughts: 3\n```';
    }
    return 'Default mock response';
  })
}));

describe('Cookbook Thinking Tests', () => {
  test('Chain of thought flow should process a problem through reasoning steps', async () => {
    // Create the chain of thought flow
    const cotFlow = createChainOfThoughtFlow();
    
    // Create shared context with the problem
    const shared = {
      problem: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
      current_thought_number: 0,
      total_thoughts_estimate: 3,
      thoughts: []
    };
    
    // Run the flow
    await cotFlow.run(shared);
    
    // Check results
    expect(shared.thoughts).toHaveLength(2);
    expect(shared.solution).toBeDefined();
    expect(shared.thoughts[1].next_thought_needed).toBe(false);
  });
});
