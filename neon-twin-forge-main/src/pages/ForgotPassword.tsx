import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { AnimeButton } from "@/components/ui/anime-button";
import { AnimeInput } from "@/components/ui/anime-input";
import { GlassCard } from "@/components/ui/glass-card";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 anime-gradient-bg relative overflow-hidden">
      <motion.div
        className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4"
                    animate={{ boxShadow: ["0 0 20px hsl(var(--accent) / 0.3)", "0 0 40px hsl(var(--accent) / 0.5)", "0 0 20px hsl(var(--accent) / 0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mail className="w-8 h-8 text-accent" />
                  </motion.div>
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Forgot Password?
                  </h1>
                  <p className="text-muted-foreground">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimeInput
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5" />}
                    required
                  />

                  <AnimeButton
                    type="submit"
                    variant="neon"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      "Send Reset Link"
                    )}
                  </AnimeButton>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <CheckCircle className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="text-xl font-display font-bold mb-2">
                  Check Your Email
                </h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to{" "}
                  <span className="text-primary">{email}</span>
                </p>
                <Link to="/login">
                  <AnimeButton variant="outline">
                    Back to Login
                  </AnimeButton>
                </Link>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
