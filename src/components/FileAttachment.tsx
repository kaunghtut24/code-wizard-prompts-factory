
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Paperclip, 
  FileText, 
  File, 
  X, 
  Upload,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

interface FileAttachmentProps {
  onFilesChange: (files: AttachedFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  onFilesChange,
  maxFiles = 3,
  maxSizePerFile = 10
}) => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-600" />;
    }
    if (type === 'text/plain') {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    if (type.includes('word')) {
      return <FileText className="h-4 w-4 text-blue-800" />;
    }
    return <File className="h-4 w-4 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      
      if (file.type === 'application/pdf') {
        // For PDFs, we'll read as text (basic extraction)
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    if (attachedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const newFiles: AttachedFile[] = [];

      for (const file of files) {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} - Only PDF, TXT, and DOC files are allowed`,
            variant: "destructive",
          });
          continue;
        }

        // Check file size
        if (file.size > maxSizePerFile * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} - Maximum ${maxSizePerFile}MB per file`,
            variant: "destructive",
          });
          continue;
        }

        try {
          const content = await readFileContent(file);
          newFiles.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            content: content
          });
        } catch (error) {
          toast({
            title: "File Read Error",
            description: `Failed to read ${file.name}`,
            variant: "destructive",
          });
        }
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...attachedFiles, ...newFiles];
        setAttachedFiles(updatedFiles);
        onFilesChange(updatedFiles);
        
        toast({
          title: "Files Attached",
          description: `${newFiles.length} file(s) attached successfully`,
        });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = attachedFiles.filter(file => file.id !== fileId);
    setAttachedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isUploading || attachedFiles.length >= maxFiles}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <Upload className="h-4 w-4 animate-pulse" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
          {isUploading ? 'Uploading...' : 'Attach Files'}
        </Button>
        
        <span className="text-xs text-muted-foreground">
          PDF, TXT, DOC (max {maxSizePerFile}MB each)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {attachedFiles.length > 0 && (
        <div className="space-y-2">
          {attachedFiles.map((file) => (
            <Card key={file.id} className="p-2">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {file.type === 'application/pdf' ? 'PDF' :
                       file.type === 'text/plain' ? 'TXT' :
                       file.type.includes('word') ? 'DOC' : 'FILE'}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {attachedFiles.length >= maxFiles && (
        <div className="flex items-center gap-1 text-xs text-amber-600">
          <AlertCircle className="h-3 w-3" />
          Maximum {maxFiles} files attached
        </div>
      )}
    </div>
  );
};

export default FileAttachment;
