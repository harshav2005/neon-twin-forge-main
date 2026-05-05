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
        {/* Digital Human Face — SVG */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <svg
            viewBox="0 0 120 140"
            width="110"
            height="128"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.15" />
              </radialGradient>
              <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Head shape */}
            <ellipse cx="60" cy="68" rx="46" ry="55" fill="url(#faceGrad)" stroke="hsl(var(--primary))" strokeWidth="0.6" strokeOpacity="0.5" />

            {/* Circuit lines on forehead */}
            <g stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.4" fill="none">
              <line x1="60" y1="20" x2="60" y2="32" />
              <line x1="60" y1="26" x2="50" y2="26" />
              <line x1="50" y1="26" x2="50" y2="22" />
              <line x1="60" y1="26" x2="70" y2="26" />
              <line x1="70" y1="26" x2="70" y2="22" />
              <circle cx="50" cy="22" r="1.5" fill="hsl(var(--primary))" fillOpacity="0.6" />
              <circle cx="70" cy="22" r="1.5" fill="hsl(var(--primary))" fillOpacity="0.6" />
            </g>

            {/* Eyebrows */}
            <path d="M 34 50 Q 42 46 50 49" stroke="hsl(var(--primary))" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeOpacity="0.8" />
            <path d="M 70 49 Q 78 46 86 50" stroke="hsl(var(--primary))" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeOpacity="0.8" />

            {/* Eye sockets */}
            <ellipse cx="42" cy="62" rx="11" ry="10" fill="hsl(var(--background))" fillOpacity="0.6" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeOpacity="0.5" />
            <ellipse cx="78" cy="62" rx="11" ry="10" fill="hsl(var(--background))" fillOpacity="0.6" stroke="hsl(var(--primary))" strokeWidth="0.8" strokeOpacity="0.5" />

            {/* Irises */}
            <circle cx="42" cy="62" r="7" fill="url(#eyeGlow)" filter="url(#glow)" />
            <circle cx="78" cy="62" r="7" fill="url(#eyeGlow)" filter="url(#glow)" />

            {/* Pupils */}
            <circle cx="42" cy="62" r="3" fill="hsl(var(--background))" />
            <circle cx="78" cy="62" r="3" fill="hsl(var(--background))" />

            {/* Eye shine */}
            <circle cx="44" cy="59" r="1.5" fill="white" fillOpacity="0.9" />
            <circle cx="80" cy="59" r="1.5" fill="white" fillOpacity="0.9" />

            {/* Nose */}
            <path d="M 60 72 Q 56 82 58 86 Q 60 88 62 86 Q 64 82 60 72" fill="hsl(var(--primary))" fillOpacity="0.15" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.4" />

            {/* Smile */}
            <path d="M 42 98 Q 60 112 78 98" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#glow)" />

            {/* Cheek highlights */}
            <ellipse cx="30" cy="80" rx="8" ry="5" fill="hsl(var(--secondary))" fillOpacity="0.12" />
            <ellipse cx="90" cy="80" rx="8" ry="5" fill="hsl(var(--secondary))" fillOpacity="0.12" />

            {/* Scan line animation */}
            <motion.rect
              x="14"
              y="13"
              width="92"
              height="2"
              fill="hsl(var(--primary))"
              fillOpacity="0.15"
              animate={{ y: [13, 123, 13] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Ambient glow */}
          <motion.div
            className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
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
