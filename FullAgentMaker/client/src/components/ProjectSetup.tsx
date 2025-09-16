import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject } from "@shared/schema";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface ProjectSetupProps {
  onProjectCreated: (projectId: string) => void;
}

export default function ProjectSetup({ onProjectCreated }: ProjectSetupProps) {
  const { toast } = useToast();

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      stack: "react",
      database: "none",
      features: []
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("/api/projects", {
        method: "POST",
        body: data
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to create project");
      }
      return response;
    },
    onSuccess: (response) => {
      toast({
        title: "Project created successfully",
        description: `Your project "${response.project.name}" has been created.`
      });
      onProjectCreated(response.project.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (data: InsertProject) => {
    createProjectMutation.mutate(data);
  };

  const features = [
    { id: "auth", label: "User Authentication" },
    { id: "payments", label: "Payment Processing" },
    { id: "ai", label: "AI Integration" },
    { id: "realtime", label: "Real-time Features" },
    { id: "mobile", label: "Mobile Responsive" }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="card-project-setup">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>Create New Project</CardTitle>
        </div>
        <CardDescription>
          Describe your project and let our AI agents build it for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Awesome App" 
                      {...field} 
                      data-testid="input-project-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you want to build. Be as detailed as possible - the AI agents will use this to understand your requirements."
                      className="min-h-[100px]"
                      {...field}
                      data-testid="input-project-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tech Stack</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tech-stack">
                          <SelectValue placeholder="Select framework" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="react">React + TypeScript</SelectItem>
                        <SelectItem value="vue">Vue.js + TypeScript</SelectItem>
                        <SelectItem value="angular">Angular</SelectItem>
                        <SelectItem value="node">Node.js API</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="database"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-database">
                          <SelectValue placeholder="Select database" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Database</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="features"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Additional Features</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((feature) => (
                      <FormField
                        key={feature.id}
                        control={form.control}
                        name="features"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={feature.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value || [], feature.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== feature.id
                                          )
                                        )
                                  }}
                                  data-testid={`checkbox-feature-${feature.id}`}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {feature.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createProjectMutation.isPending}
              data-testid="button-create-project"
            >
              {createProjectMutation.isPending ? (
                "Creating project..."
              ) : (
                <>
                  Create Project <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}