import { Brain, Zap, DollarSign, TrendingUp, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recreation",
    description: "Advanced AI analyzes and recreates viral content with unique variations",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate 2-5 shorts per day automatically with zero manual editing",
  },
  {
    icon: DollarSign,
    title: "Low Cost Operation",
    description: "Run everything under $20/month using free-tier APIs and services",
  },
  {
    icon: TrendingUp,
    title: "Proven Virality",
    description: "Leverage content that's already performing well in your niche",
  },
  {
    icon: Clock,
    title: "Automated Pipeline",
    description: "Set it and forget it - cron jobs handle everything from discovery to upload",
  },
  {
    icon: Shield,
    title: "Copyright Safe",
    description: "Original scripts, fresh voiceovers, and stock footage keep you protected",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <br />
            <span className="gradient-text">Go Viral</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for creating and publishing viral shorts at scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card p-8 rounded-2xl hover:shadow-glow transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
