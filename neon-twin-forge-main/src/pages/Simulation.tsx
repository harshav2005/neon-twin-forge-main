import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  RotateCcw, 
  ChevronRight,
  Brain,
  Target,
  Sparkles,
  Clock
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimeButton } from "@/components/ui/anime-button";

interface SimulationStep {
  id: number;
  title: string;
  description: string;
  probability: number;
  outcome: "positive" | "neutral" | "negative";
}

const mockSteps: SimulationStep[] = [
  {
    id: 1,
    title: "Initial Assessment",
    description: "Analyzing the scenario based on your personality profile and past decisions...",
    probability: 85,
    outcome: "neutral",
  },
  {
    id: 2,
    title: "Emotional Response",
    description: "Your empathetic nature would first consider the impact on others involved.",
    probability: 78,
    outcome: "positive",
  },
  {
    id: 3,
    title: "Logical Analysis",
    description: "Breaking down the problem into key components and weighing pros/cons.",
    probability: 92,
    outcome: "positive",
  },
  {
    id: 4,
    title: "Risk Evaluation",
    description: "Considering potential downsides - your cautious side suggests proceeding carefully.",
    probability: 65,
    outcome: "neutral",
  },
  {
    id: 5,
    title: "Final Decision",
    description: "Based on analysis, your twin recommends moving forward with a measured approach.",
    probability: 88,
    outcome: "positive",
  },
];

export default function Simulation() {
  const [scenario, setScenario] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SimulationStep[]>([]);

  const runSimulation = async () => {
    if (!scenario.trim()) return;
    
    setIsRunning(true);
    setSteps([]);
    setCurrentStep(0);

    for (let i = 0; i < mockSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSteps((prev) => [...prev, mockSteps[i]]);
      setCurrentStep(i + 1);
    }

    setIsRunning(false);
  };

  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "positive": return "text-primary";
      case "negative": return "text-destructive";
      default: return "text-yellow-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Decision <span className="neon-text">Simulation</span>
          </h1>
          <p className="text-muted-foreground">
            See how your digital twin would approach different scenarios
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Scenario Input
                </h2>
                <textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="Describe a scenario or decision you'd like to simulate. For example: 'Should I accept a job offer that pays more but requires relocating to a new city?'"
                  className="w-full h-40 p-4 rounded-xl bg-input/50 border border-border/50 resize-none focus:outline-none focus:border-primary transition-colors"
                />
                <div className="flex gap-3 mt-4">
                  <AnimeButton
                    variant="neon"
                    onClick={runSimulation}
                    disabled={isRunning || !scenario.trim()}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </AnimeButton>
                  <AnimeButton
                    variant="outline"
                    onClick={resetSimulation}
                    disabled={steps.length === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </AnimeButton>
                </div>
              </GlassCard>
            </motion.div>

            {/* Probability Sliders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  Confidence Factors
                </h2>
                <div className="space-y-4">
                  {[
                    { name: "Analytical Weight", value: 75 },
                    { name: "Emotional Weight", value: 60 },
                    { name: "Risk Tolerance", value: 45 },
                  ].map((factor) => (
                    <div key={factor.name}>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>{factor.name}</span>
                        <span className="text-primary">{factor.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.value}%` }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard className="p-6 h-full">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Decision Timeline
              </h2>

              {steps.length === 0 && !isRunning ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Brain className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    Enter a scenario and run the simulation to see how your twin would approach the decision.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        {/* Timeline Line */}
                        {index < steps.length - 1 && (
                          <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
                        )}

                        <div className="flex gap-4">
                          {/* Step Number */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.outcome === "positive" ? "bg-primary/20 text-primary" :
                            step.outcome === "negative" ? "bg-destructive/20 text-destructive" :
                            "bg-yellow-500/20 text-yellow-500"
                          }`}>
                            {index + 1}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 pb-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                              {step.title}
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <span className={`text-xs ${getOutcomeColor(step.outcome)}`}>
                                {step.probability}% confidence
                              </span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Loading Indicator */}
                  {isRunning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <motion.div
                          className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Processing step {currentStep + 1}...
                      </span>
                    </motion.div>
                  )}

                  {/* Final Summary */}
                  {!isRunning && steps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30"
                    >
                      <h3 className="font-display font-semibold text-primary mb-2">
                        Simulation Complete
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your digital twin completed the analysis with an overall confidence of{" "}
                        <span className="text-primary font-semibold">82%</span>. 
                        The recommendation is to proceed with careful consideration of the identified risks.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
