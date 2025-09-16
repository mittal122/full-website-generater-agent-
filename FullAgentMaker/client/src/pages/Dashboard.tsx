import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AgentCard from "@/components/AgentCard";
import ProgressPipeline from "@/components/ProgressPipeline";
import LogViewer from "@/components/LogViewer";
import CodePreview from "@/components/CodePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Square, RotateCcw, Download } from "lucide-react";
import type { AgentStatus } from "@/components/AgentCard";
import type { PipelineStep } from "@/components/ProgressPipeline";
import type { LogEntry } from "@/components/LogViewer";
import type { FileNode } from "@/components/CodePreview";

export interface ProjectStatus {
  id: string;
  name: string;
  status: "running" | "paused" | "completed" | "error";
  startTime: string;
  agents: Array<{
    name: string;
    status: AgentStatus;
    progress?: number;
    duration?: string;
    error?: string;
  }>;
}

export interface DashboardProps {
  project: ProjectStatus;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onDownload?: () => void;
}

export default function Dashboard({ 
  project, 
  onPause,
  onResume, 
  onStop,
  onRestart,
  onDownload
}: DashboardProps) {
  const [selectedFile, setSelectedFile] = useState<string>("/src/App.tsx");

  //todo: remove mock functionality
  const mockPipelineSteps: PipelineStep[] = [
    {
      id: "requirement",
      name: "Requirement Analysis",
      status: "completed",
      description: "Parse user prompt and create structured project plan",
      duration: "2.3s"
    },
    {
      id: "frontend",
      name: "Frontend Development", 
      status: "running",
      description: "Generate React components and user interface",
      progress: 75
    },
    {
      id: "backend",
      name: "Backend Development",
      status: "pending", 
      description: "Create server-side logic and API endpoints"
    },
    {
      id: "validation",
      name: "Code Validation",
      status: "pending",
      description: "Review and test generated code for errors"
    },
    {
      id: "packaging", 
      name: "Project Packaging",
      status: "pending",
      description: "Bundle project for local deployment"
    }
  ];

  const mockLogs: LogEntry[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 10000).toISOString(),
      level: "info",
      agent: "Requirement",
      message: "Starting analysis of user prompt..."
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 8000).toISOString(), 
      level: "success",
      agent: "Requirement",
      message: "Successfully parsed project requirements. Identified 5 key features."
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 6000).toISOString(),
      level: "info", 
      agent: "Frontend",
      message: "Generating React components based on requirements..."
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 4000).toISOString(),
      level: "warn",
      agent: "Frontend",
      message: "Complex component detected. Breaking into smaller modules."
    }
  ];

  const mockFiles: FileNode[] = [
    {
      name: "src",
      type: "folder",
      path: "/src", 
      children: [
        {
          name: "App.tsx",
          type: "file",
          path: "/src/App.tsx",
          size: "2.1 KB",
          content: `import React from 'react';
import Header from './components/Header';
import TaskList from './components/TaskList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8">
        <TaskList />
      </main>
    </div>
  );
}

export default App;`
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card data-testid="project-header">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge 
                  variant={project.status === 'running' ? 'default' : 'secondary'}
                  className="capitalize"
                  data-testid={`project-status-${project.status}`}
                >
                  {project.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Started {new Date(project.startTime).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {project.status === 'running' ? (
                <Button 
                  variant="outline" 
                  onClick={onPause}
                  data-testid="button-pause"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={onResume}
                  data-testid="button-resume"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={onRestart}
                data-testid="button-restart"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onStop}
                data-testid="button-stop"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
              
              <Button 
                onClick={onDownload}
                data-testid="button-download-project"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="agents" data-testid="tab-agents">Agents</TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">Logs</TabsTrigger>
          <TabsTrigger value="code" data-testid="tab-code">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProgressPipeline 
            steps={mockPipelineSteps}
            currentStep="frontend"
          />
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.agents.map((agent, index) => (
              <AgentCard
                key={index}
                name={agent.name}
                description={getAgentDescription(agent.name)}
                status={agent.status}
                progress={agent.progress}
                duration={agent.duration}
                error={agent.error}
                dependencies={getAgentDependencies(agent.name)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <LogViewer 
            logs={mockLogs}
            onToggleLive={() => console.log('Toggle live logs')}
            onClear={() => console.log('Clear logs')}
            onDownload={() => console.log('Download logs')}
          />
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <CodePreview 
            files={mockFiles}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onDownload={() => console.log('Download project files')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getAgentDescription(name: string): string {
  const descriptions: Record<string, string> = {
    "Requirement Agent": "Parses the user prompt into a structured project plan with technical specifications.",
    "Frontend Agent": "Builds the user interface based on the structured plan using modern React and Tailwind CSS.",
    "Backend Agent": "Creates server-side logic, APIs, and database schemas when required by the project.",
    "Validator Agent": "Reviews and debugs code from both frontend and backend agents to ensure quality.",
    "Deployment Agent": "Packages the final, validated project for deployment and local setup."
  };
  return descriptions[name] || "AI agent working on your project";
}

function getAgentDependencies(name: string): string[] {
  const dependencies: Record<string, string[]> = {
    "Requirement Agent": [],
    "Frontend Agent": ["Requirement Agent"],
    "Backend Agent": ["Requirement Agent"],
    "Validator Agent": ["Frontend Agent", "Backend Agent"],
    "Deployment Agent": ["Validator Agent"]
  };
  return dependencies[name] || [];
}