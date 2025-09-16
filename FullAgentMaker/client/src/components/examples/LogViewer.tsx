import LogViewer from '../LogViewer';

export default function LogViewerExample() {
  //todo: remove mock functionality
  const mockLogs = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 10000).toISOString(),
      level: "info" as const,
      agent: "Requirement",
      message: "Starting analysis of user prompt..."
    },
    {
      id: "2", 
      timestamp: new Date(Date.now() - 8000).toISOString(),
      level: "success" as const,
      agent: "Requirement",
      message: "Successfully parsed project requirements. Identified 5 key features."
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 6000).toISOString(),
      level: "info" as const,
      agent: "Frontend",
      message: "Generating React components based on requirements..."
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 4000).toISOString(),
      level: "warn" as const,
      agent: "Frontend", 
      message: "Complex component detected. Breaking into smaller modules."
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 2000).toISOString(),
      level: "error" as const,
      agent: "Validator",
      message: "Validation failed: Missing PropTypes for UserCard component"
    },
    {
      id: "6",
      timestamp: new Date().toISOString(),
      level: "info" as const,
      agent: "Validator",
      message: "Retrying validation after fixes..."
    }
  ];

  return (
    <div className="h-96">
      <LogViewer 
        logs={mockLogs}
        onToggleLive={() => console.log('Toggle live logs')}
        onClear={() => console.log('Clear logs')}
        onDownload={() => console.log('Download logs')}
      />
    </div>
  );
}