import { motion } from "framer-motion";
import { 
  Brain, 
  MessageCircle, 
  BarChart3, 
  Sparkles, 
  Shield, 
  Zap 
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const features = [
  {
    icon: Brain,
    title: "Personality Learning",
    description: "Your twin learns your unique personality traits, preferences, and decision-making patterns through natural conversations.",
    color: "text-primary",
    glow: "cyan" as const,
  },
  {
    icon: MessageCircle,
    title: "Natural Conversations",
    description: "Chat naturally with your digital twin. It understands context, remembers past conversations, and grows with you.",
    color: "text-secondary",
    glow: "pink" as const,
  },
  {
    icon: BarChart3,
    title: "Behavioral Analytics",
    description: "Gain insights into your patterns, moods, and tendencies with beautiful visualizations and actionable insights.",
    color: "text-accent",
    glow: "purple" as const,
  },
  {
    icon: Sparkles,
    title: "Decision Simulation",
    description: "Run scenarios and see how your twin would respond. Perfect for exploring different approaches to challenges.",
    color: "text-primary",
    glow: "cyan" as const,
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays yours. End-to-end encryption ensures your conversations and personality data remain private.",
    color: "text-secondary",
    glow: "pink" as const,
  },
  {
    icon: Zap,
    title: "Real-time Sync",
    description: "Your twin evolves in real-time, adapting to new information and experiences as you share them.",
    color: "text-accent",
    glow: "purple" as const,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 anime-gradient-bg opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full glass-card text-sm font-medium text-primary mb-4"
          >
            Features
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Everything You Need to{" "}
            <span className="neon-text">Build Your Twin</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed to create the most authentic digital representation of yourself.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <GlassCard
                variant="hover"
                className="p-6 h-full group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`inline-flex p-3 rounded-xl glass-card ${feature.color} mb-4`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <feature.icon className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
