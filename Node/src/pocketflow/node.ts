// src/pocketflow/node.ts
// Node class implementation with retry mechanism

import { BaseNode } from './base-node';

/**
 * Node class that extends BaseNode with retry capabilities
 */
export class Node extends BaseNode {
  protected maxRetries: number;
  protected wait: number;
  protected curRetry: number;

  /**
   * Create a new Node
   * @param maxRetries Maximum number of retry attempts (default: 1)
   * @param wait Wait time in milliseconds between retries (default: 0)
   */
  constructor(maxRetries: number = 1, wait: number = 0) {
    super();
    this.maxRetries = maxRetries;
    this.wait = wait;
    this.curRetry = 0;
  }

  /**
   * Fallback execution method called when all retries are exhausted
   * @param prepRes Result from preparation step
   * @param exc Exception that caused the failure
   * @returns Fallback result
   */
  execFallback(prepRes: any, exc: Error): any {
    throw exc;
  }

  /**
   * Internal execution method with retry logic
   * @param prepRes Result from preparation step
   * @returns Execution result or fallback result
   */
  protected _exec(prepRes: any): any {
    for (this.curRetry = 0; this.curRetry < this.maxRetries; this.curRetry++) {
      try {
        return this.exec(prepRes);
      } catch (e) {
        if (this.curRetry === this.maxRetries - 1) {
          return this.execFallback(prepRes, e as Error);
        }
        if (this.wait > 0) {
          // In JavaScript, we need to handle sleep differently than Python
          // For synchronous code, we use a blocking sleep
          const start = new Date().getTime();
          while (new Date().getTime() - start < this.wait) {
            // Empty block to simulate sleep
          }
        }
      }
    }
  }
}
