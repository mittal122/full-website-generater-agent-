import AgentCard from '../AgentCard';

export default function AgentCardExample() {
  return (
    <div className="grid gap-4 max-w-md">
      <AgentCard
        name="Requirement Agent"
        description="Parses the user prompt into a structured project plan with technical specifications and requirements."
        status="completed"
        duration="2.3s"
        dependencies={[]}
      />
      
      <AgentCard
        name="Frontend Agent"
        description="Builds the user interface based on the structured plan using modern React and Tailwind CSS."
        status="running"
        progress={65}
        dependencies={["Requirement Agent"]}
      />
      
      <AgentCard
        name="Backend Agent"
        description="Creates server-side logic, APIs, and database schemas when required by the project."
        status="pending"
        dependencies={["Requirement Agent", "Frontend Agent"]}
      />
      
      <AgentCard
        name="Validator Agent"
        description="Reviews and debugs code from both frontend and backend agents to ensure quality."
        status="error"
        error="Failed to validate component imports. Missing dependency: @types/react"
        dependencies={["Frontend Agent", "Backend Agent"]}
      />
    </div>
  );
}