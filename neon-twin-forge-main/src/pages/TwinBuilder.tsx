import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Sliders,
  FileText,
  Mic,
  Brain,
  Eye,
  Save,
  RefreshCw
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimeButton } from "@/components/ui/anime-button";
import twinService from "@/services/twinService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Define initial state as a constant to allow resetting
const INITIAL_TRAITS = [
  { name: "Analytical", value: 75, key: "analytical" },
  { name: "Creative", value: 60, key: "creative" },
  { name: "Empathetic", value: 85, key: "empathetic" },
  { name: "Adventurous", value: 45, key: "adventurous" },
  { name: "Organized", value: 70, key: "organized" },
  { name: "Social", value: 55, key: "social" },
];

const INITIAL_PREFS = [
  { name: "Morning Person", enabled: true },
  { name: "Detail Oriented", enabled: true },
  { name: "Risk Taker", enabled: false },
  { name: "Team Player", enabled: true },
  { name: "Fast Decision Maker", enabled: false },
];

export default function TwinBuilder() {
  const navigate = useNavigate();
  // Deep copy initial state to avoid reference issues
  const [traits, setTraits] = useState(INITIAL_TRAITS.map(t => ({ ...t })));
  const [prefs, setPrefs] = useState(INITIAL_PREFS.map(p => ({ ...p })));
  const [loading, setLoading] = useState(false);
  const [previewText, setPreviewText] = useState("");

  // Update preview text whenever traits change
  useEffect(() => {
    const topTraits = [...traits].sort((a, b) => b.value - a.value).slice(0, 2);
    const traitNames = topTraits.map(t => t.name.toLowerCase());

    let text = "Based on the current configuration, your digital twin would approach problems methodically.";

    if (traitNames[0]) {
      if (traitNames.includes('creative') && traitNames.includes('adventurous')) {
        text = "Your twin acts with spontaneous creativity, often suggesting bold and unconventional ideas.";
      } else if (traitNames.includes('analytical') && traitNames.includes('organized')) {
        text = "Your twin prefers structure and logic, breaking down complex problems into manageable steps.";
      } else if (traitNames.includes('empathetic') && traitNames.includes('social')) {
        text = "Your twin prioritizes emotional connection, offering supportive and people-focused advice.";
      } else {
        text = `Your twin is primarily ${traitNames[0]} and ${traitNames[1] || 'balanced'}, blending these qualities to provide personalized insights.`;
      }
    }
    setPreviewText(text);
  }, [traits]);

  // Load existing profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await twinService.getProfile();
        if (profile && profile.personality) {
          setTraits(prev => prev.map(t => ({
            ...t,
            value: profile.personality[t.key] ?? t.value
          })));

          if (profile.preferences) {
            setPrefs(profile.preferences);
          }
        }
      } catch (error) {
        console.log("No existing profile found or error fetching.", error);
      }
    };
    loadProfile();
  }, []);

  // Immutable update handler
  const handleTraitChange = (index: number, newValue: number) => {
    setTraits(prev => prev.map((t, i) =>
      i === index ? { ...t, value: newValue } : t
    ));
  };

  const handlePrefToggle = (index: number) => {
    setPrefs(prev => prev.map((p, i) =>
      i === index ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const handleReset = () => {
    // Reset to initial constants (deep copy)
    setTraits(INITIAL_TRAITS.map(t => ({ ...t })));
    setPrefs(INITIAL_PREFS.map(p => ({ ...p })));
    toast.info("Configuration reset to defaults.");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const personalityObj: any = {};
      traits.forEach(t => {
        if (t.key) personalityObj[t.key] = t.value;
      });

      const payload = {
        personality: personalityObj,
        preferences: prefs,
        status: 'active',
        version: '2.4'
      };

      await twinService.updateProfile(payload);
      toast.success("Twin configuration saved successfully!");

      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error: any) {
      console.error("Save Error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
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
            <span className="neon-text">Twin Builder</span>
          </h1>
          <p className="text-muted-foreground">
            Customize your digital twin's personality and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Traits */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Training Data
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload text files or voice recordings to help your twin learn your communication style.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <motion.label
                    className="glass-card p-6 rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input type="file" className="hidden" accept=".txt,.md,.doc,.docx" />
                    <FileText className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-1">Text Files</h3>
                    <p className="text-xs text-muted-foreground">
                      Upload journals, emails, or chat logs
                    </p>
                  </motion.label>

                  <motion.label
                    className="glass-card p-6 rounded-xl cursor-pointer hover:border-secondary/50 transition-all group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input type="file" className="hidden" accept="audio/*" />
                    <Mic className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-1">Voice Samples</h3>
                    <p className="text-xs text-muted-foreground">
                      Record or upload voice recordings
                    </p>
                  </motion.label>
                </div>
              </GlassCard>
            </motion.div>

            {/* Personality Traits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-secondary" />
                  Personality Traits
                </h2>

                <div className="space-y-6">
                  {traits.map((trait, index) => (
                    <div key={trait.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{trait.name}</span>
                        <span className="text-sm text-primary">{trait.value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={trait.value}
                        onChange={(e) => handleTraitChange(index, parseInt(e.target.value))}
                        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--primary)) ${trait.value}%, hsl(var(--muted)) ${trait.value}%)`
                        }}
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent" />
                  Preferences
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {prefs.map((pref, index) => (
                    <motion.button
                      key={pref.name}
                      onClick={() => handlePrefToggle(index)}
                      className={`p-4 rounded-xl border transition-all text-left ${pref.enabled
                          ? "border-primary bg-primary/10"
                          : "border-border bg-transparent hover:bg-muted/50"
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{pref.name}</span>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${pref.enabled ? "bg-primary" : "bg-muted"
                          }`}>
                          <motion.div
                            className="w-4 h-4 rounded-full bg-foreground"
                            animate={{ x: pref.enabled ? 16 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sticky top-28"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Preview
                </h2>

                {/* Avatar Preview */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      "0 0 20px hsl(var(--primary) / 0.3)",
                      "0 0 40px hsl(var(--primary) / 0.5)",
                      "0 0 20px hsl(var(--primary) / 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-12 h-12 text-primary" />
                </motion.div>

                {/* Trait Summary */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Top Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {[...traits]
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 3)
                      .map((trait) => (
                        <span
                          key={trait.name}
                          className="px-3 py-1 rounded-full text-xs bg-primary/20 text-primary"
                        >
                          {trait.name}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Preview Text */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Personality Preview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {previewText}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <AnimeButton
                    variant="neon"
                    className="w-full"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Configuration"}
                  </AnimeButton>

                  {/* Fixed Reset Button */}
                  <AnimeButton
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </AnimeButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
