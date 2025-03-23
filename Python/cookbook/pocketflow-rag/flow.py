from pocketflow import Flow
from nodes import EmbedDocumentsNode, CreateIndexNode, EmbedQueryNode, RetrieveDocumentNode

def get_offline_flow():
    # Create offline flow for document indexing
    embed_docs_node = EmbedDocumentsNode()
    create_index_node = CreateIndexNode()
    embed_docs_node >> create_index_node
    offline_flow = Flow(start=embed_docs_node)
    return offline_flow

def get_online_flow():
    # Create online flow for document retrieval
    embed_query_node = EmbedQueryNode()
    retrieve_doc_node = RetrieveDocumentNode()
    embed_query_node >> retrieve_doc_node
    online_flow = Flow(start=embed_query_node)
    return online_flow

# Initialize flows
offline_flow = get_offline_flow()
online_flow = get_online_flow() 