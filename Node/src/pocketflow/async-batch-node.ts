// src/pocketflow/async-batch-node.ts
// AsyncBatchNode class implementation

import { AsyncNode } from './async-node';
import { BatchNode } from './batch-node';

/**
 * AsyncBatchNode class that processes items in a batch asynchronously
 */
export class AsyncBatchNode extends AsyncNode {
  /**
   * Internal asynchronous execution method that processes each item in the batch
   * @param items Array of items to process
   * @returns Promise resolving to array of execution results
   */
  protected async _exec(items: any[]): Promise<any[]> {
    const results = [];
    for (const item of (items || [])) {
      results.push(await super._exec(item));
    }
    return results;
  }
}
