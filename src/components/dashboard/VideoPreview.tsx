import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VideoProject } from "@/pages/Dashboard";
import { 
  Video, 
  Loader2, 
  CheckCircle2, 
  Clock,
  Play,
  Volume2,
  Image as ImageIcon,
  Type,
  Film
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPreviewProps {
  project: VideoProject;
}

export const VideoPreview = ({ project }: VideoPreviewProps) => {
  const completedSteps = project.steps.filter((s) => s.status === "completed").length;
  const totalSteps = project.steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  // Get current step index
  const currentStep = project.steps.find((s) => s.status === "processing");
  const stepIndex = currentStep ? project.steps.indexOf(currentStep) : totalSteps;

  // Simulate what content is currently being shown based on step progress
  const getCurrentContent = () => {
    if (stepIndex === 0) {
      const videoId = project.url ? project.url.match(/[a-zA-Z0-9_-]{11}/)?.[0] : null;
      return { 
        type: "finding", 
        icon: Video, 
        text: videoId ? `Analyzing: ${videoId}` : "Finding viral content..." 
      };
    } else if (stepIndex === 1) {
      return { type: "extracting", icon: Video, text: "Extracting content..." };
    } else if (stepIndex === 2) {
      return { type: "rewriting", icon: Type, text: "AI rewriting script..." };
    } else if (stepIndex === 3) {
      return { type: "voiceover", icon: Volume2, text: "Generating voiceover..." };
    } else if (stepIndex === 4 || stepIndex === 5) {
      return { type: "clips", icon: Film, text: "Adding video clips..." };
    } else if (stepIndex === 6) {
      return { type: "rendering", icon: Loader2, text: "Rendering final video..." };
    } else {
      return { type: "complete", icon: CheckCircle2, text: "Video ready!" };
    }
  };

  const content = getCurrentContent();
  const ContentIcon = content.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Video Preview</CardTitle>
          <Badge variant={project.status === "completed" ? "default" : "secondary"}>
            {project.status === "completed" ? "Ready" : "Processing"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {project.status === "completed" ? "Your video is ready to publish" : "Preview updates as video is created"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mobile-sized video preview (9:16 aspect ratio) */}
        <div className="relative">
          <AspectRatio ratio={9 / 16} className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              {project.status === "completed" ? (
                <div className="space-y-3 w-full">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Video Complete!</p>
                    <p className="text-xs text-muted-foreground mt-1">Ready to publish</p>
                  </div>
                  <div className="pt-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                      <Play className="h-6 w-6 text-primary fill-primary" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  {/* Animated content based on current step */}
                  <div className={cn(
                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
                    content.type === "complete" ? "bg-green-500/20" : "bg-primary/20"
                  )}>
                    <ContentIcon className={cn(
                      "h-8 w-8",
                      content.type === "complete" ? "text-green-500" : "text-primary",
                      content.type === "rendering" && "animate-spin"
                    )} />
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-foreground">{content.text}</p>
                    {project.title && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {project.title}
                      </p>
                    )}
                  </div>

                  {/* Simulated video content preview */}
                  <div className="space-y-2 pt-4">
                    {stepIndex >= 3 && (
                      <div className="flex items-center gap-2 px-2">
                        <Volume2 className="h-3 w-3 text-muted-foreground" />
                        <div className="flex-1 h-1 bg-primary/30 rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
                        </div>
                      </div>
                    )}
                    {stepIndex >= 4 && (
                      <div className="space-y-1">
                        <div className="h-2 bg-accent/20 rounded animate-pulse" />
                        <div className="h-2 bg-accent/20 rounded animate-pulse w-4/5" />
                      </div>
                    )}
                    {stepIndex >= 5 && (
                      <div className="grid grid-cols-2 gap-1 pt-2">
                        <div className="aspect-video bg-primary/10 rounded animate-pulse" />
                        <div className="aspect-video bg-accent/10 rounded animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </AspectRatio>
        </div>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {project.status === "completed" ? "Complete" : `Step ${completedSteps + 1} of ${totalSteps}`}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Status info */}
        {project.status === "completed" && project.completedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>Completed {project.completedAt.toLocaleTimeString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

