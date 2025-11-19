import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Clock,
  ExternalLink,
  Play,
  Download
} from "lucide-react";
import { VideoProject } from "@/pages/Dashboard";

interface VideoQueueProps {
  projects: VideoProject[];
  selectedProject: VideoProject | null;
  onSelectProject: (project: VideoProject) => void;
}

export const VideoQueue = ({ projects, selectedProject, onSelectProject }: VideoQueueProps) => {
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Queue</CardTitle>
          <CardDescription>Your created videos will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No videos created yet</p>
            <p className="text-sm mt-2">Start by creating your first video in the Create Video tab</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: VideoProject["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: VideoProject["status"]) => {
    switch (status) {
      case "processing":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Video Queue ({projects.length})</CardTitle>
          <CardDescription>
            Manage and track your video creation projects
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {projects.map((project) => {
          const completedSteps = project.steps.filter((s) => s.status === "completed").length;
          const progress = (completedSteps / project.steps.length) * 100;
          const isSelected = selectedProject?.id === project.id;

          return (
            <Card
              key={project.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSelectProject(project)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(project.status)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.url 
                              ? project.url.substring(0, 60) + "..." 
                              : project.topic?.substring(0, 60) + "..."}
                          </p>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progress: {completedSteps}/{project.steps.length} steps</span>
                          <span>Created: {project.createdAt.toLocaleString()}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        {project.completedAt && (
                          <p className="text-xs text-muted-foreground">
                            Completed: {project.completedAt.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {project.status === "completed" && (
                      <>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          YouTube
                        </Button>
                      </>
                    )}
                    {project.status === "processing" && (
                      <p className="text-xs text-muted-foreground text-center">
                        Processing...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

