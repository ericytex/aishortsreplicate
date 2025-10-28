import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeaturesSection } from "@/components/FeaturesSection";
import { WorkflowSection } from "@/components/WorkflowSection";
import { StatsSection } from "@/components/StatsSection";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <FeaturesSection />
      <WorkflowSection />
      <StatsSection />
      <CTASection />
    </div>
  );
};

export default Index;
