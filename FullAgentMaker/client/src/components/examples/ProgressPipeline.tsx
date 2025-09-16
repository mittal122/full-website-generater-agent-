import ProgressPipeline from '../ProgressPipeline';

export default function ProgressPipelineExample() {
  //todo: remove mock functionality
  const mockSteps = [
    {
      id: "requirement",
      name: "Requirement Analysis",
      status: "completed" as const,
      description: "Parse user prompt and create structured project plan",
      duration: "2.3s"
    },
    {
      id: "frontend", 
      name: "Frontend Development",
      status: "running" as const,
      description: "Generate React components and user interface",
      progress: 75
    },
    {
      id: "backend",
      name: "Backend Development", 
      status: "pending" as const,
      description: "Create server-side logic and API endpoints"
    },
    {
      id: "validation",
      name: "Code Validation",
      status: "pending" as const,
      description: "Review and test generated code for errors"
    },
    {
      id: "packaging",
      name: "Project Packaging",
      status: "pending" as const,
      description: "Bundle project for local deployment"
    }
  ];

  return (
    <div className="max-w-2xl">
      <ProgressPipeline 
        steps={mockSteps}
        currentStep="frontend"
      />
    </div>
  );
}