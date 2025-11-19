import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { VideoCreationForm } from "@/components/dashboard/VideoCreationForm";
import { WorkflowProgress } from "@/components/dashboard/WorkflowProgress";
import { VideoQueue } from "@/components/dashboard/VideoQueue";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { Video, Settings, PlaySquare, Sparkles, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { extractVideoId, getVideoMetadata, analyzeViralMetrics, getDefaultThresholds } from "@/lib/youtube";
import { extractScript, segmentScript } from "@/lib/subtitles";
import { initDatabase, createProject, updateProject, getAllProjects, saveProjectMetadata, saveProjectScript, saveWorkflowStep, saveScriptSegments } from "@/lib/database";
import type { VideoMetadata } from "@/types/youtube";
import type { CaptionData } from "@/lib/subtitles";

export type VideoProject = {
  id: string;
  url?: string;
  topic?: string;
  title: string;
  status: "pending" | "processing" | "completed" | "failed";
  currentStep: number;
  steps: {
    id: number;
    name: string;
    status: "pending" | "processing" | "completed" | "failed";
    description: string;
  }[];
  createdAt: Date;
  completedAt?: Date;
  thumbnail?: string;
  videoUrl?: string;
  sourceMetadata?: VideoMetadata;
  viralScore?: number;
  analysisData?: {
    metrics: any;
    timestamp: Date;
  };
  scriptData?: CaptionData;
  scriptSegments?: string[];
};

type DashboardView = "create" | "queue" | "settings";

const Dashboard = () => {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<DashboardView>("create");
  const workflowTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  // Keep selectedProject in sync with projects array
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  // Initialize database and load projects on mount
  useEffect(() => {
    const init = async () => {
      await initDatabase();
      setIsDbInitialized(true);
      const loadedProjects = await getAllProjects();
      setProjects(loadedProjects);
    };
    init();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      workflowTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      workflowTimeoutsRef.current.clear();
    };
  }, []);

  const handleCreateProject = async (data: { url?: string; topic?: string }) => {
    let title = "Untitled Project";
    if (data.url) {
      try {
        const url = new URL(data.url);
        title = `Video from ${url.hostname}`;
      } catch {
        title = `Video from URL`;
      }
    } else if (data.topic) {
      title = data.topic.substring(0, 50);
    }

    const projectId = `project-${Date.now()}`;
    const steps = [
      {
        id: 1,
        name: "Find Viral Shorts",
        status: "processing",
        description: "Identifying viral content in your niche",
      },
      {
        id: 2,
        name: "Extract Content",
        status: "pending",
        description: "Downloading captions and extracting script",
      },
      {
        id: 3,
        name: "AI Rewrite Script",
        status: "pending",
        description: "Rewriting script with AI for uniqueness",
      },
      {
        id: 4,
        name: "Generate Voiceover",
        status: "pending",
        description: "Creating TTS voiceover from script",
      },
      {
        id: 5,
        name: "Generate Video Clips",
        status: "pending",
        description: "Mapping script to stock video clips",
      },
      {
        id: 6,
        name: "Render Final Video",
        status: "pending",
        description: "Combining audio, clips, and captions with FFmpeg",
      },
      {
        id: 7,
        name: "Auto-Publish",
        status: "pending",
        description: "Uploading to YouTube/TikTok/Instagram",
      },
    ];

    // Save project to database
    await createProject({
      id: projectId,
      url: data.url,
      topic: data.topic,
      title,
      status: "processing",
      currentStep: 1,
      createdAt: new Date(),
    });

    // Save workflow steps to database
    for (const step of steps) {
      await saveWorkflowStep(projectId, step);
    }

    const newProject: VideoProject = {
      id: projectId,
      url: data.url,
      topic: data.topic,
      title,
      status: "processing",
      currentStep: 1,
      createdAt: new Date(),
      steps,
    };

    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    simulateWorkflow(newProject.id);
  };

  const simulateWorkflow = (projectId: string) => {
    let stepIndex = 0;

    const processStep = () => {
      setProjects((prev) => {
        const project = prev.find((p) => p.id === projectId);
        if (!project) return prev;

        // Special handling for Step 1: Find Viral Shorts
        if (stepIndex === 0 && project.url && !project.sourceMetadata) {
          const videoId = extractVideoId(project.url);
          if (videoId) {
            // Fetch and analyze video metadata asynchronously
            getVideoMetadata(videoId)
              .then(async (metadata) => {
                if (metadata) {
                  const thresholds = getDefaultThresholds();
                  const analyzedMetadata = analyzeViralMetrics(metadata, thresholds);

                  // Persist to database
                  await saveProjectMetadata(projectId, analyzedMetadata);
                  await saveWorkflowStep(projectId, { 
                    id: 1, 
                    name: "Find Viral Shorts", 
                    description: "Identifying viral content in your niche", 
                    status: "completed" 
                  });
                  await saveWorkflowStep(projectId, { 
                    id: 2, 
                    name: "Extract Content", 
                    description: "Downloading captions and extracting script", 
                    status: "processing" 
                  });

                  setProjects((currentProjects) =>
                    currentProjects.map((p) => {
                      if (p.id === projectId) {
                        const updatedSteps = [...p.steps];
                        updatedSteps[0] = {
                          ...updatedSteps[0],
                          status: "completed",
                        };
                        if (updatedSteps.length > 1) {
                          updatedSteps[1].status = "processing";
                        }

                        return {
                          ...p,
                          steps: updatedSteps,
                          currentStep: 2,
                          sourceMetadata: analyzedMetadata,
                          viralScore: analyzedMetadata.engagement.score,
                          analysisData: {
                            metrics: analyzedMetadata,
                            timestamp: new Date(),
                          },
                        };
                      }
                      return p;
                    })
                  );

                  stepIndex = 1;
                  // Trigger Step 2 extraction after Step 1 completes
                  setTimeout(() => processStep(), 2000);
                }
              })
              .catch((error) => {
                console.error("Error in Step 1:", error);
                setProjects((currentProjects) =>
                  currentProjects.map((p) => {
                    if (p.id === projectId) {
                      const updatedSteps = [...p.steps];
                      updatedSteps[0] = { ...updatedSteps[0], status: "failed" };
                      if (updatedSteps.length > 1) {
                        updatedSteps[1].status = "processing";
                      }
                      return { ...p, steps: updatedSteps, currentStep: 2 };
                    }
                    return p;
                  })
                );
                stepIndex = 1;
                setTimeout(() => processStep(), 2000);
              });
            // Return prev while async fetch happens
            return prev;
          }
        }

        // Special handling for Step 2: Extract Content
        if (stepIndex === 1 && project.sourceMetadata && !project.scriptData) {
          extractScript(project.sourceMetadata, project.url || undefined)
            .then(async (scriptData) => {
              const segments = segmentScript(scriptData.script);

              // Persist to database
              await saveProjectScript(projectId, scriptData);
              await saveScriptSegments(projectId, segments);
              await saveWorkflowStep(projectId, { 
                id: 2, 
                name: "Extract Content", 
                description: "Downloading captions and extracting script",
                status: "completed" 
              });
              await saveWorkflowStep(projectId, { 
                id: 3, 
                name: "AI Rewrite Script", 
                description: "Rewriting script with AI for uniqueness", 
                status: "processing" 
              });

              // Update project status in database
              await updateProject(projectId, { 
                status: "processing",
                current_step: 3
              });

              setProjects((currentProjs) =>
                currentProjs.map((p) => {
                  if (p.id === projectId) {
                    const updatedSteps = [...p.steps];
                    updatedSteps[1] = { ...updatedSteps[1], status: "completed" };
                    if (updatedSteps.length > 2) {
                      updatedSteps[2].status = "processing";
                    }
                    return {
                      ...p,
                      steps: updatedSteps,
                      currentStep: 3,
                      scriptData,
                      scriptSegments: segments,
                    };
                  }
                  return p;
                })
              );
              stepIndex = 2;
              setTimeout(() => processStep(), 2000);
            })
            .catch(async (error) => {
              console.error("Error in Step 2 (Extract Content):", error);
              
              // Save failed step to database
              await saveWorkflowStep(projectId, { 
                id: 2, 
                name: "Extract Content", 
                description: `Error: ${error instanceof Error ? error.message : "Failed to extract script. Make sure the video has captions enabled."}`,
                status: "failed" 
              });
              
              // Update project status
              await updateProject(projectId, { 
                status: "failed"
              });
              
              setProjects((currentProjs) =>
                currentProjs.map((p) => {
                  if (p.id === projectId) {
                    const updatedSteps = [...p.steps];
                    updatedSteps[1] = { 
                      ...updatedSteps[1], 
                      status: "failed",
                      description: `Error: ${error instanceof Error ? error.message : "Failed to extract script. Make sure the video has captions enabled."}`
                    };
                    return { 
                      ...p, 
                      steps: updatedSteps, 
                      currentStep: 2,
                      status: "failed"
                    };
                  }
                  return p;
                })
              );
              // Don't continue to next step if extraction failed
            });
          return prev;
        }


        // Regular step processing for non-URL projects or steps after Step 1
        if (stepIndex >= project.steps.length) {
          return prev.map((p) =>
            p.id === projectId
              ? { ...p, status: "completed", completedAt: new Date() }
              : p
          );
        }

        const updatedSteps = [...project.steps];
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          status: "completed",
        };

        if (stepIndex + 1 < updatedSteps.length) {
          updatedSteps[stepIndex + 1] = {
            ...updatedSteps[stepIndex + 1],
            status: "processing",
          };
        }

        const nextProject = prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                steps: updatedSteps,
                currentStep: stepIndex + 2,
              }
            : p
        );

        stepIndex++;

        if (stepIndex < 7) {
          const timeout = setTimeout(() => processStep(), 3000);
          workflowTimeoutsRef.current.set(`${projectId}-${stepIndex}`, timeout);
        } else {
          // Final completion
          setTimeout(() => {
            setProjects((finalProjects) =>
              finalProjects.map((p) =>
                p.id === projectId
                  ? { ...p, status: "completed", completedAt: new Date() }
                  : p
              )
            );
          }, 3000);
        }

        return nextProject;
      });
    };

    const initialTimeout = setTimeout(() => processStep(), 2000);
    workflowTimeoutsRef.current.set(`${projectId}-initial`, initialTimeout);
  };

  const stats = {
    total: projects.length,
    processing: projects.filter((p) => p.status === "processing").length,
    completed: projects.filter((p) => p.status === "completed").length,
    failed: projects.filter((p) => p.status === "failed").length,
  };

  const renderContent = () => {
    switch (currentView) {
      case "create":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <VideoCreationForm onCreateProject={handleCreateProject} />
              </div>
              <div className="lg:col-span-2">
                {selectedProject ? (
                  <WorkflowProgress project={selectedProject} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Workflow Progress</CardTitle>
                      <CardDescription>
                        Start creating a video to see the workflow progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <PlaySquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No active project selected</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        );
      case "queue":
        return (
          <VideoQueue
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={(project) => {
              setSelectedProjectId(project.id);
              setCurrentView("create");
            }}
          />
        );
      case "settings":
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">AutoShorts AI</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentView("create")}
                    isActive={currentView === "create"}
                    tooltip="Create Video"
                  >
                    <PlaySquare className="h-4 w-4" />
                    <span>Create Video</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentView("queue")}
                    isActive={currentView === "queue"}
                    tooltip="Video Queue"
                  >
                    <Video className="h-4 w-4" />
                    <span>Video Queue</span>
                    {projects.length > 0 && (
                      <span className="ml-auto rounded-full bg-sidebar-accent px-2 py-0.5 text-xs font-semibold">
                        {projects.length}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentView("settings")}
                    isActive={currentView === "settings"}
                    tooltip="Settings"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Stats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing</span>
                  <span className="font-semibold text-yellow-600">{stats.processing}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Failed</span>
                  <span className="font-semibold text-red-600">{stats.failed}</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {currentView === "create" && "Create Video"}
              {currentView === "queue" && "Video Queue"}
              {currentView === "settings" && "Settings"}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;

