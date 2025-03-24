// tests/test-async-node.ts
import { AsyncNode } from '../src/pocketflow';

// Create tests for AsyncNode functionality
describe('AsyncNode Tests', () => {
  test('AsyncNode should handle async operations', async () => {
    // Create a test async node
    class DelayedProcessNode extends AsyncNode {
      async prepAsync(shared: Record<string, any>) {
        return shared.input;
      }
      
      async execAsync(input: number) {
        // Simulate async operation with Promise
        return new Promise<number>(resolve => {
          setTimeout(() => {
            resolve(input * 2);
          }, 10);
        });
      }
      
      async postAsync(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.result = execRes;
        return 'default';
      }
    }
    
    // Create an instance of the async node
    const delayedNode = new DelayedProcessNode();
    
    // Test with input
    const shared = { input: 5 };
    await delayedNode.runAsync(shared);
    
    // Check results
    expect(shared.result).toBe(10);
  });
  
  test('AsyncNode should handle retry logic', async () => {
    // Create a counter to track call attempts
    let attempts = 0;
    
    // Create a test async node with retry
    class UnreliableAsyncNode extends AsyncNode {
      async prepAsync(shared: Record<string, any>) {
        return shared.input;
      }
      
      async execAsync(input: number) {
        attempts++;
        
        // Fail on first two attempts
        if (attempts <= 2) {
          throw new Error('Simulated failure');
        }
        
        return input * 3;
      }
      
      async postAsync(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.result = execRes;
        return 'default';
      }
    }
    
    // Create an instance with 3 retries
    const unreliableNode = new UnreliableAsyncNode(3, 10);
    
    // Test with input
    const shared = { input: 5 };
    await unreliableNode.runAsync(shared);
    
    // Check results - should succeed on third attempt
    expect(shared.result).toBe(15);
    expect(attempts).toBe(3);
  });
  
  test('AsyncNode should use fallback on exhausted retries', async () => {
    // Create a test async node with fallback
    class FailingAsyncNode extends AsyncNode {
      async prepAsync(shared: Record<string, any>) {
        return shared.input;
      }
      
      async execAsync(input: number) {
        throw new Error('Always fails');
      }
      
      async execFallbackAsync(prepRes: any, exc: Error) {
        return -1; // Fallback value
      }
      
      async postAsync(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.result = execRes;
        return 'default';
      }
    }
    
    // Create an instance with 2 retries
    const failingNode = new FailingAsyncNode(2);
    
    // Test with input
    const shared = { input: 5 };
    await failingNode.runAsync(shared);
    
    // Check results - should use fallback value
    expect(shared.result).toBe(-1);
  });
});
