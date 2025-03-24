// src/cookbook/workflow/nodes.ts
import { Node } from '../../pocketflow/node';
import { callLLM } from './utils';
import * as yaml from 'js-yaml';

interface SharedContext {
  [key: string]: any;
}

export class GenerateOutline extends Node {
  prep(shared: SharedContext): any {
    return shared["topic"];
  }
  
  async exec(topic: string): Promise<any> {
    const prompt = `
Create a simple outline for an article about ${topic}.
Include at most 3 main sections (no subsections).

Output the sections in YAML format as shown below:

\`\`\`yaml
sections:
    - First section 
    - Second section
    - Third section
\`\`\``;
    
    const response = await callLLM(prompt);
    const yamlStr = response.split("```yaml")[1].split("```")[0].trim();
    const structuredResult = yaml.load(yamlStr) as any;
    return structuredResult;
  }
  
  post(shared: SharedContext, prepRes: any, execRes: any): string | null {
    // Store the structured data
    shared["outline_yaml"] = execRes;
    
    // Extract sections
    const sections = execRes["sections"];
    shared["sections"] = sections;
    
    // Format for display
    const formattedOutline = sections.map((section: string, i: number) => `${i+1}. ${section}`).join("\n");
    shared["outline"] = formattedOutline;
    
    // Display the results
    console.log("\n===== OUTLINE (YAML) =====\n");
    console.log(yaml.dump(execRes));
    console.log("\n===== PARSED OUTLINE =====\n");
    console.log(formattedOutline);
    console.log("\n=========================\n");
    
    return "default";
  }
}

export class WriteSimpleContent extends Node {
  prep(shared: SharedContext): any {
    // Get the list of sections to process
    return shared["sections"] || [];
  }
  
  async exec(sections: string[]): Promise<any> {
    const allSectionsContent: string[] = [];
    const sectionContents: Record<string, string> = {};
    
    for (const section of sections) {
      const prompt = `
Write a short paragraph (MAXIMUM 100 WORDS) about this section:

${section}

Requirements:
- Explain the idea in simple, easy-to-understand terms
- Use everyday language, avoiding jargon
- Keep it very concise (no more than 100 words)
- Include one brief example or analogy
`;
      const content = await callLLM(prompt);
      sectionContents[section] = content;
      allSectionsContent.push(`## ${section}\n\n${content}\n`);
    }
    
    return [sections, sectionContents, allSectionsContent.join("\n")];
  }
  
  post(shared: SharedContext, prepRes: any, execRes: any): string | null {
    const [sections, sectionContents, draft] = execRes;
    
    // Store the section contents and draft
    shared["section_contents"] = sectionContents;
    shared["draft"] = draft;
    
    console.log("\n===== SECTION CONTENTS =====\n");
    for (const section in sectionContents) {
      console.log(`--- ${section} ---`);
      console.log(sectionContents[section]);
      console.log();
    }
    console.log("===========================\n");
    
    return "default";
  }
}

export class ApplyStyle extends Node {
  prep(shared: SharedContext): any {
    /**
     * Get the draft from shared data
     */
    return shared["draft"];
  }
  
  async exec(draft: string): Promise<any> {
    /**
     * Apply a specific style to the article
     */
    const prompt = `
    Rewrite the following draft in a conversational, engaging style:
    
    ${draft}
    
    Make it:
    - Conversational and warm in tone
    - Include rhetorical questions that engage the reader
    - Add analogies and metaphors where appropriate
    - Include a strong opening and conclusion
    `;
    return await callLLM(prompt);
  }
  
  post(shared: SharedContext, prepRes: any, execRes: any): string | null {
    /**
     * Store the final article in shared data
     */
    shared["final_article"] = execRes;
    console.log("\n===== FINAL ARTICLE =====\n");
    console.log(execRes);
    console.log("\n========================\n");
    
    return "default";
  }
}
