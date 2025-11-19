import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  ExternalLink, 
  TrendingUp, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { VideoMetadata } from "@/types/youtube";
import { formatDistanceToNow } from "date-fns";

interface VideoMetadataCardProps {
  metadata: VideoMetadata;
}

export const VideoMetadataCard = ({ metadata }: VideoMetadataCardProps) => {
  const daysSinceUpload = Math.floor(
    (Date.now() - metadata.uploadDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getViralBadge = () => {
    if (metadata.engagement.score >= 70) {
      return <Badge className="bg-green-500">Highly Viral</Badge>;
    } else if (metadata.engagement.score >= 50) {
      return <Badge className="bg-yellow-500">Viral</Badge>;
    } else if (metadata.engagement.score >= 30) {
      return <Badge className="bg-orange-500">Moderate</Badge>;
    } else {
      return <Badge variant="secondary">Low Engagement</Badge>;
    }
  };

  const getViralReasons = () => {
    const reasons: string[] = [];
    const against: string[] = [];

    if (metadata.views >= 100000) {
      reasons.push(`${(metadata.views / 1000).toFixed(0)}K views`);
    } else {
      against.push(`Only ${(metadata.views / 1000).toFixed(0)}K views`);
    }

    if (metadata.engagement.likeRatio >= 3) {
      reasons.push(`${metadata.engagement.likeRatio.toFixed(1)}% like ratio`);
    } else {
      against.push(`Low like ratio (${metadata.engagement.likeRatio.toFixed(1)}%)`);
    }

    if (metadata.engagement.commentRatio >= 0.5) {
      reasons.push(`${metadata.engagement.commentRatio.toFixed(2)}% comment ratio`);
    } else {
      against.push(`Low comment ratio (${metadata.engagement.commentRatio.toFixed(2)}%)`);
    }

    if (daysSinceUpload <= 30) {
      reasons.push(`Posted ${daysSinceUpload} days ago`);
    } else {
      against.push(`Posted ${daysSinceUpload} days ago (not recent)`);
    }

    return { reasons, against };
  };

  const { reasons, against } = getViralReasons();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base">Source Video Analysis</CardTitle>
          {getViralBadge()}
        </div>
        <CardDescription>
          {metadata.isViral ? (
            <span className="text-green-600">This video meets viral criteria</span>
          ) : (
            <span className="text-muted-foreground">This video doesn't meet all viral thresholds</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thumbnail Preview */}
        <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden border">
          <img
            src={metadata.thumbnailUrl}
            alt={metadata.title}
            className="w-full h-full object-cover"
          />
        </AspectRatio>

        {/* Video Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm line-clamp-2">{metadata.title}</h4>
          <p className="text-xs text-muted-foreground">
            by {metadata.channelTitle}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <a
              href={`https://youtube.com/watch?v=${metadata.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Watch on YouTube
            </a>
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              Views
            </div>
            <p className="text-sm font-semibold">
              {metadata.views >= 1000000
                ? `${(metadata.views / 1000000).toFixed(1)}M`
                : metadata.views >= 1000
                ? `${(metadata.views / 1000).toFixed(0)}K`
                : metadata.views.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              Likes
            </div>
            <p className="text-sm font-semibold">
              {metadata.likes >= 1000
                ? `${(metadata.likes / 1000).toFixed(0)}K`
                : metadata.likes.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              Comments
            </div>
            <p className="text-sm font-semibold">
              {metadata.comments >= 1000
                ? `${(metadata.comments / 1000).toFixed(0)}K`
                : metadata.comments.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Age
            </div>
            <p className="text-sm font-semibold">{daysSinceUpload} days</p>
          </div>
        </div>

        {/* Viral Score */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Viral Score</span>
            </div>
            <span className="font-medium">{metadata.engagement.score}/100</span>
          </div>
          <Progress value={metadata.engagement.score} className="h-2" />
        </div>

        {/* Engagement Ratios */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Like Ratio</span>
            <span className="font-medium">{metadata.engagement.likeRatio.toFixed(2)}%</span>
          </div>
          <Progress value={Math.min(100, metadata.engagement.likeRatio * 10)} className="h-1.5" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Comment Ratio</span>
            <span className="font-medium">{metadata.engagement.commentRatio.toFixed(2)}%</span>
          </div>
          <Progress value={Math.min(100, metadata.engagement.commentRatio * 50)} className="h-1.5" />
        </div>

        {/* Viral Analysis */}
        {(reasons.length > 0 || against.length > 0) && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium">Analysis</p>
            {reasons.length > 0 && (
              <div className="space-y-1">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}
            {against.length > 0 && (
              <div className="space-y-1">
                {against.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span className="text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

