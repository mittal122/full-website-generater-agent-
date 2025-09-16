import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  FileCode, 
  FolderIcon, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Copy,
  Check,
  Eye
} from "lucide-react";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  language?: string;
  children?: FileNode[];
  size?: string;
}

export interface CodePreviewProps {
  files: FileNode[];
  selectedFile?: string;
  onFileSelect?: (path: string) => void;
  onDownload?: () => void;
}

export default function CodePreview({ 
  files, 
  selectedFile,
  onFileSelect,
  onDownload
}: CodePreviewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]));
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
      console.log(`Copied ${fileName} to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript', 
      'tsx': 'typescript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'php': 'php'
    };
    return langMap[ext || ''] || 'text';
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        {node.type === "folder" ? (
          <Collapsible 
            open={expandedFolders.has(node.path)}
            onOpenChange={() => toggleFolder(node.path)}
          >
            <CollapsibleTrigger 
              className="flex items-center gap-2 w-full p-2 hover-elevate rounded-sm text-left"
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              data-testid={`folder-${node.name}`}
            >
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <FolderIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{node.name}</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {node.children && renderFileTree(node.children, depth + 1)}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Button
            variant="ghost"
            className={`w-full justify-start p-2 h-auto ${
              selectedFile === node.path ? 'bg-accent' : ''
            }`}
            style={{ paddingLeft: `${depth * 16 + 24}px` }}
            onClick={() => onFileSelect?.(node.path)}
            data-testid={`file-${node.name}`}
          >
            <FileCode className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">{node.name}</span>
            {node.size && (
              <Badge variant="outline" className="ml-auto text-xs">
                {node.size}
              </Badge>
            )}
          </Button>
        )}
      </div>
    ));
  };

  const selectedFileNode = selectedFile ? 
    files.flatMap(f => f.type === 'folder' ? f.children || [] : [f])
         .find(f => f.path === selectedFile) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* File Explorer */}
      <Card className="lg:col-span-1" data-testid="file-explorer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Project Files</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDownload}
              data-testid="button-download-project"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="px-4 pb-4">
              {renderFileTree(files)}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="lg:col-span-2" data-testid="code-editor">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {selectedFileNode ? (
                <>
                  <FileCode className="h-5 w-5" />
                  {selectedFileNode.name}
                  <Badge variant="outline" className="text-xs">
                    {getLanguageFromExtension(selectedFileNode.name)}
                  </Badge>
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5" />
                  Code Preview
                </>
              )}
            </CardTitle>
            
            {selectedFileNode?.content && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(selectedFileNode.content!, selectedFileNode.name)}
                data-testid="button-copy-code"
              >
                {copiedFile === selectedFileNode.name ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {selectedFileNode?.content ? (
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                <code>{selectedFileNode.content}</code>
              </pre>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Select a file from the explorer to view its contents
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}