import { Button } from "@/components/ui/button";
import { Play, Zap, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="container mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 animate-fade-in">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">AI-Powered Viral Content Creator</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Turn Viral Shorts Into
          <br />
          <span className="gradient-text">Your Own Success</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Identify trending content, recreate it with AI, and publish to your channels.
          Automated pipeline from discovery to monetization.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-effect text-lg px-8">
              <Play className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 text-lg px-8">
            <TrendingUp className="w-5 h-5 mr-2" />
            View Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { value: "50-100", label: "Shorts per Month", icon: "📹" },
            { value: "$0-$20", label: "Monthly Cost", icon: "💰" },
            { value: "10-20M", label: "Views Target", icon: "👀" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 rounded-2xl">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
