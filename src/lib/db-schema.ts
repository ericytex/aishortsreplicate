/**
 * Database Schema Definitions
 * 
 * SQLite database schema for AutoShorts AI application.
 * Stores video projects, metadata, scripts, assets, and workflow state.
 */

export interface ProjectRow {
  id: string;
  url?: string;
  topic?: string;
  title: string;
  status: string;
  current_step: number;
  created_at: string;
  completed_at?: string;
}

export interface ProjectMetadataRow {
  id: string;
  project_id: string;
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_title: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  comments: number;
  upload_date: string;
  duration: number;
  like_ratio: number;
  comment_ratio: number;
  viral_score: number;
  is_viral: boolean;
}

export interface ProjectScriptRow {
  id: string;
  project_id: string;
  video_id: string;
  script: string;
  language: string;
  duration: number;
}

export interface WorkflowStepRow {
  id: string;
  project_id: string;
  step_id: number;
  name: string;
  description: string;
  status: string;
}

export interface ProjectAssetRow {
  id: string;
  project_id: string;
  asset_type: string; // 'audio', 'video_clip', 'final_video', 'thumbnail'
  asset_url: string;
  asset_data?: string; // Base64 encoded data
  created_at: string;
}

export interface ScriptSegmentRow {
  id: string;
  project_id: string;
  segment_index: number;
  segment_text: string;
}

export interface SettingsRow {
  key: string;
  value: string;
}

/**
 * SQL Schema for creating tables
 */
export const createSchemaSQL = `
  -- Projects table
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    url TEXT,
    topic TEXT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    current_step INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );

  -- Project metadata table
  CREATE TABLE IF NOT EXISTS project_metadata (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    channel_id TEXT,
    channel_title TEXT,
    thumbnail_url TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    upload_date TEXT,
    duration INTEGER DEFAULT 0,
    like_ratio REAL DEFAULT 0,
    comment_ratio REAL DEFAULT 0,
    viral_score INTEGER DEFAULT 0,
    is_viral BOOLEAN DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Project scripts table
  CREATE TABLE IF NOT EXISTS project_scripts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    video_id TEXT,
    script TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    duration INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Workflow steps table
  CREATE TABLE IF NOT EXISTS workflow_steps (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    step_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Project assets table
  CREATE TABLE IF NOT EXISTS project_assets (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    asset_url TEXT,
    asset_data TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Script segments table
  CREATE TABLE IF NOT EXISTS script_segments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    segment_index INTEGER NOT NULL,
    segment_text TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  -- Settings table
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_project_metadata_project_id ON project_metadata(project_id);
  CREATE INDEX IF NOT EXISTS idx_project_scripts_project_id ON project_scripts(project_id);
  CREATE INDEX IF NOT EXISTS idx_workflow_steps_project_id ON workflow_steps(project_id);
  CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON project_assets(project_id);
  CREATE INDEX IF NOT EXISTS idx_script_segments_project_id ON script_segments(project_id);
`;

