// src/components/landing/HeroSection.tsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Brain } from "lucide-react";
import { AnimeButton } from "@/components/ui/anime-button";
import { AvatarAnimation } from "./AvatarAnimation";
import { useState, useEffect } from "react";
import { isUserLoggedIn } from "@/lib/auth-check"; // <-- NEW IMPORT
import api from "@/services/api";

interface GlobalStats {
    activeUsers: string;
    twinsCreated: string;
    conversations: string;
}

const initialStats: GlobalStats = {
    activeUsers: "0K+",
    twinsCreated: "0K+",
    conversations: "0M+",
};

export function HeroSection() {
    const [stats, setStats] = useState<GlobalStats>(initialStats);

    // Determine the navigation target based on login status
    const startBuildingPath = isUserLoggedIn() ? "/twin-builder" : "/signup"; // <-- CORE LOGIC

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch data from the new backend endpoint
                const response = await api.get("/stats/global");
                setStats(response.data);
            } catch (error) {
                console.error("Network error fetching stats:", error);
            }
        };

        fetchStats();
    }, []);


    // Define the stats array using the state variables
    const statsData = [
        { label: "Active Users", value: stats.activeUsers },
        { label: "Twins Created", value: stats.twinsCreated },
        { label: "Conversations", value: stats.conversations },
    ];


    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12">
            {/* Animated Background */}
            <div className="absolute inset-0 anime-gradient-bg" />

            {/* Floating Orbs ... */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                        scale: [1, 0.9, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 right-1/3 w-48 h-48 bg-accent/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
                    backgroundSize: "50px 50px",
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">AI-Powered Digital Twin</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6"
                        >
                            Create Your{" "}
                            <span className="neon-text">Digital</span>
                            <br />
                            <span className="neon-text">Human Twin</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
                        >
                            An intelligent AI companion that learns your personality, understands your preferences,
                            and helps you make better decisions. Your digital self, always evolving.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            {/* DYNAMIC LINK HERE */}
                            <Link to={startBuildingPath}>
                                <AnimeButton variant="neon" size="lg" className="group">
                                    Start Building
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </AnimeButton>
                            </Link>
                            <Link to="/dashboard">
                                <AnimeButton variant="outline" size="lg">
                                    View Demo
                                </AnimeButton>
                            </Link>
                        </motion.div>

                        {/* Stats - NOW DYNAMIC */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50"
                        >
                            {statsData.map((stat) => (
                                <div key={stat.label} className="text-center lg:text-left">
                                    <div className="text-2xl md:text-3xl font-display font-bold text-primary">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Avatar Animation */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <AvatarAnimation />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}