// tests/test-batch-node.ts
import { BatchNode } from '../src/pocketflow';

// Create a simple test for BatchNode functionality
describe('BatchNode Tests', () => {
  test('BatchNode should process items in a batch', () => {
    // Create a test batch node
    class NumberSquareNode extends BatchNode {
      exec(item: number) {
        return item * item;
      }
    }
    
    // Create an instance of the batch node
    const squareNode = new NumberSquareNode();
    
    // Test with a batch of numbers
    const input = [1, 2, 3, 4, 5];
    const result = squareNode._exec(input);
    
    // Check results
    expect(result).toEqual([1, 4, 9, 16, 25]);
  });
  
  test('BatchNode should handle empty batch', () => {
    // Create a test batch node
    class NumberSquareNode extends BatchNode {
      exec(item: number) {
        return item * item;
      }
    }
    
    // Create an instance of the batch node
    const squareNode = new NumberSquareNode();
    
    // Test with an empty batch
    const result = squareNode._exec([]);
    
    // Check results
    expect(result).toEqual([]);
  });
  
  test('BatchNode should handle retry logic', () => {
    // Create a test batch node with retry
    class UnreliableNode extends BatchNode {
      private callCount: Record<number, number> = {};
      
      exec(item: number) {
        // Initialize call count for this item if not exists
        if (!this.callCount[item]) {
          this.callCount[item] = 0;
        }
        
        // Increment call count
        this.callCount[item]++;
        
        // Fail on first attempt for even numbers
        if (item % 2 === 0 && this.callCount[item] === 1) {
          throw new Error('Simulated failure');
        }
        
        return item * 10;
      }
    }
    
    // Create an instance with 2 retries
    const unreliableNode = new UnreliableNode(2);
    
    // Test with a batch of numbers
    const input = [1, 2, 3, 4];
    const result = unreliableNode._exec(input);
    
    // Check results - all should succeed with retries
    expect(result).toEqual([10, 20, 30, 40]);
  });
});
