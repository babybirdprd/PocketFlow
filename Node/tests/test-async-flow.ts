// tests/test-async-flow.ts
import { AsyncFlow, AsyncNode } from '../src/pocketflow';

// Create tests for AsyncFlow functionality
describe('AsyncFlow Tests', () => {
  test('AsyncFlow should execute async nodes in sequence', async () => {
    // Create a shared context to pass between nodes
    const shared: Record<string, any> = { value: 0 };
    
    // Create test async nodes
    class AsyncIncrementNode extends AsyncNode {
      async prepAsync(shared: Record<string, any>) {
        return shared.value;
      }
      
      async execAsync(value: number) {
        // Simulate async operation
        return new Promise<number>(resolve => {
          setTimeout(() => {
            resolve(value + 1);
          }, 10);
        });
      }
      
      async postAsync(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.value = execRes;
        return 'default';
      }
    }
    
    class AsyncMultiplyNode extends AsyncNode {
      async prepAsync(shared: Record<string, any>) {
        return shared.value;
      }
      
      async execAsync(value: number) {
        // Simulate async operation
        return new Promise<number>(resolve => {
          setTimeout(() => {
            resolve(value * 2);
          }, 10);
        });
      }
      
      async postAsync(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.value = execRes;
        return 'default';
      }
    }
    
    // Create and connect nodes
    const incrementNode = new AsyncIncrementNode();
    const multiplyNode = new AsyncMultiplyNode();
    incrementNode.addSuccessor(multiplyNode);
    
    // Create flow
    const flow = new AsyncFlow(incrementNode);
    
    // Run flow
    await flow.runAsync(shared);
    
    // Check result (0 + 1) * 2 = 2
    expect(shared.value).toBe(2);
  });
  
  test('AsyncFlow should follow different paths based on actions', async () => {
    // Create a shared context
    const shared: Record<string, any> = { value: 5 };
    
    // Create test nodes
    class AsyncDecisionNode extends AsyncNode {
      async prepAsync(shared: Record<string, any>) {
        return shared.value;
      }
      
      async execAsync(value: number) {
        return value;
      }
      
      async postAsync(shared: Record<string, any>, prepRes: any, execRes: any) {
        return execRes > 10 ? 'high' : 'low';
      }
    }
    
    class AsyncHighValueNode extends AsyncNode {
      async postAsync(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.result = 'high value';
        return 'default';
      }
    }
    
    class AsyncLowValueNode extends AsyncNode {
      async postAsync(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.result = 'low value';
        return 'default';
      }
    }
    
    // Create and connect nodes
    const decisionNode = new AsyncDecisionNode();
    const highValueNode = new AsyncHighValueNode();
    const lowValueNode = new AsyncLowValueNode();
    
    decisionNode.addSuccessor(highValueNode, 'high');
    decisionNode.addSuccessor(lowValueNode, 'low');
    
    // Create flow
    const flow = new AsyncFlow(decisionNode);
    
    // Run flow with low value
    await flow.runAsync(shared);
    expect(shared.result).toBe('low value');
    
    // Run flow with high value
    shared.value = 15;
    await flow.runAsync(shared);
    expect(shared.result).toBe('high value');
  });
});
