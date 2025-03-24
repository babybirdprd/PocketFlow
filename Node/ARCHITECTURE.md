# PocketFlowJS Architecture Documentation

## Overview

PocketFlowJS is a TypeScript implementation of the PocketFlow framework, designed for building LLM applications with a focus on composability and reusability. This document provides a comprehensive overview of the project architecture, design patterns, and implementation details.

## Project Structure

```
PocketFlowJS/
├── src/                      # Source code
│   ├── index.ts              # Main entry point
│   └── pocketflow/           # Core framework components
│       ├── index.ts          # Exports all components
│       ├── base-node.ts      # Base node implementation
│       ├── node.ts           # Standard node implementation
│       ├── batch-node.ts     # Batch processing node
│       ├── flow.ts           # Flow implementation
│       ├── batch-flow.ts     # Batch flow implementation
│       ├── async-node.ts     # Async node implementation
│       ├── async-batch-node.ts # Async batch node
│       ├── async-parallel-batch-node.ts # Parallel async batch node
│       ├── async-flow.ts     # Async flow implementation
│       ├── async-batch-flow.ts # Async batch flow
│       └── async-parallel-batch-flow.ts # Parallel async batch flow
├── cookbook/                 # Example implementations
│   ├── workflow/             # Article writing workflow
│   ├── thinking/             # Chain-of-thought reasoning
│   ├── rag/                  # Retrieval-Augmented Generation
│   ├── map-reduce/           # Map-reduce pattern
│   ├── agent/                # Agent pattern
│   ├── streaming/            # Streaming pattern
│   ├── multi-agent/          # Multi-agent pattern
│   └── supervisor/           # Supervisor pattern
├── tests/                    # Test cases
├── dist/                     # Compiled JavaScript (generated)
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest test configuration
├── README.md                 # Project documentation
└── .cursorrules              # Cursor rules for development
```

## Core Architecture

PocketFlowJS is built around the concept of nodes and flows. Nodes represent individual processing steps, while flows connect these nodes to create complete applications.

### Node Lifecycle

Each node in PocketFlowJS follows a three-step lifecycle:

1. **Prep**: Prepares data from the shared context for execution
2. **Exec**: Executes the main logic of the node
3. **Post**: Processes the results and updates the shared context

This lifecycle allows for clean separation of concerns and makes nodes highly reusable.

### Flow Control

Flows in PocketFlowJS manage the execution of nodes and the flow of data between them. Nodes can be connected with conditional transitions, allowing for complex application logic.

## Core Components

### BaseNode

`BaseNode` is the foundation of all nodes in PocketFlowJS. It defines the basic structure and interface for nodes, including:

- Successor management
- Parameter handling
- Execution flow

### Node

`Node` extends `BaseNode` and implements the standard synchronous node lifecycle:

- `prep(shared)`: Prepares data from the shared context
- `exec(prepResult)`: Executes the main logic
- `post(shared, prepResult, execResult)`: Processes results and updates the shared context

### BatchNode

`BatchNode` extends `Node` to support batch processing:

- `prepBatch(shared)`: Returns an iterable of items to process
- `execBatch(item)`: Processes a single item
- `postBatch(shared, prepResult, execResults)`: Processes all results

### Flow

`Flow` manages the execution of nodes:

- Tracks the current node
- Manages the shared context
- Handles transitions between nodes

### AsyncNode

`AsyncNode` extends `BaseNode` to support asynchronous processing:

- `prepAsync(shared)`: Asynchronously prepares data
- `execAsync(prepResult)`: Asynchronously executes logic
- `postAsync(shared, prepResult, execResult)`: Asynchronously processes results

### AsyncBatchNode

`AsyncBatchNode` combines asynchronous processing with batch processing:

- `prepBatchAsync(shared)`: Asynchronously returns an iterable
- `execBatchAsync(item)`: Asynchronously processes a single item
- `postBatchAsync(shared, prepResult, execResults)`: Asynchronously processes all results

### AsyncParallelBatchNode

`AsyncParallelBatchNode` extends `AsyncBatchNode` to process items in parallel:

- Uses `Promise.all` to process items concurrently
- Manages concurrency limits

### AsyncFlow, AsyncBatchFlow, AsyncParallelBatchFlow

These components are the asynchronous equivalents of `Flow`, `BatchFlow`, and parallel batch processing, supporting asynchronous execution patterns.

## Communication Patterns

### Shared Store

The shared store is a global data structure that all nodes can access. It's used for:

- Storing input data
- Sharing intermediate results
- Storing final output

Example:
```typescript
const shared = {
  user: { id: "user123", name: "John" },
  query: "How do I reset my password?",
  context: [],
  response: ""
};
```

### Params

Params are local parameters passed to nodes by the parent flow. They're primarily used in batch processing to identify the current item being processed.

Example:
```typescript
// In a BatchFlow
prepBatch(shared: Record<string, any>): Record<string, any>[] {
  return [
    { filename: "file1.txt" },
    { filename: "file2.txt" }
  ];
}
```

## Design Patterns

PocketFlowJS supports several common LLM application patterns:

### RAG (Retrieval-Augmented Generation)

RAG combines retrieval of relevant information with generative AI:

1. Retrieve relevant documents based on a query
2. Combine retrieved documents with the query
3. Generate a response using an LLM

### Map-Reduce

Map-Reduce processes data in parallel and then combines results:

1. Map: Process each item independently
2. Reduce: Combine the results

### Agent

Agents make decisions and take actions:

1. Observe the environment
2. Decide on an action
3. Execute the action
4. Observe the results
5. Repeat

### Multi-Agent

Multiple agents working together:

1. Agents communicate through a shared context
2. Each agent has its own decision-making process
3. Agents can run concurrently

### Supervisor

A supervisor monitors and controls other agents:

1. Agent performs a task
2. Supervisor evaluates the result
3. If the result is unsatisfactory, the agent tries again

## Cookbook Examples

The cookbook directory contains example implementations of common LLM application patterns:

### Workflow

An article writing workflow with planning, drafting, and editing:

1. Plan the article structure
2. Draft each section
3. Edit the complete article

### Thinking

Chain-of-thought reasoning for complex problem solving:

1. Break down the problem
2. Solve each part
3. Combine the solutions

### RAG

Retrieval-Augmented Generation for knowledge-based responses:

1. Retrieve relevant documents
2. Generate a response based on the documents

### Map-Reduce

Processing and summarizing multiple documents:

1. Process each document independently
2. Combine the results into a summary

### Agent

Research agent with search and answer capabilities:

1. Decide whether to search or answer
2. If search, retrieve information
3. If answer, generate a response

### Streaming

LLM response streaming with user interruption:

1. Generate a response incrementally
2. Allow the user to interrupt the generation

### Multi-Agent

Collaborative agents communicating asynchronously:

1. Agents communicate through a shared context
2. Each agent has its own decision-making process

### Supervisor

Quality control with supervisor monitoring agent outputs:

1. Agent generates a response
2. Supervisor evaluates the response
3. If the response is unsatisfactory, the agent tries again

## Implementation Details

### TypeScript Features

PocketFlowJS leverages TypeScript's type system to provide:

- Type safety for node inputs and outputs
- Interface definitions for nodes and flows
- Generic types for flexible implementation

### Asynchronous Processing

Asynchronous processing in PocketFlowJS is implemented using:

- Promises for asynchronous operations
- Async/await for cleaner asynchronous code
- Promise.all for parallel processing

### Error Handling

Error handling in PocketFlowJS includes:

- Try/catch blocks for synchronous code
- Promise rejection handling for asynchronous code
- Error propagation through the node lifecycle

## Testing

PocketFlowJS includes comprehensive tests for:

- Core components (nodes, flows)
- Batch processing
- Asynchronous processing
- Cookbook examples

Tests are implemented using Jest and can be run with:

```bash
npm test
```

## Deployment

PocketFlowJS can be deployed as:

- A Node.js package
- A component in a larger application
- A standalone application

## Conclusion

PocketFlowJS provides a flexible and powerful framework for building LLM applications. Its modular architecture, support for various processing patterns, and comprehensive examples make it suitable for a wide range of applications.
