# PocketFlowJS

PocketFlowJS is a TypeScript implementation of the [PocketFlow](https://github.com/The-Pocket/PocketFlow) framework, designed for building LLM applications with a focus on composability and reusability.

## Overview

PocketFlowJS provides a structured way to build complex LLM applications by composing nodes into flows. Each node represents a discrete step in your application logic, and flows connect these nodes to create complete applications.

## Core Components

- **BaseNode**: The foundation of all nodes in PocketFlowJS
- **Node**: Standard synchronous node for processing data
- **BatchNode**: Node for processing batches of data
- **Flow**: Container for connecting nodes and managing execution flow
- **BatchFlow**: Flow for processing batches of data
- **AsyncNode**: Node for asynchronous processing
- **AsyncBatchNode**: Node for asynchronous batch processing
- **AsyncParallelBatchNode**: Node for parallel asynchronous batch processing
- **AsyncFlow**: Flow for asynchronous execution
- **AsyncBatchFlow**: Flow for asynchronous batch processing
- **AsyncParallelBatchFlow**: Flow for parallel asynchronous batch processing

## Installation

```bash
npm install pocketflowjs
```

## Basic Usage

```typescript
import { Node, Flow } from 'pocketflowjs';

// Create a simple node
class GreetingNode extends Node {
  prep(shared: Record<string, any>): any {
    return shared.name;
  }
  
  exec(name: string): string {
    return `Hello, ${name}!`;
  }
  
  post(shared: Record<string, any>, prepRes: any, execRes: string): string | null {
    shared.greeting = execRes;
    return "default";
  }
}

// Create and run a flow
const node = new GreetingNode();
const flow = new Flow(node);

const shared = { name: "World" };
flow.run(shared);
console.log(shared.greeting); // "Hello, World!"
```

## Cookbook Examples

PocketFlowJS includes several cookbook examples demonstrating common LLM application patterns:

1. **Workflow**: Article writing workflow with planning, drafting, and editing
2. **Thinking**: Chain-of-thought reasoning for complex problem solving
3. **RAG**: Retrieval-Augmented Generation for knowledge-based responses
4. **Map-Reduce**: Processing and summarizing multiple documents
5. **Agent**: Research agent with search and answer capabilities
6. **Streaming**: LLM response streaming with user interruption
7. **Multi-Agent**: Collaborative agents communicating asynchronously
8. **Supervisor**: Quality control with supervisor monitoring agent outputs

## Node Lifecycle

Each node in PocketFlowJS follows a three-step lifecycle:

1. **Prep**: Prepare data from the shared context for execution
2. **Exec**: Execute the main logic of the node
3. **Post**: Process the results and update the shared context

## Connecting Nodes

Nodes can be connected to create flows using the `addSuccessor` method:

```typescript
// Connect nodes with default transition
nodeA.addSuccessor(nodeB);

// Connect nodes with conditional transition
nodeA.addSuccessor(nodeB, "condition1");
nodeA.addSuccessor(nodeC, "condition2");
```

## Asynchronous Processing

PocketFlowJS supports asynchronous processing with `AsyncNode` and related classes:

```typescript
import { AsyncNode, AsyncFlow } from 'pocketflowjs';

class AsyncGreetingNode extends AsyncNode {
  async prepAsync(shared: Record<string, any>): Promise<any> {
    return shared.name;
  }
  
  async execAsync(name: string): Promise<string> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Hello, ${name}!`;
  }
  
  async postAsync(shared: Record<string, any>, prepRes: any, execRes: string): Promise<string | null> {
    shared.greeting = execRes;
    return "default";
  }
}

// Create and run an async flow
const node = new AsyncGreetingNode();
const flow = new AsyncFlow(node);

const shared = { name: "World" };
await flow.runAsync(shared);
console.log(shared.greeting); // "Hello, World!"
```

## Batch Processing

For processing multiple items, use `BatchNode` and related classes:

```typescript
import { BatchNode, BatchFlow } from 'pocketflowjs';

class GreetingBatchNode extends BatchNode {
  prepBatch(shared: Record<string, any>): any[] {
    return shared.names;
  }
  
  execBatch(names: string[]): string[] {
    return names.map(name => `Hello, ${name}!`);
  }
  
  postBatch(shared: Record<string, any>, prepRes: any, execRes: string[]): string | null {
    shared.greetings = execRes;
    return "default";
  }
}
```

## Contributing

Contributions to PocketFlowJS are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for your changes
5. Submit a pull request

## License

PocketFlowJS is licensed under the MIT License.
