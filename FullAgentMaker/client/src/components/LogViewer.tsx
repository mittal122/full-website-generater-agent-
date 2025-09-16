import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Download, Trash2, Pause, Play } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  agent: string;
  message: string;
}

export interface LogViewerProps {
  logs: LogEntry[];
  isLive?: boolean;
  onToggleLive?: () => void;
  onClear?: () => void;
  onDownload?: () => void;
}

const levelColors = {
  info: "bg-info text-white",
  warn: "bg-warning text-white", 
  error: "bg-destructive text-destructive-foreground",
  success: "bg-success text-white"
};

export default function LogViewer({ 
  logs, 
  isLive = true, 
  onToggleLive,
  onClear,
  onDownload
}: LogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, shouldAutoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShouldAutoScroll(isAtBottom);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="h-full flex flex-col" data-testid="log-viewer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Live Logs
            {isLive && (
              <Badge variant="outline" className="text-xs animate-pulse">
                LIVE
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleLive}
              data-testid="button-toggle-live"
            >
              {isLive ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Resume
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              data-testid="button-download-logs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              data-testid="button-clear-logs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea 
          className="h-full px-6 pb-6" 
          ref={scrollRef}
          onScrollCapture={handleScroll}
        >
          <div className="space-y-2 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No logs to display. Start a project to see agent activity.
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-3 py-2 hover-elevate rounded-sm px-2 -mx-2"
                  data-testid={`log-entry-${log.level}`}
                >
                  <span className="text-xs text-muted-foreground shrink-0 w-16">
                    {formatTime(log.timestamp)}
                  </span>
                  
                  <Badge 
                    className={`${levelColors[log.level]} text-xs shrink-0 w-16 justify-center`}
                  >
                    {log.level.toUpperCase()}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs shrink-0">
                    {log.agent}
                  </Badge>
                  
                  <span className="text-foreground break-words flex-1">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}