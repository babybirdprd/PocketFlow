// src/pocketflow/async-parallel-batch-flow.ts
// AsyncParallelBatchFlow class implementation

import { AsyncFlow } from './async-flow';
import { BatchFlow } from './batch-flow';

/**
 * Interface for shared context passed between nodes
 */
interface SharedContext {
  [key: string]: any;
}

/**
 * AsyncParallelBatchFlow class that processes batches of items through a flow in parallel
 */
export class AsyncParallelBatchFlow extends AsyncFlow {
  /**
   * Run the async parallel batch flow
   * @param shared Shared context
   * @returns Promise resolving to result from post step
   */
  protected async _runAsync(shared: SharedContext): Promise<string | null> {
    const prepRes = await this.prepAsync(shared) || [];
    
    // Process all batch items in parallel
    const promises = prepRes.map(batchParams => 
      this._orchAsync(shared, { ...this.params, ...batchParams })
    );
    
    await Promise.all(promises);
    
    return await this.postAsync(shared, prepRes, null);
  }
}
