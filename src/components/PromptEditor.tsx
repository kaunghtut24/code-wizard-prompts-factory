
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { promptService } from '@/services/promptService';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Save, FileText } from 'lucide-react';

interface PromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  agentType: string;
  agentName: string;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  isOpen,
  onClose,
  agentType,
  agentName
}) => {
  const [prompt, setPrompt] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && agentType) {
      const customPrompt = promptService.getCustomPrompt(agentType);
      if (customPrompt) {
        setPrompt(customPrompt);
        setIsCustom(true);
      } else {
        setPrompt(promptService.getDefaultPrompt(agentType));
        setIsCustom(false);
      }
    }
  }, [isOpen, agentType]);

  const handleSave = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Invalid Prompt",
        description: "Prompt cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      promptService.savePrompt(agentType, prompt);
      setIsCustom(true);
      
      toast({
        title: "Prompt Saved",
        description: `Custom prompt saved for ${agentName}`,
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save the prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultPrompt = promptService.getDefaultPrompt(agentType);
    setPrompt(defaultPrompt);
    promptService.resetToDefault(agentType);
    setIsCustom(false);
    
    toast({
      title: "Prompt Reset",
      description: `Reset to default prompt for ${agentName}`,
    });
  };

  const wordCount = prompt.split(' ').filter(word => word.length > 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit System Prompt - {agentName}
          </DialogTitle>
          <DialogDescription>
            Customize the system prompt for this agent. Changes will be saved locally and used for all future interactions.
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={isCustom ? "default" : "secondary"}>
              {isCustom ? "Custom Prompt" : "Default Prompt"}
            </Badge>
            <Badge variant="outline">
              {wordCount} words
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your system prompt here..."
            className="min-h-[400px] font-mono text-sm resize-none"
          />
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isCustom}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Prompt"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptEditor;
