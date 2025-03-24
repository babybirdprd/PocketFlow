// tests/test-flow-basic.ts
import { BaseNode, Node, Flow } from '../src/pocketflow';

// Create a simple test for basic Flow functionality
describe('Basic Flow Tests', () => {
  test('Flow should execute nodes in sequence', () => {
    // Create a shared context to pass between nodes
    const shared: Record<string, any> = { value: 0 };
    
    // Create test nodes
    class IncrementNode extends Node {
      prep(shared: Record<string, any>) {
        return shared.value;
      }
      
      exec(value: number) {
        return value + 1;
      }
      
      post(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.value = execRes;
        return 'default';
      }
    }
    
    class MultiplyNode extends Node {
      prep(shared: Record<string, any>) {
        return shared.value;
      }
      
      exec(value: number) {
        return value * 2;
      }
      
      post(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.value = execRes;
        return 'default';
      }
    }
    
    // Create and connect nodes
    const incrementNode = new IncrementNode();
    const multiplyNode = new MultiplyNode();
    incrementNode.addSuccessor(multiplyNode);
    
    // Create flow
    const flow = new Flow(incrementNode);
    
    // Run flow
    flow.run(shared);
    
    // Check result (0 + 1) * 2 = 2
    expect(shared.value).toBe(2);
  });
  
  test('Flow should follow different paths based on actions', () => {
    // Create a shared context
    const shared: Record<string, any> = { value: 5 };
    
    // Create test nodes
    class DecisionNode extends Node {
      prep(shared: Record<string, any>) {
        return shared.value;
      }
      
      exec(value: number) {
        return value;
      }
      
      post(shared: Record<string, any>, prepRes: any, execRes: any) {
        return execRes > 10 ? 'high' : 'low';
      }
    }
    
    class HighValueNode extends Node {
      post(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.result = 'high value';
        return 'default';
      }
    }
    
    class LowValueNode extends Node {
      post(shared: Record<string, any>, prepRes: any, execRes: any) {
        shared.result = 'low value';
        return 'default';
      }
    }
    
    // Create and connect nodes
    const decisionNode = new DecisionNode();
    const highValueNode = new HighValueNode();
    const lowValueNode = new LowValueNode();
    
    decisionNode.addSuccessor(highValueNode, 'high');
    decisionNode.addSuccessor(lowValueNode, 'low');
    
    // Create flow
    const flow = new Flow(decisionNode);
    
    // Run flow with low value
    flow.run(shared);
    expect(shared.result).toBe('low value');
    
    // Run flow with high value
    shared.value = 15;
    flow.run(shared);
    expect(shared.result).toBe('high value');
  });
});
