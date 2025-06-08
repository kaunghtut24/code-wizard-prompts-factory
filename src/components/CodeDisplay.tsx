
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Code2, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeDisplayProps {
  content: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  content,
  language = 'javascript',
  title,
  showLineNumbers = true,
  maxHeight = '400px'
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Code Copied",
        description: "Code has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  const lines = content.split('\n');

  return (
    <Card className="my-4 border-l-4 border-l-blue-500 bg-slate-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold">
              {title || 'Code Snippet'}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="relative bg-gray-900 rounded-lg overflow-hidden"
          style={{ maxHeight }}
        >
          <div className="overflow-auto p-4">
            <pre className="text-sm">
              <code className="text-gray-100 font-mono">
                {showLineNumbers ? (
                  lines.map((line, index) => (
                    <div key={index} className="flex">
                      <span className="text-gray-500 text-xs mr-4 select-none w-8 text-right">
                        {index + 1}
                      </span>
                      <span className="flex-1">{line}</span>
                    </div>
                  ))
                ) : (
                  content
                )}
              </code>
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeDisplay;
