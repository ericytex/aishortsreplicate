import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Key, 
  Globe, 
  Bell,
  Save,
  Eye,
  EyeOff,
  TrendingUp,
  Download,
  Upload,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getDefaultThresholds } from "@/lib/youtube";
import { exportDatabase, importDatabase } from "@/lib/database";

export const SettingsPanel = () => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const defaultThresholds = getDefaultThresholds();
  
  const [settings, setSettings] = useState({
    // API Keys
    openrouterApiKey: "",
    geminiApiKey: "",
    pexelsApiKey: "",
    youtubeApiKey: "",
    tiktokApiKey: "",
    
    // Publishing Settings
    autoPublishYouTube: true,
    autoPublishTikTok: false,
    autoPublishInstagram: false,
    
    // Content Settings
    niche: "AI Tools",
    maxVideosPerDay: 5,
    videoDuration: 60,
    
    // Viral Metrics
    viralMetrics: {
      minViews: defaultThresholds.minViews,
      minLikeRatio: defaultThresholds.minLikeRatio * 100, // Store as percentage
      minCommentRatio: defaultThresholds.minCommentRatio * 100, // Store as percentage
      maxDaysOld: defaultThresholds.maxDaysOld,
    },
    
    // Automation
    enableAutomation: true,
    scheduleTime: "09:00",
  });

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    // Load from localStorage if present
    try {
      const saved = localStorage.getItem("autoshorts_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const handleSave = () => {
    // Persist to localStorage for now
    try {
      localStorage.setItem("autoshorts_settings", JSON.stringify(settings));
      if (settings.geminiApiKey) {
        localStorage.setItem("geminiApiKey", settings.geminiApiKey);
      }
    } catch {}
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    });
  };

  const handleExportDatabase = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: "application/x-sqlite3" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `autoshorts-backup-${new Date().toISOString().split("T")[0]}.sqlite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Database Exported",
        description: "Your database has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Failed to export database: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      await importDatabase(uint8Array);
      
      toast({
        title: "Database Imported",
        description: "Your database has been imported successfully. Please refresh the page.",
      });
      
      // Reset file input
      event.target.value = "";
    } catch (error) {
      toast({
        title: "Import Failed",
        description: `Failed to import database: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const apiKeyFields = [
    { key: "openrouterApiKey", label: "OpenRouter API Key", placeholder: "sk-..." },
    { key: "geminiApiKey", label: "Gemini API Key", placeholder: "AIza..." },
    { key: "pexelsApiKey", label: "Pexels API Key", placeholder: "Your Pexels API key" },
    { key: "youtubeApiKey", label: "YouTube Data API Key", placeholder: "Your YouTube API key" },
    { key: "tiktokApiKey", label: "TikTok API Key", placeholder: "Your TikTok API key (optional)" },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="publishing" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Publishing
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="viral" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Viral Metrics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API keys for AI, video, and publishing services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeyFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      id={field.key}
                      type={showKeys[field.key] ? "text" : "password"}
                      placeholder={field.placeholder}
                      value={settings[field.key as keyof typeof settings] as string}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleKeyVisibility(field.key)}
                    >
                      {showKeys[field.key] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Platforms</CardTitle>
              <CardDescription>
                Configure where your videos will be automatically published
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-publish to YouTube</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically upload completed videos</p>
                </div>
                <Switch
                  checked={settings.autoPublishYouTube}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, autoPublishYouTube: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>TikTok Auto-publish</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload to TikTok automatically (requires API access)
                  </p>
                </div>
                <Switch
                  checked={settings.autoPublishTikTok}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, autoPublishTikTok: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Instagram Auto-publish</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload to Instagram Reels automatically
                  </p>
                </div>
                <Switch
                  checked={settings.autoPublishInstagram}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, autoPublishInstagram: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>
                Configure content generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="niche">Target Niche</Label>
                <Input
                  id="niche"
                  value={settings.niche}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, niche: e.target.value }))
                  }
                  placeholder="AI Tools, Productivity, Finance, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxVideosPerDay">Max Videos Per Day</Label>
                <Input
                  id="maxVideosPerDay"
                  type="number"
                  value={settings.maxVideosPerDay}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxVideosPerDay: parseInt(e.target.value) || 5,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoDuration">Video Duration (seconds)</Label>
                <Input
                  id="videoDuration"
                  type="number"
                  value={settings.videoDuration}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      videoDuration: parseInt(e.target.value) || 60,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viral Metrics Thresholds</CardTitle>
              <CardDescription>
                Configure what makes a video "viral" for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minViews">Minimum View Count</Label>
                <Input
                  id="minViews"
                  type="number"
                  value={settings.viralMetrics.minViews}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      viralMetrics: {
                        ...prev.viralMetrics,
                        minViews: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Videos below this view count won't be considered viral
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minLikeRatio">Minimum Like Ratio (%)</Label>
                <Input
                  id="minLikeRatio"
                  type="number"
                  step="0.1"
                  value={settings.viralMetrics.minLikeRatio}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      viralMetrics: {
                        ...prev.viralMetrics,
                        minLikeRatio: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum percentage of viewers who liked (default: 3%)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minCommentRatio">Minimum Comment Ratio (%)</Label>
                <Input
                  id="minCommentRatio"
                  type="number"
                  step="0.01"
                  value={settings.viralMetrics.minCommentRatio}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      viralMetrics: {
                        ...prev.viralMetrics,
                        minCommentRatio: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum percentage of viewers who commented (default: 0.5%)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDaysOld">Maximum Days Old</Label>
                <Input
                  id="maxDaysOld"
                  type="number"
                  value={settings.viralMetrics.maxDaysOld}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      viralMetrics: {
                        ...prev.viralMetrics,
                        maxDaysOld: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Videos older than this won't be considered "trending" (default: 30 days)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure automated video creation schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Automation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create videos on a schedule
                  </p>
                </div>
                <Switch
                  checked={settings.enableAutomation}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, enableAutomation: checked }))
                  }
                />
              </div>
              {settings.enableAutomation && (
                <div className="space-y-2">
                  <Label htmlFor="scheduleTime">Schedule Time</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={settings.scheduleTime}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, scheduleTime: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Videos will be created at this time daily (VPS timezone)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Export or import your database backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Export Database</h3>
                    <p className="text-sm text-muted-foreground">
                      Download a backup of all your projects and data
                    </p>
                  </div>
                  <Button onClick={handleExportDatabase} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Import Database</h3>
                  <p className="text-sm text-muted-foreground">
                    Restore a previous database backup
                  </p>
                  <Input
                    type="file"
                    accept=".sqlite,application/x-sqlite3"
                    onChange={handleImportDatabase}
                  />
                  <Button onClick={() => document.getElementById("import-db")?.click()} variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    id="import-db"
                    type="file"
                    accept=".sqlite,application/x-sqlite3"
                    onChange={handleImportDatabase}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

