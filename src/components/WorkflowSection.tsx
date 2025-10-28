import { Search, FileText, Mic, Video, Upload, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Viral Shorts",
    description: "Identify trending content in your niche with proven performance",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FileText,
    title: "Extract & Rewrite",
    description: "AI analyzes and recreates the script with unique enhancements",
    color: "from-pink-500 to-orange-500",
  },
  {
    icon: Mic,
    title: "Generate Voice",
    description: "Professional text-to-speech creates engaging narration",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Video,
    title: "Create Visuals",
    description: "Stock footage and AI-generated clips replace original content",
    color: "from-yellow-500 to-green-500",
  },
  {
    icon: CheckCircle,
    title: "Render Video",
    description: "Combine elements into a polished 9:16 short",
    color: "from-green-500 to-blue-500",
  },
  {
    icon: Upload,
    title: "Auto Publish",
    description: "Post directly to YouTube, TikTok, and Instagram",
    color: "from-blue-500 to-purple-500",
  },
];

export const WorkflowSection = () => {
  return (
    <section id="workflow" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Automated Workflow</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From viral discovery to published content in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-muted-foreground">STEP {index + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
