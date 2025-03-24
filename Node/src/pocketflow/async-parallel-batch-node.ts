// src/pocketflow/async-parallel-batch-node.ts
// AsyncParallelBatchNode class implementation

import { AsyncNode } from './async-node';
import { BatchNode } from './batch-node';

/**
 * AsyncParallelBatchNode class that processes items in a batch in parallel
 */
export class AsyncParallelBatchNode extends AsyncNode {
  /**
   * Internal asynchronous execution method that processes each item in the batch in parallel
   * @param items Array of items to process
   * @returns Promise resolving to array of execution results
   */
  protected async _exec(items: any[]): Promise<any[]> {
    const promises = (items || []).map(item => super._exec(item));
    return Promise.all(promises);
  }
}
