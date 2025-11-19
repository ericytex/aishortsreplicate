import type { VideoMetadata } from "@/types/youtube";

export interface CaptionTrack {
  baseUrl: string;
  vssId: string;
  languageCode: string;
  name: {
    simpleText: string;
  };
}

export interface CaptionData {
  videoId: string;
  script: string;
  language: string;
  duration: number;
}

/**
 * Fetch caption tracks from YouTube video
 * Uses YouTube's caption endpoint which returns available tracks
 */
export async function fetchCaptionTracks(videoId: string): Promise<CaptionTrack[]> {
  try {
    // Returns available caption tracks for the video
    // Uses YouTube's timedtext API endpoint
    console.log(`Fetching caption tracks for video: ${videoId}`);
    
    // Return English caption track (default)
    // In production, you could fetch all available tracks via YouTube Data API v3
    return [
      {
        baseUrl: `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
        vssId: ".en",
        languageCode: "en",
        name: { simpleText: "English" },
      },
    ];
  } catch (error) {
    console.error("Error fetching caption tracks:", error);
    return [];
  }
}

/**
 * Download and parse caption content
 * Extracts the text from XML/JSON caption format
 * Tries multiple methods to get real captions from the video
 */
export async function downloadCaptions(
  videoId: string,
  languageCode: string = "en"
): Promise<string> {
  const captionUrl = `https://www.youtube.com/api/timedtext?lang=${languageCode}&v=${videoId}&fmt=srv3`;
  
  // Try multiple CORS proxies
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(captionUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(captionUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(captionUrl)}`,
  ];
  
  // Also try direct fetch (works if video allows CORS)
  const methods: Array<{ url: string; type: 'proxy' | 'direct' }> = [
    ...proxies.map(url => ({ url, type: 'proxy' as const })),
    { url: captionUrl, type: 'direct' as const },
  ];
  
  let lastError: Error | null = null;
  
  for (const method of methods) {
    try {
      const response = await fetch(method.url, {
        method: 'GET',
        headers: {
          'Accept': method.type === 'proxy' ? 'application/json' : 'application/xml',
        },
      });
      
      if (!response.ok) {
        continue;
      }
      
      let xmlContent: string;
      const contentType = response.headers.get('content-type') || '';
      
      if (method.type === 'proxy') {
        if (contentType.includes('application/json')) {
          try {
            const data = await response.json();
            // Handle different proxy response formats
            if (data.contents) {
              xmlContent = data.contents;
            } else if (data.content) {
              xmlContent = data.content;
            } else if (typeof data === 'string') {
              xmlContent = data;
            } else {
              // If JSON but unexpected shape, fall back to reading text
              xmlContent = await response.text();
            }
          } catch {
            // JSON parse failed; fall back to text
            xmlContent = await response.text();
          }
        } else {
          // Proxy returned text/html or xml directly
          xmlContent = await response.text();
        }
      } else {
        xmlContent = await response.text();
      }
      
      // Parse XML caption content
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      
      // Check for parse errors
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        continue;
      }
      
      const textNodes = xmlDoc.querySelectorAll("text");
      
      if (textNodes.length === 0) {
        // Try alternate format - some videos use different XML structure
        const allText = xmlDoc.textContent || xmlDoc.documentElement?.textContent || '';
        if (allText.trim().length > 0) {
          return allText.trim();
        }
        continue;
      }
      
      const script = Array.from(textNodes)
        .map((node) => {
          const text = node.textContent || '';
          // Remove special formatting markers if present
          return text.replace(/\[.*?\]/g, '').trim();
        })
        .filter(text => text.length > 0)
        .join(" ");
      
      if (script.trim().length > 0) {
        return script.trim();
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next method
      continue;
    }
  }
  
  // If all methods failed, try with different language codes or auto-captions
  const alternativeLanguages = ['en-US', 'en-GB', 'en'];
  if (languageCode !== 'en' && !alternativeLanguages.includes(languageCode)) {
    for (const altLang of alternativeLanguages) {
      try {
        const altScript = await downloadCaptions(videoId, altLang);
        if (altScript && altScript.length > 0) {
          return altScript;
        }
      } catch {
        // Continue trying
      }
    }
  }
  
  // Try fetching with auto-captions (no language specified)
  try {
    const autoCaptionUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&fmt=srv3`;
    const autoProxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(autoCaptionUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(autoCaptionUrl)}`,
    ];
    
    for (const proxyUrl of autoProxies) {
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) continue;
        const contentType = response.headers.get('content-type') || '';
        let xmlContent: string | null = null;
        if (contentType.includes('application/json')) {
          try {
            const data = await response.json();
            if (data.contents || data.content) {
              xmlContent = data.contents || data.content;
            }
          } catch {
            // ignore and try text below
          }
        }
        if (!xmlContent) {
          xmlContent = await response.text();
        }
        if (xmlContent) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
          const textNodes = xmlDoc.querySelectorAll("text");
          if (textNodes.length > 0) {
            const script = Array.from(textNodes)
              .map((node) => (node.textContent || '').replace(/\[.*?\]/g, '').trim())
              .filter(text => text.length > 0)
              .join(" ");
            if (script.trim().length > 0) {
              return script.trim();
            }
          }
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Ignore auto-caption errors
  }
  
  // If we still don't have captions, throw an error instead of using mock data
  throw new Error(
    `Failed to download captions for video ${videoId}. ` +
    `The video may not have captions available, or they may be disabled. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Get mock script for demonstration purposes
 */
function getMockScript(videoId: string): string {
  const scripts = [
    "Here are 5 AI tools that will blow your mind! First up is ChatGPT, your new best friend for everything. It can write, code, and solve problems instantly. Number two is Midjourney - create stunning images from just text descriptions. Third is Runway ML for video magic and special effects. Fourth, Eleven Labs for realistic AI voices that sound exactly like humans. And finally, Claude from Anthropic - great for long conversations and complex reasoning. Like and subscribe for more AI tips!",
    
    "Ptoblem: You're wasting hours on boring tasks. Solution: AI automation! Watch as I show you how to automate your entire workflow with AI tools. First, set up your AI assistant to handle emails automatically. Then, use AI to schedule your social media posts. Automate your research with AI-powered search. Manage your tasks with an AI project manager. And finally, let AI analyze your data and create reports. Save 20 hours per week with these AI automation tricks!",
    
    "Stop paying for subscriptions! Here's how to get everything for free. Use this AI tool to summarize articles instead of Medium. Get premium music without Spotify thanks to AI DJ features. Replace expensive video editing software with free AI tools. Use AI to generate royalty-free images instead of Shutterstock. Get premium writing tools for free with AI assistants. Subscribe for more money-saving AI hacks!",
    
    "Everyone is using AI wrong! Here's the secret way the pros actually use AI tools. Don't just ask AI basic questions - feed it entire documents and get expert analysis. Use AI to practice conversations, not just answer questions. Create AI workflows that chain multiple tools together. Train AI on your specific data for personalized results. And most importantly, treat AI like a team member, not a tool. Follow for the real broker secrets!",
    
    "This ONE AI trick will 10x your productivity overnight. Watch closely because this changes everything. Set up a personal AI knowledge base with all your notes and documents. Create AI agents that work while you sleep. Use voice-to-text AI to capture every idea instantly. Automate your content creation pipeline with AI workflows. And implement AI summarization for everything you read. Comment 'AI' if you want more game-changing tips!",
  ];
  
  // Return a consistent script based on video ID hash
  const index = parseInt(videoId.slice(-1), 36) % scripts.length;
  return scripts[index] || scripts[0];
}

/**
 * Extract and process video script from audio transcript
 * Uses Gemini to extract audio transcript directly from YouTube video URL
 * Falls back to native captions if Gemini is unavailable
 */
export async function extractScript(metadata: VideoMetadata, videoUrl?: string): Promise<CaptionData> {
  try {
    console.log(`Extracting audio transcript for video: ${metadata.videoId}`);
    
    // Primary method: Use Gemini to extract audio transcript directly from YouTube URL
    let script: string | null = null;
    
    try {
      script = await fetchTranscriptWithGemini(metadata.videoId, videoUrl);
      console.log(`✓ Gemini extracted transcript: ${script.length} characters`);
    } catch (geminiError) {
      console.warn("Gemini transcript extraction failed, falling back to captions:", geminiError);
      // Fallback: Try to get native captions if available
      try {
        script = await downloadCaptions(metadata.videoId);
        console.log(`✓ Captions extracted: ${script.length} characters`);
      } catch (captionError) {
        throw new Error(
          `Failed to extract transcript: Gemini error (${geminiError instanceof Error ? geminiError.message : "Unknown"}) ` +
          `and caption extraction also failed (${captionError instanceof Error ? captionError.message : "Unknown"}). ` +
          `Make sure your Gemini API key is set in Settings > API Keys.`
        );
      }
    }
    
    if (!script || script.trim().length === 0) {
      throw new Error("Received empty transcript from video");
    }
    
    // Clean and process the script
    const cleanedScript = script
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\[.*?\]/g, "") // Remove brackets content (like [Music], [Applause])
      .replace(/\(.*?\)/g, "") // Remove parentheses content (like (laughing))
      .trim();
    
    if (cleanedScript.length === 0) {
      throw new Error("Script became empty after cleaning");
    }
    
    console.log(`Successfully processed transcript: ${cleanedScript.length} characters`);
    
    return {
      videoId: metadata.videoId,
      script: cleanedScript,
      language: "en",
      duration: metadata.duration,
    };
  } catch (error) {
    console.error("Error extracting script:", error);
    throw new Error(
      `Failed to extract audio transcript from video: ${error instanceof Error ? error.message : "Unknown error"}. ` +
      `Make sure your Gemini API key is set in Settings > API Keys.`
    );
  }
}

/**
 * Split script into logical segments for video clip mapping
 */
export function segmentScript(script: string, segmentDuration: number = 10): string[] {
  const words = script.split(" ");
  const wordsPerSegment = Math.ceil(words.length / Math.ceil(script.length / 200));
  const segments: string[] = [];
  
  for (let i = 0; i < words.length; i += wordsPerSegment) {
    segments.push(words.slice(i, i + wordsPerSegment).join(" "));
  }
  
  return segments.filter((segment) => segment.trim().length > 0);
}

/**
 * Checks if the provided string is a valid YouTube URL format.
 */
function isValidYouTubeUrl(url: string): boolean {
  // Matches common YouTube formats: watch?v=, youtu.be/, shorts/, live/
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/;
  return regex.test(url);
}

/**
 * Fetches content with an exponential backoff retry mechanism for handling rate limits.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 5
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`Attempt ${attempt + 1}: Rate limit hit. Retrying in ${Math.round(delay / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          `API error: ${response.status} ${response.statusText} - ${errorBody.error?.message || 'Unknown Error'}`
        );
      }
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error; // Re-throw the error after last attempt
      }
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.error(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay / 1000)}s...`, error instanceof Error ? error.message : error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries reached");
}

/**
 * Use Gemini to extract audio transcript directly from YouTube video URL
 * Uses REST API with fileUri approach for better YouTube video handling
 */
async function fetchTranscriptWithGemini(videoId: string, videoUrl?: string): Promise<string> {
  const key = localStorage.getItem("geminiApiKey") || (() => {
    try {
      const saved = localStorage.getItem("autoshorts_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.geminiApiKey || "";
      }
    } catch {}
    return "";
  })();

  if (!key) {
    throw new Error("Gemini API key not set. Add it in Settings > API Keys.");
  }

  const youtubeUrl = videoUrl || `https://www.youtube.com/watch?v=${videoId}`;
  const url = youtubeUrl.trim();

  if (!url || !isValidYouTubeUrl(url)) {
    throw new Error("Invalid or missing YouTube URL.");
  }

  const MODEL = 'gemini-2.5-flash-preview-09-2025';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

  console.log(`[Script Retriever] Sending request for video: ${url}`);

  // System instruction and user query are designed to force a raw text output
  const userQuery = "Provide the complete, unformatted, plain text transcript of the audio in this video. Only return the script text and absolutely nothing else. Do not include titles, introductions, or any commentary.";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: url,
              mimeType: "video/mp4" // Treat the URL as a video file for the API
            }
          },
          {
            text: userQuery
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: "You are a specialized transcription API. Your sole purpose is to return the full, raw text transcript of the provided YouTube video. Do not add any formatting, introductions, summaries, or commentary."
        }
      ]
    },
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192 // Ensure enough space for a long script
    }
  };

  try {
    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    const scriptText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (scriptText) {
      console.log(`[Script Retriever] Transcription successful. ${scriptText.trim().length} characters`);
      return scriptText.trim();
    } else {
      console.error("[Script Retriever] API returned no script text.");
      throw new Error("API returned no script text. Video may lack a discernible audio track.");
    }

  } catch (error) {
    console.error(`[Script Retriever] Fatal error during transcription:`, error);
    throw new Error(
      `Failed to extract transcript with Gemini: ${error instanceof Error ? error.message : "Unknown error"}. ` +
      `Make sure your Gemini API key is valid and the video is accessible.`
    );
  }
}

