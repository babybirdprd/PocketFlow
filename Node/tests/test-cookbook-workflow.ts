// tests/test-cookbook-workflow.ts
import { Flow } from '../src/pocketflow';
import { createArticleFlow } from '../cookbook/workflow/flow';

// Mock the callLLM function to avoid actual API calls during tests
jest.mock('../cookbook/workflow/utils', () => ({
  callLLM: jest.fn().mockImplementation(async (prompt) => {
    if (prompt.includes('outline')) {
      return '```yaml\nsections:\n  - Introduction to AI in Healthcare\n  - Current Applications\n  - Future Potential\n```';
    } else if (prompt.includes('paragraph')) {
      return 'This is a mock paragraph about the section. It provides simple information in an easy-to-understand format.';
    } else if (prompt.includes('conversational')) {
      return 'This is a mock styled article with a conversational tone. It includes rhetorical questions and engaging content.';
    }
    return 'Default mock response';
  })
}));

describe('Cookbook Workflow Tests', () => {
  test('Article workflow should process a topic through all steps', async () => {
    // Create the article flow
    const articleFlow = createArticleFlow();
    
    // Create shared context with the topic
    const shared = {
      topic: "The benefits of artificial intelligence in healthcare"
    };
    
    // Run the flow
    await articleFlow.run(shared);
    
    // Check results
    expect(shared.outline_yaml).toBeDefined();
    expect(shared.sections).toHaveLength(3);
    expect(shared.section_contents).toBeDefined();
    expect(shared.draft).toBeDefined();
    expect(shared.final_article).toBeDefined();
  });
});
