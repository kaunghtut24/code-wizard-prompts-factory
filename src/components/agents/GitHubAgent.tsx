
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, GitCommit, GitPullRequest, GitMerge, FileText } from 'lucide-react';

interface GitHubAgentProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const GitHubAgent: React.FC<GitHubAgentProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-gray-700" />
          GitHub Repository Assistant
        </CardTitle>
        <CardDescription>
          Automated repository management, commits, and collaboration workflows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Git Operations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <GitCommit className="h-6 w-6 text-blue-500" />
            <div>
              <h4 className="font-semibold text-sm">Commits</h4>
              <p className="text-xs text-muted-foreground">Smart messaging</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <GitBranch className="h-6 w-6 text-green-500" />
            <div>
              <h4 className="font-semibold text-sm">Branches</h4>
              <p className="text-xs text-muted-foreground">Feature workflows</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <GitPullRequest className="h-6 w-6 text-purple-500" />
            <div>
              <h4 className="font-semibold text-sm">Pull Requests</h4>
              <p className="text-xs text-muted-foreground">Auto-generated</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <GitMerge className="h-6 w-6 text-orange-500" />
            <div>
              <h4 className="font-semibold text-sm">Merges</h4>
              <p className="text-xs text-muted-foreground">Conflict resolution</p>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            System Prompt Template
          </h4>
          <div className="text-xs font-mono bg-white p-3 rounded border max-h-60 overflow-y-auto">
            <div className="text-green-600"># GitHub Repository Assistant Agent System Prompt</div>
            <div className="mt-2">
              <div className="text-blue-600">You are a GitHub Repository Assistant Agent.</div>
              <br />
              <div className="text-blue-600">Context:</div>
              <div>The user is working with a connected GitHub repository and needs help with Git operations.</div>
              <br />
              <div className="text-blue-600">Instructions:</div>
              <div>1. **Repository Analysis:**</div>
              <div>   - Fetch latest repository state</div>
              <div>   - Analyze file changes and modifications</div>
              <div>   - Identify changed, added, and deleted files</div>
              <div>   - Review commit history and branch status</div>
              <br />
              <div>2. **Smart Commit Operations:**</div>
              <div>   - Generate meaningful commit messages based on file diffs</div>
              <div>   - Follow conventional commit format (feat:, fix:, docs:, etc.)</div>
              <div>   - Stage appropriate files for commit</div>
              <div>   - Include co-author information if collaborative</div>
              <br />
              <div>3. **Pull Request Management:**</div>
              <div>   - Create descriptive PR titles and descriptions</div>
              <div>   - Summarize changes and their impact</div>
              <div>   - Suggest reviewers based on file ownership</div>
              <div>   - Add appropriate labels and milestones</div>
              <br />
              <div>4. **Branch Management:**</div>
              <div>   - Suggest branch naming conventions</div>
              <div>   - Handle merge conflicts intelligently</div>
              <div>   - Recommend branching strategies</div>
              <br />
              <div className="text-blue-600">Output format:</div>
              <div>**REPOSITORY STATUS:**</div>
              <div>- Current branch and status</div>
              <div>- Modified files summary</div>
              <div>- Pending changes overview</div>
              <br />
              <div>**RECOMMENDED ACTIONS:**</div>
              <div>- Git commands to execute</div>
              <div>- Commit message suggestions</div>
              <div>- PR title and description</div>
              <br />
              <div>**IMPACT ANALYSIS:**</div>
              <div>- Files affected by changes</div>
              <div>- Potential breaking changes</div>
              <div>- Testing recommendations</div>
            </div>
          </div>
        </div>

        {/* Workflow Templates */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Common Workflows</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <h5 className="font-medium text-sm">Feature Development</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Branch → Develop → Commit → Push → PR → Review → Merge
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
              <h5 className="font-medium text-sm">Hotfix Process</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Main → Hotfix Branch → Fix → Test → Merge → Tag
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
              <h5 className="font-medium text-sm">Release Management</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Release Branch → QA → Tag → Merge → Deploy
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
              <h5 className="font-medium text-sm">Code Review</h5>
              <p className="text-xs text-muted-foreground mt-1">
                PR Creation → Review → Feedback → Updates → Approval
              </p>
            </div>
          </div>
        </div>

        {/* Commit Message Types */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Conventional Commit Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline" className="justify-center">feat: ✨</Badge>
            <Badge variant="outline" className="justify-center">fix: 🐛</Badge>
            <Badge variant="outline" className="justify-center">docs: 📚</Badge>
            <Badge variant="outline" className="justify-center">style: 💄</Badge>
            <Badge variant="outline" className="justify-center">refactor: ♻️</Badge>
            <Badge variant="outline" className="justify-center">test: ✅</Badge>
            <Badge variant="outline" className="justify-center">chore: 🔧</Badge>
            <Badge variant="outline" className="justify-center">perf: ⚡</Badge>
          </div>
        </div>

        {/* Integration Features */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">GitHub Integration Features</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Automatic issue linking in commits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>AI-generated PR descriptions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Smart reviewer suggestions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Automated conflict resolution guidance</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubAgent;
