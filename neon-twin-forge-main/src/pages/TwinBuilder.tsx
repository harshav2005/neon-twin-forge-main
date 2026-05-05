import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sliders,
    Brain,
    Eye,
    Save,
    MessageSquare,
    Mic,
    Shield,
    Sparkles,
    Loader2,
    CheckCircle2,
    Database,
    Tag,
    AlertTriangle,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimeButton } from "@/components/ui/anime-button";
import twinService, { OnboardingAnswer, ExtractedMemory } from "@/services/twinService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { VoiceTraining } from "@/components/twin/VoiceTraining";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────

const INITIAL_TRAITS = [
    { name: "Analytical", value: 50, key: "analytical" },
    { name: "Creative", value: 50, key: "creative" },
    { name: "Empathetic", value: 50, key: "empathetic" },
    { name: "Adventurous", value: 50, key: "adventurous" },
    { name: "Organized", value: 50, key: "organized" },
];

const ONBOARDING_QUESTIONS: Array<{ question: string; placeholder: string }> = [
    {
        question: "What are your current goals?",
        placeholder: "e.g. My goal is to become a MERN developer and build AI websites."
    },
    {
        question: "What situations make you anxious or stressed?",
        placeholder: "e.g. I get nervous before viva and interviews."
    },
    {
        question: "What type of advice do you prefer?",
        placeholder: "e.g. I prefer simple, practical, step-by-step answers."
    },
    {
        question: "What motivates or inspires you?",
        placeholder: "e.g. Creative UI design, frontend development, and building 3D websites motivate me."
    },
    {
        question: "How do you usually handle stress and difficult situations?",
        placeholder: "e.g. I break problems into smaller steps and tackle them one by one."
    }
];

// Category color mappings
const CATEGORY_COLORS: Record<string, string> = {
    goal: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    emotional_pattern: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    preference: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    communication_style: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    project_context: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    personality_trait: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    life_context: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    other: "bg-muted/30 text-muted-foreground border-border/50",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TwinBuilder() {
    const navigate = useNavigate();
    const [traits, setTraits] = useState(INITIAL_TRAITS.map(t => ({ ...t })));
    const [answers, setAnswers] = useState<string[]>(new Array(ONBOARDING_QUESTIONS.length).fill(""));
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const [tonePreference, setTonePreference] = useState("supportive and balanced");
    const [communicationStyle, setCommunicationStyle] = useState("reflective");
    const [memoryEnabled, setMemoryEnabled] = useState(true);
    const [summary, setSummary] = useState("");
    const [goals, setGoals] = useState<string[]>([]);
    const [stressTriggers, setStressTriggers] = useState<string[]>([]);

    const [extractedMemories, setExtractedMemories] = useState<ExtractedMemory[]>([]);
    const [showMemoryPreview, setShowMemoryPreview] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);

    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<"questions" | "voice" | "traits">("questions");

    // Load existing profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await twinService.getProfile();
                if (profile) {
                    if (profile.personality) {
                        setTraits(prev => prev.map(t => ({
                            ...t,
                            value: profile.personality[t.key] ?? t.value
                        })));
                    }
                    setTonePreference(profile.tonePreference || "supportive and balanced");
                    setCommunicationStyle(profile.communicationStyle || "reflective");
                    setMemoryEnabled(profile.memoryEnabled !== false);
                    setSummary(profile.summary || "");
                    setGoals(profile.goals || []);
                    setStressTriggers(profile.stressTriggers || []);
                }
            } catch {
                console.log("No existing profile.");
            }
        };
        loadProfile();
    }, []);

    const handleTraitChange = (index: number, newValue: number) => {
        setTraits(prev => prev.map((t, i) => i === index ? { ...t, value: newValue } : t));
    };

    const handleUpdateAnswer = (index: number, value: string) => {
        setAnswers(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    /**
     * Analyze: sends answers to backend → gets profile calibration + memory preview.
     * Does NOT save to DB — only previews what will be saved.
     */
    const handleAnalyze = async (transcript?: string) => {
        const structuredAnswers: OnboardingAnswer[] = ONBOARDING_QUESTIONS.map((q, i) => ({
            question: q.question,
            answer: answers[i] || ""
        })).filter(a => a.answer.trim().length > 0);

        const hasContent = structuredAnswers.length > 0 || (transcript && transcript.trim());
        if (!hasContent) {
            toast.error("Please answer at least one question before analyzing.");
            return;
        }

        setAnalyzing(true);
        try {
            const result = await twinService.analyze(structuredAnswers, transcript || voiceTranscript);

            // Handle both new structured response and legacy flat response
            const profile = result.profile || result;
            const memories: ExtractedMemory[] = result.extractedMemories || [];

            // Update traits from returned profile
            setTraits(prev => prev.map(t => ({
                ...t,
                value: profile[t.key] ?? profile.personality?.[t.key] ?? t.value
            })));

            setTonePreference(profile.tonePreference || tonePreference);
            setCommunicationStyle(profile.communicationStyle || communicationStyle);
            setSummary(profile.summary || "");
            setGoals(Array.isArray(profile.goals) ? profile.goals : []);
            setStressTriggers(Array.isArray(profile.stressTriggers) ? profile.stressTriggers : []);

            // Show memory preview
            setExtractedMemories(memories);
            setShowMemoryPreview(memories.length > 0);
            setAnalyzed(true);

            if (transcript) setVoiceTranscript(transcript);

            toast.success(`Profile calibrated! ${memories.length} memories ready to save.`);
            setActiveTab("traits");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Profile calibration failed. Try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    /**
     * Save: initializes digital twin and saves memories using the new endpoint.
     */
    const handleSave = async () => {
        setLoading(true);
        try {
            const structuredAnswers: OnboardingAnswer[] = ONBOARDING_QUESTIONS.map((q, i) => ({
                question: q.question,
                answer: answers[i] || ""
            }));

            const payload = {
                answers: structuredAnswers,
                transcript: voiceTranscript || "",
                longTermMemory: memoryEnabled
            };

            console.log("Submitting twin answers:", structuredAnswers);
            console.log("Long term memory enabled:", memoryEnabled);

            const result = await twinService.initialize(payload);
            console.log("Twin initialize response:", result);
            
            const memorySummary = result.memorySummary || { saved: 0, updated: 0 };

            if (memoryEnabled) {
                toast.success(
                    `Twin initialized and long-term memories saved! ` +
                    `(${memorySummary.saved} new, ${memorySummary.updated} updated)`
                );
            } else {
                toast.success("Twin initialized for this session. Memory is disabled.");
            }

            setTimeout(() => navigate(memoryEnabled ? "/memory" : "/dashboard"), 1800);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to initialize digital twin.");
        } finally {
            setLoading(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 pt-28 pb-12 overflow-hidden">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        <span className="neon-text">Digital Twin Architect</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Answer the questions below to calibrate your twin's personality and build its long-term context memory.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ── Left & Middle — Interactive Setup ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tab Switcher */}
                        <div className="flex bg-card/30 p-1 rounded-2xl border border-border/50 backdrop-blur-md">
                            {(['questions', 'voice', 'traits'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                                        activeTab === tab
                                            ? "bg-primary text-black shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">

                            {/* ── Questions Tab ── */}
                            {activeTab === "questions" && (
                                <motion.div key="q" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <GlassCard className="p-6">
                                        <h2 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-primary" />
                                            Profile Calibration Questions
                                        </h2>
                                        <p className="text-xs text-muted-foreground mb-6">
                                            Your answers will personalize your twin's behavior and be saved as long-term RAG memories used during chat.
                                        </p>
                                        <div className="space-y-6">
                                            {ONBOARDING_QUESTIONS.map((q, i) => (
                                                <div key={i}>
                                                    <label className="block text-sm font-semibold mb-1 text-foreground/90">
                                                        {i + 1}. {q.question}
                                                    </label>
                                                    <textarea
                                                        className="w-full bg-input/40 border border-border/50 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all resize-none h-[72px] placeholder:text-muted-foreground/50"
                                                        value={answers[i]}
                                                        onChange={(e) => handleUpdateAnswer(i, e.target.value)}
                                                        placeholder={q.placeholder}
                                                    />
                                                </div>
                                            ))}

                                            <AnimeButton
                                                variant="neon"
                                                className="w-full"
                                                onClick={() => handleAnalyze()}
                                                disabled={analyzing}
                                            >
                                                {analyzing
                                                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Personalizing your twin...</>
                                                    : <><Sparkles className="w-4 h-4 mr-2" /> Analyze Responses</>
                                                }
                                            </AnimeButton>
                                        </div>
                                    </GlassCard>

                                    {/* ── Memory Preview ── */}
                                    <AnimatePresence>
                                        {analyzed && extractedMemories.length > 0 && (
                                            <motion.div
                                                key="memory-preview"
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                className="mt-4"
                                            >
                                                <GlassCard className="p-5 border border-primary/20 bg-primary/5">
                                                    <button
                                                        onClick={() => setShowMemoryPreview(p => !p)}
                                                        className="w-full flex items-center justify-between mb-3"
                                                    >
                                                        <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
                                                            <Database className="w-4 h-4" />
                                                            Memories That Will Be Saved
                                                            <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-bold">
                                                                {extractedMemories.length}
                                                            </span>
                                                        </h3>
                                                        {showMemoryPreview
                                                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        }
                                                    </button>

                                                    <AnimatePresence>
                                                        {showMemoryPreview && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <p className="text-[11px] text-muted-foreground mb-3">
                                                                    {memoryEnabled
                                                                        ? "These will be stored as long-term context memories and used by the chatbot via RAG."
                                                                        : "Memory is currently disabled. Enable it to persist these as long-term memories."
                                                                    }
                                                                </p>
                                                                <div className="space-y-2">
                                                                    {extractedMemories.map((m, idx) => (
                                                                        <motion.div
                                                                            key={idx}
                                                                            initial={{ opacity: 0, x: -10 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: idx * 0.05 }}
                                                                            className="flex items-start gap-3 p-3 bg-card/60 rounded-xl border border-border/40"
                                                                        >
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs text-foreground/90 leading-relaxed mb-2">
                                                                                    "{m.analyzedSummary || m.originalText}"
                                                                                </p>
                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                    <span className={cn(
                                                                                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                                                                        CATEGORY_COLORS[m.category] || CATEGORY_COLORS.other
                                                                                    )}>
                                                                                        {m.category.replace(/_/g, " ")}
                                                                                    </span>
                                                                                    <span className="text-[10px] text-muted-foreground">
                                                                                        Importance: {m.importance}/10
                                                                                    </span>
                                                                                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                                                                        <Tag className="w-2.5 h-2.5" />
                                                                                        onboarding_form
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </GlassCard>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {/* ── Voice Tab ── */}
                            {activeTab === "voice" && (
                                <motion.div key="v" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <VoiceTraining />
                                </motion.div>
                            )}

                            {/* ── Traits Tab ── */}
                            {activeTab === "traits" && (
                                <motion.div key="t" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <GlassCard className="p-6">
                                        <h2 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
                                            <Sliders className="w-5 h-5 text-secondary" />
                                            Persona Calibration
                                        </h2>
                                        <div className="space-y-8">
                                            {traits.map((trait, index) => (
                                                <div key={trait.name}>
                                                    <div className="flex justify-between mb-3 text-sm">
                                                        <span className="font-semibold text-foreground/80">{trait.name}</span>
                                                        <span className="text-secondary font-display font-bold">{trait.value}%</span>
                                                    </div>
                                                    <input
                                                        type="range" min="0" max="100" value={trait.value}
                                                        onChange={(e) => handleTraitChange(index, parseInt(e.target.value))}
                                                        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-secondary"
                                                        style={{ background: `linear-gradient(to right, hsl(var(--secondary)) ${trait.value}%, hsl(var(--muted)) ${trait.value}%)` }}
                                                    />
                                                </div>
                                            ))}

                                            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/30">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Tone Preference</label>
                                                    <input
                                                        className="w-full bg-input/40 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                                        value={tonePreference}
                                                        onChange={(e) => setTonePreference(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Communication Style</label>
                                                    <input
                                                        className="w-full bg-input/40 border border-border/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                                        value={communicationStyle}
                                                        onChange={(e) => setCommunicationStyle(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Goals & Stress Triggers preview */}
                                            {(goals.length > 0 || stressTriggers.length > 0) && (
                                                <div className="pt-4 border-t border-border/30 grid sm:grid-cols-2 gap-4">
                                                    {goals.length > 0 && (
                                                        <div>
                                                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Detected Goals</label>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {goals.map((g, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-medium">{g}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {stressTriggers.length > 0 && (
                                                        <div>
                                                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Stress Triggers</label>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {stressTriggers.map((s, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-medium">{s}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Right Column — Preview & Actions ── */}
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28">
                            <GlassCard className="p-6">
                                <h2 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-primary" />
                                    Twin Identity
                                </h2>

                                {/* Summary */}
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mb-4">
                                    <h3 className="text-xs font-bold text-primary uppercase mb-2">Personality Summary</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        {summary || "Awaiting profile calibration to generate your twin's identity summary..."}
                                    </p>
                                </div>

                                {/* Memory Preview Count */}
                                {analyzed && (
                                    <div className={cn(
                                        "p-3 rounded-xl border mb-4 flex items-start gap-2",
                                        memoryEnabled
                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                            : "bg-amber-500/5 border-amber-500/20"
                                    )}>
                                        {memoryEnabled
                                            ? <Database className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                            : <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                        }
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {memoryEnabled
                                                ? `${extractedMemories.length} memories ready to be embedded and stored for RAG-based chat.`
                                                : "Memory is disabled. Your answers personalized the current twin profile but were not saved as long-term memories."
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* Memory Toggle */}
                                <div className="mb-6 p-4 bg-muted/20 rounded-2xl border border-border/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-accent" />
                                            <span className="text-sm font-semibold">Enable Long-Term Memory</span>
                                        </div>
                                        <div
                                            onClick={() => setMemoryEnabled(!memoryEnabled)}
                                            className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${memoryEnabled ? "bg-accent" : "bg-muted"}`}
                                        >
                                            <motion.div
                                                className="w-4 h-4 rounded-full bg-white shadow"
                                                animate={{ x: memoryEnabled ? 16 : 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-snug">
                                        {memoryEnabled
                                            ? "Your important answers will be saved as long-term context memories and used by the chatbot."
                                            : "Off — profile will be calibrated but answers won't be stored as memories."
                                        }
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <AnimeButton
                                        variant="neon"
                                        className="w-full"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Personalizing your twin...</>
                                            : <><Save className="w-4 h-4 mr-2" /> Initialize Digital Twin</>
                                        }
                                    </AnimeButton>
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel Architect Mode
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
