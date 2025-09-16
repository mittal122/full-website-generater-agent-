import { useState } from "react";
import ProjectSetup from "@/components/ProjectSetup";
import Dashboard from "@/pages/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Brain, Code, Shield, Download, CheckCircle } from "lucide-react";
import type { ProjectConfig } from "@/components/ProjectSetup";
import type { ProjectStatus } from "@/pages/Dashboard";

export default function Home() {
  const [currentProject, setCurrentProject] = useState<ProjectStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartProject = async (config: ProjectConfig) => {
    console.log('Starting project with config:', config);
    setIsStarting(true);
    
    // Simulate project initialization
    setTimeout(() => {
      //todo: remove mock functionality
      const mockProject: ProjectStatus = {
        id: "proj_" + Date.now(),
        name: config.projectName,
        status: "running",
        startTime: new Date().toISOString(),
        agents: [
          { name: "Requirement Agent", status: "completed", duration: "2.3s" },
          { name: "Frontend Agent", status: "running", progress: 65 },
          { name: "Backend Agent", status: "pending" },
          { name: "Validator Agent", status: "pending" },
          { name: "Deployment Agent", status: "pending" }
        ]
      };
      
      setCurrentProject(mockProject);
      setIsStarting(false);
    }, 2000);
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    console.log('Starting new project');
  };

  // Show dashboard if project is active
  if (currentProject) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">AI Dev Team</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Beta
              </Badge>
            </div>
            
            <Button variant="outline" onClick={handleNewProject} data-testid="button-new-project">
              <Rocket className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Dashboard 
            project={currentProject}
            onPause={() => console.log('Pause project')}
            onResume={() => console.log('Resume project')}
            onStop={() => console.log('Stop project')}
            onRestart={() => console.log('Restart project')}
            onDownload={() => console.log('Download project')}
          />
        </main>
      </div>
    );
  }

  // Show landing page and project setup
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Brain className="h-12 w-12 text-primary" />
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Development Team
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Transform your ideas into complete web applications with our autonomous AI multi-agent system. 
              From concept to deployment in minutes, not weeks.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Badge variant="outline" className="text-sm px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                State Persistence
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Error Recovery
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Download className="h-4 w-4 mr-2" />
                Portable Output
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
            <Card className="text-center hover-elevate">
              <CardHeader>
                <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Smart Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  5 specialized AI agents work together: Requirements, Frontend, Backend, Validation, and Deployment.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-elevate">
              <CardHeader>
                <Code className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Modern Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  React, TypeScript, Node.js, and popular frameworks. Production-ready code from day one.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-elevate">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Resilient</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatic checkpoints and resume functionality. Never lose progress on complex projects.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-elevate">
              <CardHeader>
                <Download className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Portable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete project packages with package.json, scripts, and setup instructions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Project Setup Form */}
          <div className="max-w-4xl mx-auto">
            <ProjectSetup onStart={handleStartProject} isLoading={isStarting} />
          </div>
        </div>
      </section>
    </div>
  );
}