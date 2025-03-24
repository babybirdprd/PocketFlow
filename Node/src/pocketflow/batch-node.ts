// src/pocketflow/batch-node.ts
// BatchNode class implementation

import { Node } from './node';

/**
 * BatchNode class that processes items in a batch
 */
export class BatchNode extends Node {
  /**
   * Internal execution method that processes each item in the batch
   * @param items Array of items to process
   * @returns Array of execution results
   */
  protected _exec(items: any[]): any[] {
    return (items || []).map(item => super._exec(item));
  }
}
