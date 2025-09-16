import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export interface PipelineStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
  progress?: number;
  description?: string;
  duration?: string;
  error?: string;
}

export interface ProgressPipelineProps {
  steps: PipelineStep[];
  currentStep?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Pending"
  },
  running: {
    icon: Loader2,
    color: "text-info",
    bgColor: "bg-info/10",
    label: "Running"
  },
  completed: {
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "Completed"
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Error"
  }
};

export default function ProgressPipeline({ steps, currentStep }: ProgressPipelineProps) {
  const getStepIndex = (stepId: string) => steps.findIndex(step => step.id === stepId);
  const currentIndex = currentStep ? getStepIndex(currentStep) : -1;

  return (
    <Card data-testid="progress-pipeline">
      <CardContent className="p-6">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const config = statusConfig[step.status];
            const Icon = config.icon;
            const isActive = step.id === currentStep;
            const isConnected = index < steps.length - 1;

            return (
              <div key={step.id} className="relative">
                <div className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                  isActive ? config.bgColor + " ring-2 ring-primary/20" : "hover-elevate"
                }`} data-testid={`pipeline-step-${step.id}`}>
                  
                  {/* Step Icon */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.status === 'completed' ? 'border-success bg-success text-white' :
                    step.status === 'running' ? 'border-info bg-info text-white' :
                    step.status === 'error' ? 'border-destructive bg-destructive text-white' :
                    'border-muted-foreground/30 bg-muted'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      step.status === 'running' ? 'animate-spin' : ''
                    }`} />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{step.name}</h3>
                      <div className="flex items-center gap-2">
                        {step.duration && (
                          <span className="text-xs text-muted-foreground">
                            {step.duration}
                          </span>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${config.color}`}
                          data-testid={`status-badge-${step.status}`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    {step.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {step.description}
                      </p>
                    )}

                    {step.status === "running" && step.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    )}

                    {step.error && (
                      <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive">{step.error}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connection Line */}
                {isConnected && (
                  <div className="flex justify-center">
                    <div className={`w-px h-4 ${
                      index < currentIndex || (step.status === 'completed' && steps[index + 1].status !== 'pending')
                        ? 'bg-success' 
                        : 'bg-border'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
            </span>
          </div>
          <Progress 
            value={(steps.filter(s => s.status === 'completed').length / steps.length) * 100} 
            className="h-2"
            data-testid="overall-progress"
          />
        </div>
      </CardContent>
    </Card>
  );
}