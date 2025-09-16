import ProjectSetup from '../ProjectSetup';

export default function ProjectSetupExample() {
  const handleStart = (config: any) => {
    console.log('Project started with config:', config);
  };

  return (
    <div className="p-6 bg-background">
      <ProjectSetup onStart={handleStart} />
    </div>
  );
}