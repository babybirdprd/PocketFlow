// src/cookbook/map-reduce/nodes.ts
import { Node, BatchNode } from '../../pocketflow';
import { callLLM } from './utils';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

export class ReadResumesNode extends Node {
  /**
   * Map phase: Read all resumes from the data directory into shared storage.
   */
  
  async exec(_: any): Promise<Record<string, string>> {
    const resumeFiles: Record<string, string> = {};
    const dataDir = path.join(__dirname, "data");
    
    const files = fs.readdirSync(dataDir);
    
    for (const filename of files) {
      if (filename.endsWith(".txt")) {
        const filePath = path.join(dataDir, filename);
        const content = fs.readFileSync(filePath, 'utf-8');
        resumeFiles[filename] = content;
      }
    }
    
    return resumeFiles;
  }
  
  post(shared: Record<string, any>, prepRes: any, execRes: Record<string, string>): string | null {
    shared["resumes"] = execRes;
    return "default";
  }
}

export class EvaluateResumesNode extends BatchNode {
  /**
   * Batch processing: Evaluate each resume to determine if the candidate qualifies.
   */
  
  prep(shared: Record<string, any>): any {
    return Object.entries(shared["resumes"]);
  }
  
  async exec(resumeItem: [string, string]): Promise<[string, any]> {
    /**
     * Evaluate a single resume.
     */
    const [filename, content] = resumeItem;
    
    const prompt = `
Evaluate the following resume and determine if the candidate qualifies for an advanced technical role.
Criteria for qualification:
- At least a bachelor's degree in a relevant field
- At least 3 years of relevant work experience
- Strong technical skills relevant to the position

Resume:
${content}

Return your evaluation in YAML format:
\`\`\`yaml
candidate_name: [Name of the candidate]
qualifies: [true/false]
reasons:
  - [First reason for qualification/disqualification]
  - [Second reason, if applicable]
\`\`\`
`;
    const response = await callLLM(prompt);
    
    // Extract YAML content
    const yamlContent = response.includes("```yaml") ? 
      response.split("```yaml")[1].split("```")[0].trim() : 
      response;
    
    const result = yaml.load(yamlContent) as any;
    
    return [filename, result];
  }
  
  post(shared: Record<string, any>, prepRes: any, execResList: [string, any][]): string | null {
    shared["evaluations"] = Object.fromEntries(execResList);
    return "default";
  }
}

export class ReduceResultsNode extends Node {
  /**
   * Reduce node: Count and print out how many candidates qualify.
   */
  
  prep(shared: Record<string, any>): any {
    return shared["evaluations"];
  }
  
  exec(evaluations: Record<string, any>): any {
    let qualifiedCount = 0;
    const totalCount = Object.keys(evaluations).length;
    const qualifiedCandidates: string[] = [];
    
    for (const [filename, evaluation] of Object.entries(evaluations)) {
      if (evaluation?.qualifies) {
        qualifiedCount += 1;
        qualifiedCandidates.push(evaluation.candidate_name || "Unknown");
      }
    }
    
    const summary = {
      total_candidates: totalCount,
      qualified_count: qualifiedCount,
      qualified_percentage: totalCount > 0 ? Math.round(qualifiedCount / totalCount * 100 * 10) / 10 : 0,
      qualified_names: qualifiedCandidates
    };
    
    return summary;
  }
  
  post(shared: Record<string, any>, prepRes: any, execRes: any): string | null {
    shared["summary"] = execRes;
    
    console.log("\n===== Resume Qualification Summary =====");
    console.log(`Total candidates evaluated: ${execRes.total_candidates}`);
    console.log(`Qualified candidates: ${execRes.qualified_count} (${execRes.qualified_percentage}%)`);
    
    if (execRes.qualified_names.length > 0) {
      console.log("\nQualified candidates:");
      for (const name of execRes.qualified_names) {
        console.log(`- ${name}`);
      }
    }
    
    return "default";
  }
}
