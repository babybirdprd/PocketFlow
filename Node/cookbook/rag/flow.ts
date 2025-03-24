// src/cookbook/rag/flow.ts
import { Flow } from '../../pocketflow';
import { EmbedDocumentsNode, CreateIndexNode, EmbedQueryNode, RetrieveDocumentNode } from './nodes';

/**
 * Get offline flow for document indexing
 */
export function getOfflineFlow(): Flow {
  // Create offline flow for document indexing
  const embedDocsNode = new EmbedDocumentsNode();
  const createIndexNode = new CreateIndexNode();
  embedDocsNode.addSuccessor(createIndexNode);
  const offlineFlow = new Flow(embedDocsNode);
  return offlineFlow;
}

/**
 * Get online flow for document retrieval
 */
export function getOnlineFlow(): Flow {
  // Create online flow for document retrieval
  const embedQueryNode = new EmbedQueryNode();
  const retrieveDocNode = new RetrieveDocumentNode();
  embedQueryNode.addSuccessor(retrieveDocNode);
  const onlineFlow = new Flow(embedQueryNode);
  return onlineFlow;
}

// Initialize flows
export const offlineFlow = getOfflineFlow();
