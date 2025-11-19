import initSqlJs, { Database as SQLiteDatabase } from "sql.js";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { createSchemaSQL, ProjectRow, ProjectMetadataRow, ProjectScriptRow, WorkflowStepRow, ProjectAssetRow, ScriptSegmentRow, SettingsRow } from "./db-schema";
import type { VideoProject } from "../pages/Dashboard";
import type { VideoMetadata } from "../types/youtube";
import type { CaptionData } from "./subtitles";

/**
 * Database Service for AutoShorts AI
 * 
 * Manages SQLite database in the browser using sql.js
 * Persists data to IndexedDB for file-like storage
 */

let dbInstance: SQLiteDatabase | null = null;
let isInitializing = false;
const DB_NAME = "autoshorts_db";
const DB_STORE = "sqlite_data";

interface AutoshortsDB extends DBSchema {
  sqlite_data: {
    key: string;
    value: ArrayBuffer;
  };
}

/**
 * Initialize the SQLite database
 */
export async function initDatabase(): Promise<void> {
  if (dbInstance || isInitializing) return;
  
  isInitializing = true;
  
  try {
    // Initialize sql.js
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });

    // Try to load existing database from IndexedDB
    const savedDatabase = await loadDatabase();
    
    if (savedDatabase) {
      dbInstance = new SQL.Database(new Uint8Array(savedDatabase));
    } else {
      // Create new database
      dbInstance = new SQL.Database();
      // Initialize schema
      dbInstance.run(createSchemaSQL);
      await saveDatabase();
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * Load database from IndexedDB
 */
async function loadDatabase(): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB<AutoshortsDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(DB_STORE);
      },
    });
    
    const data = await db.get(DB_STORE, DB_NAME);
    await db.close();
    return data || null;
  } catch (error) {
    console.error("Failed to load database from IndexedDB:", error);
    return null;
  }
}

/**
 * Save database to IndexedDB
 */
async function saveDatabase(): Promise<void> {
  if (!dbInstance) return;
  
  try {
    const data = dbInstance.export();
    const db = await openDB<AutoshortsDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(DB_STORE);
      },
    });
    
    await db.put(DB_STORE, data.buffer, DB_NAME);
    await db.close();
    
    console.log("Database saved to IndexedDB");
  } catch (error) {
    console.error("Failed to save database to IndexedDB:", error);
  }
}

/**
 * Get or initialize database instance
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!dbInstance) {
    await initDatabase();
  }
  if (!dbInstance) {
    throw new Error("Database not initialized");
  }
  return dbInstance;
}

/**
 * Project CRUD Operations
 */

export async function createProject(data: {
  id: string;
  url?: string;
  topic?: string;
  title: string;
  status: string;
  currentStep: number;
  createdAt: Date;
  completedAt?: Date;
}): Promise<void> {
  const db = await getDatabase();
  
  db.run(
    `INSERT INTO projects (id, url, topic, title, status, current_step, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.url || null,
      data.topic || null,
      data.title,
      data.status,
      data.currentStep,
      data.createdAt.toISOString(),
      data.completedAt?.toISOString() || null
    ]
  );
  
  saveDatabase();
}

export async function updateProject(id: string, updates: Partial<ProjectRow>): Promise<void> {
  const db = await getDatabase();
  
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
  const values = Object.values(updates);
  
  if (fields) {
    db.run(`UPDATE projects SET ${fields} WHERE id = ?`, [...values, id]);
    saveDatabase();
  }
}

export async function getProject(id: string): Promise<VideoProject | null> {
  const db = await getDatabase();
  
  const result = db.exec(`SELECT * FROM projects WHERE id = '${id}'`);
  if (result.length === 0) return null;
  
  const project = result[0].values[0] as any[];
  const columns = result[0].columns as string[];
  
  const projectData: any = {};
  columns.forEach((col, idx) => {
    projectData[col] = project[idx];
  });
  
  const steps = await getWorkflowSteps(id);
  const metadata = await getProjectMetadata(id);
  const script = await getProjectScript(id);
  const segments = await getScriptSegments(id);
  
  return {
    id: projectData.id,
    url: projectData.url,
    topic: projectData.topic,
    title: projectData.title,
    status: projectData.status,
    currentStep: projectData.current_step,
    createdAt: new Date(projectData.created_at),
    completedAt: projectData.completed_at ? new Date(projectData.completed_at) : undefined,
    steps,
    sourceMetadata: metadata,
    viralScore: metadata?.engagement.score,
    scriptData: script ? {
      videoId: script.videoId || "",
      script: script.script,
      language: script.language,
      duration: script.duration
    } : undefined,
    scriptSegments: segments
  };
}

export async function getAllProjects(): Promise<VideoProject[]> {
  const db = await getDatabase();
  
  const result = db.exec(`SELECT * FROM projects ORDER BY created_at DESC`);
  if (result.length === 0) return [];
  
  const projects: VideoProject[] = [];
  
  for (const row of result[0].values) {
    const projectData: any = {};
    result[0].columns.forEach((col, idx) => {
      projectData[col] = row[idx];
    });
    
    const steps = await getWorkflowSteps(projectData.id);
    const metadata = await getProjectMetadata(projectData.id);
    const script = await getProjectScript(projectData.id);
    const segments = await getScriptSegments(projectData.id);
    
    projects.push({
      id: projectData.id,
      url: projectData.url,
      topic: projectData.topic,
      title: projectData.title,
      status: projectData.status,
      currentStep: projectData.current_step,
      createdAt: new Date(projectData.created_at),
      completedAt: projectData.completed_at ? new Date(projectData.completed_at) : undefined,
      steps,
      sourceMetadata: metadata,
      viralScore: metadata?.engagement.score,
      scriptData: script ? {
        videoId: script.videoId || "",
        script: script.script,
        language: script.language,
        duration: script.duration
      } : undefined,
      scriptSegments: segments
    });
  }
  
  return projects;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDatabase();
  
  db.run(`DELETE FROM projects WHERE id = ?`, [id]);
  saveDatabase();
}

/**
 * Metadata Operations
 */

export async function saveProjectMetadata(projectId: string, metadata: VideoMetadata): Promise<void> {
  const db = await getDatabase();
  
  db.run(
    `INSERT OR REPLACE INTO project_metadata 
     (id, project_id, video_id, title, description, channel_id, channel_title, thumbnail_url,
      views, likes, comments, upload_date, duration, like_ratio, comment_ratio, viral_score, is_viral)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      `metadata-${projectId}`,
      projectId,
      metadata.videoId,
      metadata.title,
      metadata.description,
      metadata.channelId,
      metadata.channelTitle,
      metadata.thumbnailUrl,
      metadata.views,
      metadata.likes,
      metadata.comments,
      metadata.uploadDate.toISOString(),
      metadata.duration,
      metadata.engagement.likeRatio,
      metadata.engagement.commentRatio,
      metadata.engagement.score,
      metadata.isViral ? 1 : 0
    ]
  );
  
  saveDatabase();
}

async function getProjectMetadata(projectId: string): Promise<VideoMetadata | undefined> {
  const db = await getDatabase();
  
  const result = db.exec(`SELECT * FROM project_metadata WHERE project_id = '${projectId}' LIMIT 1`);
  if (result.length === 0) return undefined;
  
  const row = result[0].values[0] as any[];
  const columns = result[0].columns as string[];
  
  const metadata: any = {};
  columns.forEach((col, idx) => {
    metadata[col] = row[idx];
  });
  
  return {
    videoId: metadata.video_id,
    title: metadata.title,
    description: metadata.description,
    channelId: metadata.channel_id,
    channelTitle: metadata.channel_title,
    thumbnailUrl: metadata.thumbnail_url,
    views: metadata.views,
    likes: metadata.likes,
    comments: metadata.comments,
    uploadDate: new Date(metadata.upload_date),
    duration: metadata.duration,
    engagement: {
      likeRatio: metadata.like_ratio,
      commentRatio: metadata.comment_ratio,
      score: metadata.viral_score
    },
    isViral: Boolean(metadata.is_viral)
  };
}

/**
 * Script Operations
 */

export async function saveProjectScript(projectId: string, scriptData: CaptionData): Promise<void> {
  const db = await getDatabase();
  
  db.run(
    `INSERT OR REPLACE INTO project_scripts (id, project_id, video_id, script, language, duration)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      `script-${projectId}`,
      projectId,
      scriptData.videoId,
      scriptData.script,
      scriptData.language,
      scriptData.duration
    ]
  );
  
  saveDatabase();
}

async function getProjectScript(projectId: string): Promise<CaptionData | undefined> {
  const db = await getDatabase();
  
  const result = db.exec(`SELECT * FROM project_scripts WHERE project_id = '${projectId}' LIMIT 1`);
  if (result.length === 0) return undefined;
  
  const row = result[0].values[0] as any[];
  const columns = result[0].columns as string[];
  
  const script: any = {};
  columns.forEach((col, idx) => {
    script[col] = row[idx];
  });
  
  return {
    videoId: script.video_id,
    script: script.script,
    language: script.language,
    duration: script.duration
  };
}

/**
 * Workflow Steps Operations
 */

export async function saveWorkflowStep(projectId: string, step: {
  id: number;
  name: string;
  status: string;
  description: string;
}): Promise<void> {
  const db = await getDatabase();
  
  db.run(
    `INSERT OR REPLACE INTO workflow_steps (id, project_id, step_id, name, description, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      `step-${projectId}-${step.id}`,
      projectId,
      step.id,
      step.name,
      step.description,
      step.status
    ]
  );
  
  saveDatabase();
}

async function getWorkflowSteps(projectId: string): Promise<VideoProject["steps"]> {
  const db = await getDatabase();
  
  const result = db.exec(`SELECT * FROM workflow_steps WHERE project_id = '${projectId}' ORDER BY step_id`);
  if (result.length === 0) return [];
  
  const steps: VideoProject["steps"] = [];
  
  for (const row of result[0].values) {
    const stepData: any = {};
    result[0].columns.forEach((col, idx) => {
      stepData[col] = row[idx];
    });
    
    steps.push({
      id: stepData.step_id,
      name: stepData.name,
      status: stepData.status,
      description: stepData.description
    });
  }
  
  return steps;
}

/**
 * Script Segments Operations
 */

export async function saveScriptSegments(projectId: string, segments: string[]): Promise<void> {
  const db = await getDatabase();
  
  // Delete existing segments
  db.run(`DELETE FROM script_segments WHERE project_id = ?`, [projectId]);
  
  // Insert new segments
  segments.forEach((segment, index) => {
    db.run(
      `INSERT INTO script_segments (id, project_id, segment_index, segment_text)
       VALUES (?, ?, ?, ?)`,
      [
        `segment-${projectId}-${index}`,
        projectId,
        index,
        segment
      ]
    );
  });
  
  saveDatabase();
}

async function getScriptSegments(projectId: string): Promise<string[]> {
  const db = await getDatabase();
  
  const result = db.exec(`SELECT * FROM script_segments WHERE project_id = '${projectId}' ORDER BY segment_index`);
  if (result.length === 0) return [];
  
  const segments: string[] = [];
  
  for (const row of result[0].values) {
    const segmentData: any = {};
    result[0].columns.forEach((col, idx) => {
      segmentData[col] = row[idx];
    });
    
    segments.push(segmentData.segment_text);
  }
  
  return segments;
}

/**
 * Export and Import Database
 */

export async function exportDatabase(): Promise<Uint8Array> {
  const db = await getDatabase();
  return db.export();
}

export async function importDatabase(data: Uint8Array): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`
  });
  
  dbInstance = new SQL.Database(data);
  saveDatabase();
}

