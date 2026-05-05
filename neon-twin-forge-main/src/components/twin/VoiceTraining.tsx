import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Mic, 
    Square, 
    Save, 
    RefreshCw, 
    Trash2,
    ChevronDown,
    ChevronUp,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { AnimeButton } from "@/components/ui/anime-button";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import twinService from "@/services/twinService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoiceMemory {
    _id: string;
    originalText: string;
    analyzedSummary: string;
    category: string;
    source: string;
    createdAt: string;
    title?: string;
    possibleIntent?: string;
}

export function VoiceTraining() {
    const [history, setHistory] = useState<VoiceMemory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState<"idle" | "listening" | "processing" | "saved">("idle");
    const [manualText, setManualText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [timer, setTimer] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { 
        isListening, 
        transcript, 
        startListening, 
        stopListening, 
        resetTranscript,
        hasRecognitionSupport 
    } = useSpeechRecognition({ continuous: true });

    // Fetch history on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const data = await twinService.getVoiceMemories();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch voice history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Timer logic — tied to our own isRecording state, not the engine's isListening
    useEffect(() => {
        if (isRecording) {
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    setTimer(prev => prev + 1);
                }, 1000);
            }
            setStatus("listening");
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (status === "listening") setStatus("idle");
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const handleStartRecording = () => {
        resetTranscript();
        setManualText("");
        setTimer(0);
        setIsRecording(true);
        startListening();
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        stopListening();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTextToSave = () => {
        return hasRecognitionSupport ? transcript.trim() : manualText.trim();
    };

    const handleSave = async () => {
        const textToSave = getTextToSave();
        if (!textToSave) {
            toast.error("Nothing to save. Please record or type something first.");
            return;
        }

        setIsSaving(true);
        setStatus("processing");
        try {
            await twinService.saveVoiceMemory(textToSave);
            toast.success("Voice memory saved and analyzed!");
            setStatus("saved");
            resetTranscript();
            setManualText("");
            setTimer(0);
            fetchHistory();
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error: any) {
            console.error("Save failed:", error);
            const msg = error?.response?.data?.error || "Failed to save voice memory.";
            toast.error(msg);
            setStatus("idle");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this voice memory?")) return;
        try {
            await twinService.deleteVoiceMemory(id);
            setHistory(prev => prev.filter(item => item._id !== id));
            toast.success("Deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete.");
        }
    };

    const filteredHistory = history.filter(item => 
        item.originalText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.analyzedSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-display font-bold text-primary">Voice Memory</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Record your thoughts, goals, or preferences. Your twin will listen and remember.
                </p>
            </div>

            {/* Recording Card */}
            <div className="glass-card p-6 md:p-8 border-primary/20 bg-card/30 backdrop-blur-xl rounded-3xl relative overflow-hidden">
                {/* Top: Status + Timer */}
                <div className="flex items-center gap-5 mb-6">
                    <motion.div 
                        animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0",
                            isRecording ? "bg-primary shadow-[0_0_25px_rgba(0,255,242,0.4)]" : "bg-primary/10"
                        )}
                    >
                        <Mic className={cn("w-8 h-8", isRecording ? "text-black" : "text-primary")} />
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="font-display font-bold text-xl">
                                {isRecording ? "Listening..." : "Voice Recorder"}
                            </span>
                            {status === "processing" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                            {status === "saved" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-2xl font-mono text-foreground/80 tabular-nums">{formatTime(timer)}</span>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                                status === "listening" ? "bg-primary/20 text-primary border-primary/30" :
                                status === "processing" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                                status === "saved" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                                "bg-muted/20 text-muted-foreground border-border/50"
                            )}>
                                {status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Transcript Preview */}
                {hasRecognitionSupport ? (
                    <div className="mb-6">
                        <div className={cn(
                            "min-h-[100px] p-4 rounded-2xl border text-sm leading-relaxed transition-colors",
                            isRecording 
                                ? "bg-black/50 border-primary/30 text-foreground/90" 
                                : "bg-black/30 border-border/40 text-foreground/70"
                        )}>
                            {transcript ? (
                                <>
                                    {transcript}
                                    {isRecording && isListening && (
                                        <motion.span 
                                            animate={{ opacity: [0, 1, 0] }} 
                                            transition={{ repeat: Infinity, duration: 1 }} 
                                            className="inline-block w-0.5 h-4 ml-0.5 bg-primary align-middle" 
                                        />
                                    )}
                                </>
                            ) : (
                                <span className="text-muted-foreground/50 italic">
                                    {isRecording 
                                        ? "Start speaking — your words will appear here in real time..." 
                                        : "Click \"Start Recording\" and speak your thoughts. The transcript will appear here."}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-400">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Voice recognition is not available in this browser. You can type or paste your thoughts below instead.</span>
                        </div>
                        <textarea
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            placeholder="Type or paste your thoughts, goals, or preferences here..."
                            className="w-full min-h-[100px] p-4 bg-black/30 rounded-2xl border border-border/40 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        />
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap gap-3">
                    {hasRecognitionSupport && (
                        <>
                            {!isRecording ? (
                                <AnimeButton 
                                    variant="neon" 
                                    onClick={handleStartRecording}
                                    className="flex-1 min-w-[140px]"
                                >
                                    <Mic className="w-4 h-4 mr-2" />
                                    Start Recording
                                </AnimeButton>
                            ) : (
                                <AnimeButton 
                                    variant="outline" 
                                    onClick={handleStopRecording}
                                    className="flex-1 min-w-[140px] border-red-500/50 text-red-400 hover:bg-red-500/10"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop Recording
                                </AnimeButton>
                            )}
                        </>
                    )}

                    <button 
                        onClick={() => { resetTranscript(); setManualText(""); setTimer(0); setStatus("idle"); setIsRecording(false); stopListening(); }}
                        disabled={!transcript && !manualText}
                        className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/50 text-muted-foreground disabled:opacity-30 transition-all"
                        title="Clear"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    
                    <AnimeButton 
                        variant="neon" 
                        onClick={handleSave}
                        disabled={isRecording || isSaving || !getTextToSave()}
                        className="flex-1 min-w-[140px]"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Memory
                    </AnimeButton>
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-xl font-display font-semibold">Recording History</h3>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search voice memories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-input/50 border border-border/50 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-sm">Loading memories...</p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="glass-card p-12 text-center border-dashed border-border/50">
                        <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground italic">
                            {searchQuery ? "No matching voice memories found." : "No voice memories yet. Record your first voice note."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredHistory.map((item) => (
                            <motion.div 
                                key={item._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card border-border/50 hover:border-primary/30 transition-colors overflow-hidden"
                            >
                                <div className="p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 text-primary/70" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-foreground/90 truncate pr-4">
                                                {item.title || "Untitled Recording"}
                                            </h4>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button 
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Delete Memory"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                                                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    {expandedId === item._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/70 mb-2">{item.analyzedSummary}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                            <span>{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {item.possibleIntent && (
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                    {item.possibleIntent}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <AnimatePresence>
                                    {expandedId === item._id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-border/30 bg-black/20"
                                        >
                                            <div className="p-4">
                                                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Original Transcript</h5>
                                                <p className="text-xs leading-relaxed text-muted-foreground/80 italic">
                                                    "{item.originalText}"
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
