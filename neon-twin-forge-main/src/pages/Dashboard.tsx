import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Brain,
  MessageCircle,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Camera
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimeButton } from "@/components/ui/anime-button";
import { cn, getAvatarUrl } from "@/lib/utils";
import metricsService from "@/services/metricsService";
import twinService from "@/services/twinService";
import api from "@/services/api";

const BACKEND_DEFAULT_AVATAR = "/default-avatar.png";

// --- Utility Functions ---
const getMoodIcon = (mood: string) => {
  switch (mood) {
    case "happy": return <Smile className="w-4 h-4 text-primary" />;
    case "neutral": return <Meh className="w-4 h-4 text-yellow-500" />;
    case "sad": return <Frown className="w-4 h-4 text-secondary" />;
    default: return <Meh className="w-4 h-4" />;
  }
};

const getUserData = () => {
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
  } catch (e) { }
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(getUserData());
  const [isSurveyComplete, setIsSurveyComplete] = useState<boolean | null>(null);

  // New States for Real Data
  const [metrics, setMetrics] = useState<any>(null);
  const [twinProfile, setTwinProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userName = userData ? userData.name.split(' ')[0] : "User";
  const avatarUrl = userData ? userData.avatarUrl : BACKEND_DEFAULT_AVATAR;

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Check Survey Status
        const surveyRes = await api.get("/survey/status");
        if (surveyRes.status === 200) {
          const data = surveyRes.data;
          setIsSurveyComplete(data.isComplete);
          if (!data.isComplete) {
            navigate("/survey");
            return;
          }
        }

        // Fetch Real Data in Parallel
        const [metricsData, twinData] = await Promise.all([
          metricsService.getLatest().catch(() => null),
          twinService.getProfile().catch(() => null)
        ]);

        setMetrics(metricsData);
        setTwinProfile(twinData);

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        // If checking status failed with 401, api interceptor might handle it or we catch here
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Use correct endpoint and Content-Type
        const res = await api.post("/upload/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        if (res.status === 200) {
          // Backend returns { message, url } but not the full user object
          // We need to update the local user state manually
          const newAvatarUrl = res.data.url;
          const updatedUser = { ...userData, avatarUrl: newAvatarUrl };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUserData(updatedUser);

          // Force a reload to update Navbar or dispatch an event
          window.location.reload();
        }
      } catch (error) {
        console.error("Avatar upload failed:", error);
      }
    }
  };

  if (isSurveyComplete === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Calculate top traits for display
  const topTraits = twinProfile?.personality
    ? Object.entries(twinProfile.personality)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
    : ["Analytical", "Creative", "Empathetic"];

  const moodData = metrics?.moodHistory || [
    { day: "Mon", mood: "neutral", value: 50 },
    { day: "Tue", mood: "happy", value: 70 },
    { day: "Wed", mood: "happy", value: 80 },
  ];



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
            Welcome back, <span className="neon-text">{userName}</span>
          </h1>
          <p className="text-muted-foreground">
            Your digital twin is online and learning.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column (Twin Info & Mood) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Twin Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center"
                      animate={{ boxShadow: ["0 0 20px hsl(var(--primary) / 0.3)", "0 0 40px hsl(var(--primary) / 0.5)", "0 0 20px hsl(var(--primary) / 0.3)"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Brain className="w-8 h-8 text-primary" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-display font-semibold">Digital Twin</h2>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider">
                        {twinProfile?.status || "Active"} • v2.4
                      </p>
                    </div>
                  </div>
                  <Link to="/twin-builder">
                    <AnimeButton variant="outline" size="sm">
                      Customize
                    </AnimeButton>
                  </Link>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: "Stress Level", value: metrics?.stressLevel ? `${metrics.stressLevel}/10` : "Low", color: "text-primary" },
                    { label: "Energy", value: metrics?.energyLevel ? `${metrics.energyLevel}/10` : "High", color: "text-secondary" },
                    { label: "Interactions", value: twinProfile?.interactionCount || "12", color: "text-accent" },
                  ].map((stat) => (
                    <div key={stat.label} className="glass-card p-4 rounded-xl text-center">
                      <div className={`text-2xl font-display font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Dominant Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {topTraits.map((trait) => (
                      <span
                        key={trait}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Mood Timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-display font-semibold">Mood Timeline</h2>
                  {/* Placeholder link */}
                  <span className="text-sm text-muted-foreground">Last 7 Days</span>
                </div>

                <div className="flex items-end justify-between gap-2 h-32">
                  {moodData.map((item: any, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        className="w-full bg-primary/20 rounded-t-lg"
                        style={{ height: `${item.value}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${item.value}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <div
                          className="w-full h-full rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.6))`
                          }}
                        />
                      </motion.div>
                      <div className="flex flex-col items-center">
                        {getMoodIcon(item.mood)}
                        <span className="text-xs text-muted-foreground mt-1">{item.day}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Column (User Profile & Quick Actions) */}
          <div className="space-y-6">

            {/* User Profile Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img
                      src={getAvatarUrl(avatarUrl)}
                      alt="User Profile"
                      className="w-12 h-12 rounded-xl object-cover bg-secondary/20"
                    />
                    <label
                      className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
                      title="Upload New Profile Image"
                    >
                      <Camera className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <h3 className="font-semibold">{userName}</h3>
                    <p className="text-sm text-muted-foreground">Digital Pioneer</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </span>
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/chat">
                    <AnimeButton variant="glass" className="w-full justify-start">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      New Conversation
                    </AnimeButton>
                  </Link>
                  <Link to="/simulation">
                    <AnimeButton variant="glass" className="w-full justify-start">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run Simulation
                    </AnimeButton>
                  </Link>
                  <Link to="/analytics">
                    <AnimeButton variant="glass" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </AnimeButton>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}