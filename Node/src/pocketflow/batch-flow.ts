// src/pocketflow/batch-flow.ts
// BatchFlow class implementation

import { Flow } from './flow';
import { BaseNode } from './base-node';

/**
 * Interface for shared context passed between nodes
 */
interface SharedContext {
  [key: string]: any;
}

/**
 * BatchFlow class that processes batches of items through a flow
 */
export class BatchFlow extends Flow {
  /**
   * Run the batch flow
   * @param shared Shared context
   * @returns Result from post step
   */
  protected _run(shared: SharedContext): string | null {
    const prepRes = this.prep(shared) || [];
    
    for (const batchParams of prepRes) {
      this._orch(shared, { ...this.params, ...batchParams });
    }
    
    return this.post(shared, prepRes, null);
  }
}
