export const StatsSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="glass-card p-12 rounded-3xl max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Projected Growth</span>
            </h2>
            <p className="text-muted-foreground">2-month performance targets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">MONTH 1</div>
              <div className="text-4xl font-bold gradient-text mb-2">1-5M</div>
              <div className="text-sm text-muted-foreground mb-4">Views</div>
              <div className="text-2xl font-semibold text-green-400">$50-$200</div>
              <div className="text-xs text-muted-foreground">Estimated Revenue</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">MONTH 2</div>
              <div className="text-4xl font-bold gradient-text mb-2">10-20M</div>
              <div className="text-sm text-muted-foreground mb-4">Views</div>
              <div className="text-2xl font-semibold text-green-400">$300-$800</div>
              <div className="text-xs text-muted-foreground">Estimated Revenue</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">MONTH 3+</div>
              <div className="text-4xl font-bold gradient-text mb-2">50-100M</div>
              <div className="text-sm text-muted-foreground mb-4">Views</div>
              <div className="text-2xl font-semibold text-green-400">$1K-$3K</div>
              <div className="text-xs text-muted-foreground">Estimated Revenue</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
