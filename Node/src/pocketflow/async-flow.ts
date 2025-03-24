// src/pocketflow/async-flow.ts
// AsyncFlow class implementation

import { Flow } from './flow';
import { AsyncNode } from './async-node';
import { BaseNode } from './base-node';

/**
 * Interface for shared context passed between nodes
 */
interface SharedContext {
  [key: string]: any;
}

/**
 * AsyncFlow class that orchestrates execution of connected nodes with async support
 */
export class AsyncFlow extends Flow implements AsyncNode {
  // Implementing required AsyncNode methods
  prep(shared: SharedContext): never {
    throw new Error("Use prepAsync.");
  }

  exec(prepRes: any): never {
    throw new Error("Use execAsync.");
  }

  post(shared: SharedContext, prepRes: any, execRes: any): never {
    throw new Error("Use postAsync.");
  }

  execFallback(prepRes: any, exc: Error): never {
    throw new Error("Use execFallbackAsync.");
  }

  protected _run(shared: SharedContext): never {
    throw new Error("Use runAsync.");
  }

  async prepAsync(shared: SharedContext): Promise<any> {
    return null;
  }

  async execAsync(prepRes: any): Promise<any> {
    return null;
  }

  async execFallbackAsync(prepRes: any, exc: Error): Promise<any> {
    throw exc;
  }

  async postAsync(shared: SharedContext, prepRes: any, execRes: any): Promise<string | null> {
    return null;
  }

  protected async _exec(prepRes: any): Promise<any> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.execAsync(prepRes);
      } catch (e) {
        if (i === this.maxRetries - 1) {
          return await this.execFallbackAsync(prepRes, e as Error);
        }
        if (this.wait > 0) {
          await new Promise(resolve => setTimeout(resolve, this.wait));
        }
      }
    }
  }

  async runAsync(shared: SharedContext): Promise<string | null> {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Node won't run successors. Use AsyncFlow.");
    }
    return await this._runAsync(shared);
  }

  /**
   * Orchestrate the flow execution asynchronously
   * @param shared Shared context
   * @param params Optional parameters to pass to nodes
   */
  protected async _orchAsync(shared: SharedContext, params: Record<string, any> = {}): Promise<void> {
    let curr: BaseNode | null = Object.assign(Object.create(Object.getPrototypeOf(this.start)), this.start);
    const p = { ...this.params, ...params };
    
    while (curr) {
      curr.setParams(p);
      
      let result: string | null;
      if (curr instanceof AsyncNode) {
        result = await curr._runAsync(shared);
      } else {
        result = curr._run(shared);
      }
      
      const nextNode = this.getNextNode(curr, result);
      curr = nextNode ? Object.assign(Object.create(Object.getPrototypeOf(nextNode)), nextNode) : null;
    }
  }

  /**
   * Internal run method that orchestrates async prep, exec, and post steps
   * @param shared Shared context
   * @returns Promise resolving to result from post step
   */
  protected async _runAsync(shared: SharedContext): Promise<string | null> {
    const prepRes = await this.prepAsync(shared);
    await this._orchAsync(shared);
    return await this.postAsync(shared, prepRes, null);
  }
}
