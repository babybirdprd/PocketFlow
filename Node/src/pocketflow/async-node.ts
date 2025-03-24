// src/pocketflow/async-node.ts
// AsyncNode class implementation

import { Node } from './node';

/**
 * Interface for shared context passed between nodes
 */
interface SharedContext {
  [key: string]: any;
}

/**
 * AsyncNode class that supports asynchronous operations
 */
export class AsyncNode extends Node {
  /**
   * Synchronous preparation step - not applicable for AsyncNode
   * @throws Error AsyncNode requires async methods
   */
  prep(shared: SharedContext): never {
    throw new Error("Use prepAsync.");
  }

  /**
   * Synchronous execution step - not applicable for AsyncNode
   * @throws Error AsyncNode requires async methods
   */
  exec(prepRes: any): never {
    throw new Error("Use execAsync.");
  }

  /**
   * Synchronous post-execution step - not applicable for AsyncNode
   * @throws Error AsyncNode requires async methods
   */
  post(shared: SharedContext, prepRes: any, execRes: any): never {
    throw new Error("Use postAsync.");
  }

  /**
   * Synchronous fallback execution - not applicable for AsyncNode
   * @throws Error AsyncNode requires async methods
   */
  execFallback(prepRes: any, exc: Error): never {
    throw new Error("Use execFallbackAsync.");
  }

  /**
   * Synchronous run method - not applicable for AsyncNode
   * @throws Error AsyncNode requires async methods
   */
  protected _run(shared: SharedContext): never {
    throw new Error("Use runAsync.");
  }

  /**
   * Asynchronous preparation step
   * @param shared Shared context
   * @returns Promise resolving to preparation result
   */
  async prepAsync(shared: SharedContext): Promise<any> {
    return null;
  }

  /**
   * Asynchronous execution step
   * @param prepRes Result from preparation step
   * @returns Promise resolving to execution result
   */
  async execAsync(prepRes: any): Promise<any> {
    return null;
  }

  /**
   * Asynchronous fallback execution method
   * @param prepRes Result from preparation step
   * @param exc Exception that caused the failure
   * @returns Promise resolving to fallback result
   */
  async execFallbackAsync(prepRes: any, exc: Error): Promise<any> {
    throw exc;
  }

  /**
   * Asynchronous post-execution step
   * @param shared Shared context
   * @param prepRes Result from preparation step
   * @param execRes Result from execution step
   * @returns Promise resolving to post-execution result
   */
  async postAsync(shared: SharedContext, prepRes: any, execRes: any): Promise<string | null> {
    return null;
  }

  /**
   * Internal asynchronous execution method with retry logic
   * @param prepRes Result from preparation step
   * @returns Promise resolving to execution result
   */
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

  /**
   * Run the async node
   * @param shared Shared context
   * @returns Promise resolving to result from post step
   */
  async runAsync(shared: SharedContext): Promise<string | null> {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Node won't run successors. Use AsyncFlow.");
    }
    return await this._runAsync(shared);
  }

  /**
   * Internal run method that orchestrates async prep, exec, and post steps
   * @param shared Shared context
   * @returns Promise resolving to result from post step
   */
  protected async _runAsync(shared: SharedContext): Promise<string | null> {
    const prepRes = await this.prepAsync(shared);
    const execRes = await this._exec(prepRes);
    return await this.postAsync(shared, prepRes, execRes);
  }
}
