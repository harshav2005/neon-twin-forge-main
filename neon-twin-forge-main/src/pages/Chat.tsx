import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Send,
  Mic,
  Search,
  Menu,
  Brain,
  Smile,
  Heart,
  Zap,
  X
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AnimeButton } from "@/components/ui/anime-button";
import { cn } from "@/lib/utils";
import twinService from "@/services/twinService";
import { toast } from "sonner";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

interface Message {
  id: number;
  text: string;
  sender: "user" | "twin";
  timestamp: Date;
  emotion?: "happy" | "thoughtful" | "excited";
}

const mockConversations = [
  { id: 1, title: "Career Decision", date: "Today", unread: 2 },
  { id: 2, title: "Weekend Plans", date: "Yesterday", unread: 0 },
  { id: 3, title: "Learning Goals", date: "2 days ago", unread: 0 },
  { id: 4, title: "Relationship Talk", date: "3 days ago", unread: 0 },
  { id: 5, title: "Health & Fitness", date: "1 week ago", unread: 0 },
];

const initialMessages: Message[] = [];

const getEmotionIcon = (emotion?: string) => {
  switch (emotion) {
    case "happy": return <Smile className="w-4 h-4" />;
    case "thoughtful": return <Brain className="w-4 h-4" />;
    case "excited": return <Zap className="w-4 h-4" />;
    default: return <Heart className="w-4 h-4" />;
  }
};

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auth Check & History Fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch History
    const fetchHistory = async () => {
      try {
        const history = await twinService.getHistory();
        if (history && history.length > 0) {
          // Map backend messages to frontend format
          const formattedMessages: Message[] = history.map((msg: any) => ({
            id: msg._id,
            text: msg.text,
            sender: msg.sender, // 'user' | 'twin' - matches interface
            timestamp: new Date(msg.timestamp),
            emotion: msg.emotion
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchHistory();
  }, [navigate]);

  const { isListening, transcript, startListening, stopListening, resetTranscript, hasRecognitionSupport } = useSpeechRecognition();

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    resetTranscript(); // Clear voice buffer
    setIsTyping(true);

    try {
      const data = await twinService.chat(userMessage.text);

      const twinMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: "twin",
        timestamp: new Date(),
        emotion: data.emotion || "thoughtful", // Use backend emotion if available
      };

      setMessages((prev) => [...prev, twinMessage]);

    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMessage = error.response?.data?.error || "Failed to reach Digital Twin. Server might be offline.";
      toast.error(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex pt-24">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className={cn(
                "w-80 border-r border-border/50 bg-card/30 backdrop-blur-xl p-4",
                "fixed lg:relative inset-y-0 left-0 z-40 pt-24 lg:pt-4",
                "hidden lg:block"
              )}
            >
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="font-display font-semibold">Conversations</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-input/50 border border-border/50 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Conversation List */}
              <div className="space-y-2">
                {mockConversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all",
                      conv.id === 1
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-muted/50"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{conv.title}</span>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{conv.date}</span>
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col max-h-[calc(100vh-6rem)]">
          {/* Chat Header */}
          <div className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 10px hsl(var(--primary) / 0.3)",
                    "0 0 20px hsl(var(--primary) / 0.5)",
                    "0 0 10px hsl(var(--primary) / 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-5 h-5 text-primary" />
              </motion.div>
              <div>
                <h2 className="font-display font-semibold">Your Digital Twin</h2>
                <p className="text-xs text-muted-foreground">
                  {isTyping ? "Thinking..." : "Online • Active Now"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-anime">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] md:max-w-[60%]",
                    message.sender === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                  )}
                >
                  <div className="chat-bubble">
                    {message.sender === "twin" && message.emotion && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        {getEmotionIcon(message.emotion)}
                        <span className="capitalize">{message.emotion}</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="chat-bubble chat-bubble-ai px-4 py-3">
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/60"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={isListening ? "Listening..." : "Type your message..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-input/50 border border-border/50 focus:outline-none focus:border-primary transition-colors",
                    isListening && "border-primary ring-2 ring-primary/20"
                  )}
                />
              </div>

              {hasRecognitionSupport && (
                <AnimeButton
                  variant={isListening ? "neon" : "ghost"}
                  size="icon"
                  className={cn("rounded-xl", isListening && "animate-pulse")}
                  onClick={toggleListening}
                  title="Voice Input"
                >
                  <Mic className={cn("w-5 h-5", isListening && "text-black")} />
                </AnimeButton>
              )}

              {!hasRecognitionSupport && (
                <AnimeButton
                  variant="ghost"
                  size="icon"
                  className="rounded-xl opacity-50 cursor-not-allowed"
                  title="Voice Input Not Supported"
                >
                  <Mic className="w-5 h-5" />
                </AnimeButton>
              )}

              <AnimeButton
                variant="neon"
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="rounded-xl"
              >
                <Send className="w-5 h-5" />
              </AnimeButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
