import type { VideoMetadata, ViralMetricsThresholds, ChannelVideo } from "@/types/youtube";

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get video metadata from YouTube using oEmbed API (browser-compatible)
 * Note: For production, you should use YouTube Data API v3 with proper authentication
 */
export async function getVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oEmbedUrl, {
      headers: {
        Accept: "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error("Video not found or not accessible");
    }
    
    const data = await response.json();
    
    // Generate realistic mock data for engagement metrics
    const views = Math.floor(Math.random() * 500000) + 10000;
    const estimatedLikes = Math.round(views * (0.03 + Math.random() * 0.02));
    const estimatedComments = Math.round(views * (0.005 + Math.random() * 0.003));
    
    const daysOld = Math.floor(Math.random() * 30);
    const uploadDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 60) + 15;

    const metadata: VideoMetadata = {
      videoId,
      title: data.title || "Unknown Title",
      description: "",
      channelId: "",
      channelTitle: data.author_name || "Unknown Channel",
      thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      views,
      likes: estimatedLikes,
      comments: estimatedComments,
      uploadDate,
      duration,
      engagement: {
        likeRatio: 0,
        commentRatio: 0,
        score: 0,
      },
      isViral: false,
    };

    return metadata;
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    throw new Error(`Failed to fetch video metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function analyzeViralMetrics(
  metadata: VideoMetadata,
  thresholds: ViralMetricsThresholds
): VideoMetadata {
  const likeRatio = metadata.views > 0 ? metadata.likes / metadata.views : 0;
  const commentRatio = metadata.views > 0 ? metadata.comments / metadata.views : 0;
  
  const daysSinceUpload = Math.floor(
    (Date.now() - metadata.uploadDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let score = 0;
  
  if (metadata.views >= thresholds.minViews) {
    score += Math.min(30, (metadata.views / thresholds.minViews) * 10);
  }
  
  if (likeRatio >= thresholds.minLikeRatio) {
    score += 30;
  } else {
    score += (likeRatio / thresholds.minLikeRatio) * 30;
  }
  
  if (commentRatio >= thresholds.minCommentRatio) {
    score += 20;
  } else {
    score += (commentRatio / thresholds.minCommentRatio) * 20;
  }
  
  if (daysSinceUpload <= thresholds.maxDaysOld) {
    score += 20 * (1 - daysSinceUpload / thresholds.maxDaysOld);
  }

  score = Math.min(100, Math.max(0, score));

  const isViral =
    metadata.views >= thresholds.minViews &&
    likeRatio >= thresholds.minLikeRatio &&
    commentRatio >= thresholds.minCommentRatio &&
    daysSinceUpload <= thresholds.maxDaysOld;

  return {
    ...metadata,
    engagement: {
      likeRatio: likeRatio * 100,
      commentRatio: commentRatio * 100,
      score: Math.round(score),
    },
    isViral,
  };
}

export function isViral(
  metadata: VideoMetadata,
  thresholds: ViralMetricsThresholds
): boolean {
  const daysSinceUpload = Math.floor(
    (Date.now() - metadata.uploadDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const likeRatio = metadata.views > 0 ? metadata.likes / metadata.views : 0;
  const commentRatio = metadata.views > 0 ? metadata.comments / metadata.views : 0;

  return (
    metadata.views >= thresholds.minViews &&
    likeRatio >= thresholds.minLikeRatio &&
    commentRatio >= thresholds.minCommentRatio &&
    daysSinceUpload <= thresholds.maxDaysOld
  );
}

export async function getChannelVideos(channelUrl: string): Promise<ChannelVideo[]> {
  console.warn("Channel video extraction requires YouTube Data API v3");
  return [];
}

export function getDefaultThresholds(): ViralMetricsThresholds {
  return {
    minViews: 100000,
    minLikeRatio: 0.03,
    minCommentRatio: 0.005,
    maxDaysOld: 30,
  };
}

