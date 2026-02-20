// src/components/landing/CTASection.tsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { AnimeButton } from "@/components/ui/anime-button";
import { isUserLoggedIn } from "@/lib/auth-check"; // <-- REQUIRED UTILITY

export function CTASection() {
    // Determine the navigation target based on login status
    const createTwinPath = isUserLoggedIn() ? "/twin-builder" : "/signup"; // <-- CORE LOGIC

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
                <motion.div
                    className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="glass-card p-8 md:p-12 lg:p-16 rounded-3xl text-center max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Start Your Journey Today</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4"
                    >
                        Ready to Meet Your{" "}
                        <span className="neon-text">Digital Self?</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto"
                    >
                        Join thousands of users who have already created their AI twin. 
                        Start with a free account and experience the future of personal AI.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {/* DYNAMIC LINK: Navigates to /twin-builder if logged in, /signup otherwise */}
                        <Link to={createTwinPath}> 
                            <AnimeButton variant="neon" size="xl" className="group">
                                Create Your Twin
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </AnimeButton>
                        </Link>
                        
                        <Link to="/login">
                            <AnimeButton variant="outline" size="xl">
                                Sign In
                            </AnimeButton>
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="text-sm text-muted-foreground mt-6"
                    >
                        No credit card required • Free tier available • Setup in 5 minutes
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}