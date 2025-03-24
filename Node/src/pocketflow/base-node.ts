// src/pocketflow/base-node.ts
// Base Node class implementation

/**
 * Interface for shared context passed between nodes
 */
interface SharedContext {
  [key: string]: any;
}

/**
 * Base Node class that provides the foundation for all node types
 */
export class BaseNode {
  protected params: Record<string, any>;
  protected successors: Record<string, BaseNode>;

  constructor() {
    this.params = {};
    this.successors = {};
  }

  /**
   * Set parameters for the node
   * @param params Parameters to set
   * @returns The node instance for chaining
   */
  setParams(params: Record<string, any>): this {
    this.params = { ...this.params, ...params };
    return this;
  }

  /**
   * Add a successor node for a specific action
   * @param node The successor node
   * @param action The action that triggers this successor (default: "default")
   * @returns The successor node for chaining
   */
  addSuccessor(node: BaseNode, action: string = "default"): BaseNode {
    if (this.successors[action]) {
      console.warn(`Overwriting successor for action '${action}'`);
    }
    this.successors[action] = node;
    return node;
  }

  /**
   * Preparation step before execution
   * @param shared Shared context
   * @returns Preparation result
   */
  prep(shared: SharedContext): any {
    return null;
  }

  /**
   * Execution step
   * @param prepRes Result from preparation step
   * @returns Execution result
   */
  exec(prepRes: any): any {
    return null;
  }

  /**
   * Post-execution step
   * @param shared Shared context
   * @param prepRes Result from preparation step
   * @param execRes Result from execution step
   * @returns Post-execution result, typically an action string
   */
  post(shared: SharedContext, prepRes: any, execRes: any): string | null {
    return null;
  }

  /**
   * Internal execution method
   * @param prepRes Result from preparation step
   * @returns Execution result
   */
  protected _exec(prepRes: any): any {
    return this.exec(prepRes);
  }

  /**
   * Internal run method that orchestrates prep, exec, and post steps
   * @param shared Shared context
   * @returns Result from post step
   */
  protected _run(shared: SharedContext): string | null {
    const prepRes = this.prep(shared);
    const execRes = this._exec(prepRes);
    return this.post(shared, prepRes, execRes);
  }

  /**
   * Run the node
   * @param shared Shared context
   * @returns Result from post step
   */
  run(shared: SharedContext): string | null {
    if (Object.keys(this.successors).length > 0) {
      console.warn("Node won't run successors. Use Flow.");
    }
    return this._run(shared);
  }

  /**
   * Operator overload for >> (add successor with default action)
   * @param other The successor node
   * @returns The successor node for chaining
   */
  [Symbol.for('>>')](other: BaseNode): BaseNode {
    return this.addSuccessor(other);
  }

  /**
   * Operator overload for - (create conditional transition)
   * @param action The action string
   * @returns A ConditionalTransition object
   */
  [Symbol.for('-')](action: string): ConditionalTransition {
    if (typeof action !== 'string') {
      throw new TypeError("Action must be a string");
    }
    return new ConditionalTransition(this, action);
  }
}

/**
 * Helper class for conditional transitions between nodes
 */
class ConditionalTransition {
  private src: BaseNode;
  private action: string;

  constructor(src: BaseNode, action: string) {
    this.src = src;
    this.action = action;
  }

  /**
   * Operator overload for >> (add successor with specified action)
   * @param tgt The target node
   * @returns The target node for chaining
   */
  [Symbol.for('>>')](tgt: BaseNode): BaseNode {
    return this.src.addSuccessor(tgt, this.action);
  }
}
