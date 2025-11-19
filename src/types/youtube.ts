export interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  comments: number;
  uploadDate: Date;
  duration: number;
  engagement: {
    likeRatio: number;
    commentRatio: number;
    score: number;
  };
  isViral: boolean;
}

export interface ViralMetricsThresholds {
  minViews: number;
  minLikeRatio: number;
  minCommentRatio: number;
  maxDaysOld: number;
}

export interface ChannelVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  uploadDate: Date;
}

