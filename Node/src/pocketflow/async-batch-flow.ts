// src/pocketflow/async-batch-flow.ts
// AsyncBatchFlow class implementation

import { AsyncFlow } from './async-flow';
import { BatchFlow } from './batch-flow';

/**
 * Interface for shared context passed between nodes
 */
interface SharedContext {
  [key: string]: any;
}

/**
 * AsyncBatchFlow class that processes batches of items through a flow asynchronously
 */
export class AsyncBatchFlow extends AsyncFlow {
  /**
   * Run the async batch flow
   * @param shared Shared context
   * @returns Promise resolving to result from post step
   */
  protected async _runAsync(shared: SharedContext): Promise<string | null> {
    const prepRes = await this.prepAsync(shared) || [];
    
    for (const batchParams of prepRes) {
      await this._orchAsync(shared, { ...this.params, ...batchParams });
    }
    
    return await this.postAsync(shared, prepRes, null);
  }
}
