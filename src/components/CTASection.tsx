import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="glass-card p-12 md:p-16 rounded-3xl max-w-4xl mx-auto text-center glow-effect">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your
            <br />
            <span className="gradient-text">Viral Journey?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join creators who are already leveraging proven viral content
            to grow their channels and monetize their audience.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-12 py-6 h-auto">
            <Rocket className="w-6 h-6 mr-2" />
            Launch Your MVP Today
          </Button>
          <p className="text-sm text-muted-foreground mt-6">
            14-day build plan • $0-$20 budget • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};
