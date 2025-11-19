import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Link2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  topic: z.string().optional().or(z.literal("")),
}).refine((data) => {
  const hasUrl = data.url && data.url.trim() !== "";
  const hasTopic = data.topic && data.topic.trim().length >= 10;
  return hasUrl || hasTopic;
}, {
  message: "Either a valid URL or topic (at least 10 characters) must be provided",
  path: ["url"],
});

type FormValues = z.infer<typeof formSchema>;

interface VideoCreationFormProps {
  onCreateProject: (data: { url?: string; topic?: string }) => void;
}

export const VideoCreationForm = ({ onCreateProject }: VideoCreationFormProps) => {
  const [activeTab, setActiveTab] = useState<"url" | "topic">("url");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      topic: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    const hasUrl = data.url && data.url.trim() !== "";
    const hasTopic = data.topic && data.topic.trim().length >= 10;

    if (!hasUrl && !hasTopic) {
      toast({
        title: "Error",
        description: "Please provide either a valid URL or a topic (at least 10 characters)",
        variant: "destructive",
      });
      return;
    }

    onCreateProject({
      url: hasUrl ? data.url?.trim() : undefined,
      topic: hasTopic ? data.topic?.trim() : undefined,
    });

    toast({
      title: "Project Created",
      description: "Your video creation project has been started",
    });

    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Create New Video
        </CardTitle>
        <CardDescription>
          Enter a viral short URL or describe a topic to recreate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "url" | "topic")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                From URL
              </TabsTrigger>
              <TabsTrigger value="topic" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                From Topic
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="url">YouTube/TikTok URL</Label>
                <Input
                  id="url"
                  placeholder="https://youtube.com/shorts/abc123 or https://tiktok.com/@user/video/123"
                  {...register("url")}
                />
                {errors.url && (
                  <p className="text-sm text-red-500">{errors.url.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Paste a viral short URL to replicate
                </p>
              </div>
            </TabsContent>

            <TabsContent value="topic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic Description</Label>
                <Textarea
                  id="topic"
                  placeholder="Example: 5 AI tools that can boost your productivity - explain each tool with visuals..."
                  {...register("topic")}
                  rows={4}
                />
                {errors.topic && (
                  <p className="text-sm text-red-500">{errors.topic.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Describe the content you want to create (min 10 characters)
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Video"}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-medium">What happens next:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Extract content from URL or generate script from topic</li>
              <li>AI rewrites the script for uniqueness</li>
              <li>Generate voiceover and video clips</li>
              <li>Render final video with FFmpeg</li>
              <li>Auto-publish to your channels</li>
            </ol>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

