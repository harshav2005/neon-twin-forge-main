import { motion } from "framer-motion";
import { Trash2, Calendar, Tag, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemoryCardProps {
    memory: {
        _id: string;
        originalText?: string;
        analyzedSummary?: string;
        category: string;
        importance: number;
        source?: string;
        createdAt: string;
    };
    onDelete: (id: string) => void;
}

// Category color palette
const CATEGORY_COLORS: Record<string, string> = {
    goals: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    stress_triggers: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    motivation: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    advice_style: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    coping_style: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    raw_profile_answer: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    traits: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    personality_summary: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    communication_style: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    voice_memory: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    other: "bg-muted/30 text-muted-foreground border-border/50",
};

// Source badge styles and labels
const SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
    twin_builder: { label: "Twin Builder", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    chat: { label: "Chat", className: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    voice_recording: { label: "Voice", className: "text-primary bg-primary/10 border-primary/30" }
};

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
    const sourceKey = memory.source || "chat";
    const sourceConfig = SOURCE_CONFIG[sourceKey] || { label: sourceKey, className: "text-muted-foreground bg-muted/10 border-border/30" };
    const categoryColor = CATEGORY_COLORS[memory.category] || CATEGORY_COLORS.other;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative glass-card p-5 border border-border/50 hover:border-primary/40 transition-all duration-300"
        >
            {/* Top row: category + importance + delete */}
            <div className="flex justify-between items-start mb-3">
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    categoryColor
                )}>
                    {memory.category.replace(/_/g, " ")}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {memory.importance}/10
                    </span>
                    <button
                        onClick={() => onDelete(memory._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Memory text */}
            <p className="text-sm leading-relaxed mb-4 text-foreground/90">
                "{memory.analyzedSummary || memory.originalText}"
            </p>

            {/* Bottom row: date + source */}
            <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(memory.createdAt).toLocaleDateString()}
                </div>
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1",
                    sourceConfig.className
                )}>
                    <Tag className="w-2.5 h-2.5" />
                    {sourceConfig.label}
                </span>
            </div>
        </motion.div>
    );
}
