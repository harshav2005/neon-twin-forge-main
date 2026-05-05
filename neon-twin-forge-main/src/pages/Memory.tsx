import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Search,
    Trash2,
    ShieldCheck,
    Info,
    Loader2,
    Filter
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AnimeButton } from "@/components/ui/anime-button";
import { MemoryCard } from "@/components/memory/MemoryCard";
import twinService from "@/services/twinService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type SourceFilter = "all" | "twin_builder" | "chat" | "voice_recording";

const SOURCE_TABS: Array<{ key: SourceFilter; label: string }> = [
    { key: "all", label: "All" },
    { key: "twin_builder", label: "Twin Builder" },
    { key: "chat", label: "Chat" },
    { key: "voice_recording", label: "Voice" },
];

export default function Memory() {
    const navigate = useNavigate();
    const [memories, setMemories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSource, setActiveSource] = useState<SourceFilter>("all");

    const fetchMemories = async () => {
        try {
            setLoading(true);
            const data = await twinService.getMemories();
            setMemories(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to load long-term memories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this memory?")) return;
        try {
            await twinService.deleteMemory(id);
            setMemories(prev => prev.filter(m => m._id !== id));
            toast.success("Memory removed.");
        } catch {
            toast.error("Failed to delete memory.");
        }
    };

    const handleClearAll = async () => {
        if (!confirm("CRITICAL: This will erase ALL your digital twin's learned memories. Proceed?")) return;
        try {
            await twinService.clearAllMemories();
            setMemories([]);
            toast.success("Memory database reset.");
        } catch {
            toast.error("Failed to clear memories.");
        }
    };

    // Apply source filter then search filter
    const sourceFiltered = activeSource === "all"
        ? memories
        : memories.filter(m => (m.source || "chat") === activeSource);

    const filteredMemories = searchQuery.trim()
        ? sourceFiltered.filter(m =>
            (m.analyzedSummary || m.originalText || "")?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : sourceFiltered;

    const onboardingCount = memories.filter(m => m.source === "twin_builder").length;
    const chatCount = memories.filter(m => !m.source || m.source === "chat").length;
    const voiceCount = memories.filter(m => m.source === "voice_recording").length;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Brain className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-display font-bold">Long-Term Memory</h1>
                        </div>
                        <p className="text-muted-foreground max-w-lg text-sm">
                            Your important answers were saved as long-term context memories. The chatbot retrieves these via RAG to personalize responses.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <AnimeButton
                            variant="outline"
                            size="sm"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={handleClearAll}
                            disabled={memories.length === 0}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </AnimeButton>
                    </motion.div>
                </div>

                {/* Privacy Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 border-l-4 border-primary bg-primary/5 flex gap-4 items-start mb-8"
                >
                    <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold mb-1">Privacy & Consent</h4>
                        <p className="text-xs text-muted-foreground">
                            Your important answers were saved as long-term memories and are used only to personalize your digital twin's responses. You can edit or delete any memory at any time.
                        </p>
                    </div>
                </motion.div>

                {/* Search + Stats row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search your memories..."
                            className="w-full bg-input/40 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="glass-card px-4 py-2.5 flex items-center gap-3 border border-border/50 shrink-0">
                        <Info className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                            {memories.length} total
                            {onboardingCount > 0 && <span className="text-emerald-400 ml-2">· {onboardingCount} onboarding</span>}
                            {chatCount > 0 && <span className="text-blue-400 ml-2">· {chatCount} chat</span>}
                            {voiceCount > 0 && <span className="text-primary ml-2">· {voiceCount} voice</span>}
                        </span>
                    </div>
                </div>

                {/* Source Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    <Filter className="w-4 h-4 text-muted-foreground self-center" />
                    {SOURCE_TABS.map(tab => {
                        const count = tab.key === "all"
                            ? memories.length
                            : memories.filter(m => (m.source || "chat") === tab.key).length;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveSource(tab.key)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                                    activeSource === tab.key
                                        ? "bg-primary text-black border-primary shadow-lg shadow-primary/20"
                                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                                )}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={cn(
                                        "ml-1.5 px-1.5 py-0.5 rounded-full text-[9px]",
                                        activeSource === tab.key ? "bg-black/20" : "bg-muted/50"
                                    )}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Memory Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading your digital mind...</p>
                    </div>
                ) : filteredMemories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence mode="popLayout">
                            {filteredMemories.map((memory) => (
                                <MemoryCard
                                    key={memory._id}
                                    memory={memory}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-24 glass-card border-dashed border-2 border-border/50 rounded-3xl">
                        <Brain className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {activeSource === "all" ? "No Memories Yet" : `No ${activeSource.replace(/_/g, " ")} memories`}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                            {activeSource === "all"
                                ? "Go to Twin Builder, fill in your answers, and click 'Initialize Digital Twin' to seed your memory."
                                : `No memories from ${activeSource.replace(/_/g, " ")} source yet.`
                            }
                        </p>
                        {activeSource === "all" && (
                            <AnimeButton variant="neon" size="sm" onClick={() => navigate("/twin-builder")}>
                                <Brain className="w-4 h-4 mr-2" />
                                Open Twin Builder
                            </AnimeButton>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
