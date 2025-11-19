import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Circle, Loader2, XCircle, Clock, Eye } from "lucide-react";
import { VideoProject } from "@/pages/Dashboard";
import { VideoPreview } from "./VideoPreview";
import { VideoMetadataCard } from "./VideoMetadataCard";
import { useState } from "react";

interface WorkflowProgressProps {
  project: VideoProject;
}

const stepIcons = {
  pending: Circle,
  processing: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

const stepColors = {
  pending: "text-muted-foreground",
  processing: "text-blue-500 animate-spin",
  completed: "text-green-500",
  failed: "text-red-500",
};

const stepLabels = [
  "Find Viral Shorts",
  "Extract Content",
  "AI Rewrite Script",
  "Generate Voiceover",
  "Generate Video Clips",
  "Render Final Video",
  "Auto-Publish",
];

export const WorkflowProgress = ({ project }: WorkflowProgressProps) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const completedSteps = project.steps.filter((s) => s.status === "completed").length;
  const totalSteps = project.steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Find Viral Shorts
        if (project.sourceMetadata) {
          return (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Video Metadata</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {project.sourceMetadata.title}</p>
                  <p><strong>Channel:</strong> {project.sourceMetadata.channelTitle}</p>
                  <p><strong>Views:</strong> {project.sourceMetadata.views.toLocaleString()}</p>
                  <p><strong>Likes:</strong> {project.sourceMetadata.likes.toLocaleString()}</p>
                  <p><strong>Comments:</strong> {project.sourceMetadata.comments.toLocaleString()}</p>
                  <p><strong>Viral Score:</strong> {project.sourceMetadata.engagement.score}/100</p>
                  <p><strong>Viral Status:</strong> {project.sourceMetadata.isViral ? "✅ Viral" : "❌ Not Viral"}</p>
                </div>
              </div>
            </div>
          );
        }
        return <p className="text-muted-foreground">No metadata available yet.</p>;
      
      case 1: // Extract Content
        if (project.scriptData) {
          return (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Extracted Script</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                  {project.scriptData.script}
                </p>
              </div>
              {project.scriptSegments && project.scriptSegments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Script Segments ({project.scriptSegments.length})</h4>
                  <div className="space-y-2">
                    {project.scriptSegments.map((segment, idx) => (
                      <div key={idx} className="text-sm bg-muted p-3 rounded-lg">
                        <strong>Segment {idx + 1}:</strong> {segment}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
        return <p className="text-muted-foreground">No script extracted yet.</p>;
      
      case 2: // AI Rewrite Script
        return <p className="text-muted-foreground">This feature will show the AI-rewritten script content.</p>;
      
      case 3: // Generate Voiceover
        return <p className="text-muted-foreground">This feature will show the generated voiceover audio file.</p>;
      
      case 4: // Generate Video Clips
        return <p className="text-muted-foreground">This feature will show the selected video clips.</p>;
      
      case 5: // Render Final Video
        return <p className="text-muted-foreground">This feature will show the final rendered video.</p>;
      
      case 6: // Auto-Publish
        return <p className="text-muted-foreground">This feature will show publishing status and links.</p>;
      
      default:
        return <p className="text-muted-foreground">No content available.</p>;
    }
  };

  const getStatusBadge = () => {
    switch (project.status) {
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Preview - Mobile size */}
      <div className="lg:col-span-1">
        <VideoPreview project={project} />
      </div>

      {/* Workflow Details */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>{project.title}</CardTitle>
              {getStatusBadge()}
            </div>
            <CardDescription>
              {project.url ? `From URL: ${project.url.substring(0, 50)}...` : `Topic: ${project.topic}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{completedSteps}/{totalSteps} steps completed</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Workflow Steps</h4>
          <div className="space-y-3">
            {project.steps.map((step, index) => {
              const Icon = stepIcons[step.status];
              const colorClass = stepColors[step.status];
              
              return (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className={`mt-0.5 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{step.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Step {index + 1}/7
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => setSelectedStep(index)}
                          disabled={step.status === "pending"}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {project.completedAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
            <Clock className="h-4 w-4" />
            <span>Completed: {project.completedAt.toLocaleString()}</span>
          </div>
        )}

        {project.status === "completed" && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Video Ready!</p>
            <p className="text-xs text-muted-foreground">
              Your video has been generated and published. Check the Video Queue tab to view it.
            </p>
          </div>
        )}
          </CardContent>
        </Card>
        
        {/* Show metadata card when Step 1 is completed */}
        {project.sourceMetadata && completedSteps >= 1 && (
          <VideoMetadataCard metadata={project.sourceMetadata} />
        )}
      </div>

      {/* Dialog to show step content */}
      <Dialog open={selectedStep !== null} onOpenChange={(open) => !open && setSelectedStep(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStep !== null && `${stepLabels[selectedStep]} - Step ${selectedStep + 1}/7`}
            </DialogTitle>
            <DialogDescription>
              View the content and results for this workflow step.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedStep !== null && getStepContent(selectedStep)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

