import { motion } from "framer-motion";
import { Brain, Heart, Zap, MessageCircle, Target, Sparkles } from "lucide-react";

export function AvatarAnimation() {
  const orbitingIcons = [
    { Icon: Brain, color: "text-primary", delay: 0 },
    { Icon: Heart, color: "text-secondary", delay: 0.5 },
    { Icon: Zap, color: "text-accent", delay: 1 },
    { Icon: MessageCircle, color: "text-primary", delay: 1.5 },
    { Icon: Target, color: "text-secondary", delay: 2 },
    { Icon: Sparkles, color: "text-accent", delay: 2.5 },
  ];

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Middle Ring */}
      <motion.div
        className="absolute inset-8 rounded-full border border-secondary/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner Ring */}
      <motion.div
        className="absolute inset-16 rounded-full border border-accent/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Orbiting Icons */}
      {orbitingIcons.map(({ Icon, color, delay }, index) => (
        <motion.div
          key={index}
          className="absolute top-1/2 left-1/2 w-full h-full"
          style={{ transform: "translate(-50%, -50%)" }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: delay,
          }}
        >
          <motion.div
            className={`absolute glass-card p-3 rounded-xl ${color}`}
            style={{
              top: "5%",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              delay: delay,
            }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        </motion.div>
      ))}

      {/* Central Avatar */}
      <motion.div
        className="absolute inset-24 glass-card rounded-full flex items-center justify-center overflow-hidden"
        animate={{
          boxShadow: [
            "0 0 30px hsl(var(--primary) / 0.3)",
            "0 0 60px hsl(var(--primary) / 0.5)",
            "0 0 30px hsl(var(--primary) / 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Avatar Face */}
        <div className="relative">
          {/* Head */}
          <motion.div
            className="w-24 h-28 bg-gradient-to-b from-primary/30 to-secondary/30 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Eyes */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-6">
              <motion.div
                className="w-3 h-4 bg-primary rounded-full"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
              />
              <motion.div
                className="w-3 h-4 bg-primary rounded-full"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
              />
            </div>

            {/* Smile */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-4 border-b-2 border-primary rounded-b-full"
              animate={{ scaleX: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Pulse Effect */}
      <motion.div
        className="absolute inset-24 rounded-full border border-primary/30"
        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
    </div>
  );
}
