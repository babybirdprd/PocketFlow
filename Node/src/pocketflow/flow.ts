// src/pocketflow/flow.ts
// Flow class implementation

import { BaseNode } from './base-node';

/**
 * Interface for shared context passed between nodes
 */
interface SharedContext {
  [key: string]: any;
}

/**
 * Flow class that orchestrates execution of connected nodes
 */
export class Flow extends BaseNode {
  protected start: BaseNode;

  /**
   * Create a new Flow
   * @param start The starting node of the flow
   */
  constructor(start: BaseNode) {
    super();
    this.start = start;
  }

  /**
   * Get the next node based on the current node and action
   * @param curr Current node
   * @param action Action string from the current node's post step
   * @returns The next node or null if no successor is found
   */
  getNextNode(curr: BaseNode, action: string | null): BaseNode | null {
    const nextAction = action || "default";
    const next = curr.successors[nextAction];
    
    if (!next && Object.keys(curr.successors).length > 0) {
      console.warn(`Flow ends: '${nextAction}' not found in ${Object.keys(curr.successors)}`);
    }
    
    return next || null;
  }

  /**
   * Orchestrate the flow execution
   * @param shared Shared context
   * @param params Optional parameters to pass to nodes
   */
  protected _orch(shared: SharedContext, params: Record<string, any> = {}): void {
    let curr: BaseNode | null = Object.assign(Object.create(Object.getPrototypeOf(this.start)), this.start);
    const p = { ...this.params, ...params };
    
    while (curr) {
      curr.setParams(p);
      const result = curr._run(shared);
      const nextNode = this.getNextNode(curr, result);
      curr = nextNode ? Object.assign(Object.create(Object.getPrototypeOf(nextNode)), nextNode) : null;
    }
  }

  /**
   * Run the flow
   * @param shared Shared context
   * @returns Result from post step
   */
  protected _run(shared: SharedContext): string | null {
    const prepRes = this.prep(shared);
    this._orch(shared);
    return this.post(shared, prepRes, null);
  }

  /**
   * Execution step - not applicable for Flow
   * @throws RuntimeError Flow cannot execute directly
   */
  exec(): never {
    throw new Error("Flow can't exec.");
  }
}
