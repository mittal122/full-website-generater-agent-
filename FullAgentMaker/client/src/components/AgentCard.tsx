import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export type AgentStatus = "pending" | "running" | "completed" | "error";

export interface AgentCardProps {
  name: string;
  description: string;
  status: AgentStatus;
  progress?: number;
  duration?: string;
  dependencies?: string[];
  error?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "bg-muted text-muted-foreground",
    label: "Pending"
  },
  running: {
    icon: Loader2,
    color: "bg-info text-white",
    label: "Running"
  },
  completed: {
    icon: CheckCircle,
    color: "bg-success text-white",
    label: "Completed"
  },
  error: {
    icon: AlertCircle,
    color: "bg-destructive text-destructive-foreground",
    label: "Error"
  }
};

export default function AgentCard({
  name,
  description,
  status,
  progress = 0,
  duration,
  dependencies = [],
  error
}: AgentCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card 
      className="relative overflow-hidden hover-elevate" 
      data-testid={`agent-card-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          <Badge className={config.color} data-testid={`status-${status}`}>
            <Icon className={`h-3 w-3 mr-1 ${status === 'running' ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {status === "running" && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-bar" />
          </div>
        )}
        
        {duration && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {duration}
          </div>
        )}
        
        {dependencies.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Dependencies:</p>
            <div className="flex flex-wrap gap-1">
              {dependencies.map((dep, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}