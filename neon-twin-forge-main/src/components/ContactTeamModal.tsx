import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, Mail, Sparkles, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnimeButton } from "@/components/ui/anime-button";
import { GlassCard } from "@/components/ui/glass-card";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  photo: string;
  email: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Team Member 1",
    role: "Project Lead / Full Stack Developer",
    description: "Responsible for planning, frontend-backend integration, and overall project coordination.",
    photo: "/team/member1.jpg",
    email: "member1@example.com"
  },
  {
    name: "Team Member 2",
    role: "Frontend Developer",
    description: "Worked on user interface, responsive design, and interactive dashboard components.",
    photo: "/team/member2.jpg",
    email: "member2@example.com"
  },
  {
    name: "Team Member 3",
    role: "Backend Developer",
    description: "Handled APIs, database models, authentication, and memory storage logic.",
    photo: "/team/member3.jpg",
    email: "member3@example.com"
  },
  {
    name: "Team Member 4",
    role: "AI / ML Integration",
    description: "Worked on AI provider integration, vector memory, chatbot behavior, and intelligent responses.",
    photo: "/team/member4.jpg",
    email: "member4@example.com"
  }
];

const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const [imageError, setImageError] = React.useState(false);
  const initial = member.name.charAt(0);

  return (
    <GlassCard className="p-5 flex flex-col items-center text-center group hover:border-primary/40 transition-all duration-300">
      <div className="relative mb-4">
        {!imageError ? (
          <img
            src={member.photo}
            alt={member.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-glow-sm">
            {initial}
          </div>
        )}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      
      <h3 className="font-display font-bold text-foreground mb-1">{member.name}</h3>
      <p className="text-xs text-primary font-medium mb-3 uppercase tracking-wider">{member.role}</p>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{member.description}</p>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer mt-auto">
        <Mail className="w-3 h-3" />
        <span>{member.email}</span>
      </div>
    </GlassCard>
  );
};

export function ContactTeamModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <AnimeButton
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full border border-cyan-400/40 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-300 group"
          title="Contact Us"
        >
          <Users className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        </AnimeButton>
      </DialogTrigger>
      <DialogContent className="max-w-4xl glass-card border-primary/20 max-h-[90vh] overflow-y-auto scrollbar-none">
        <DialogHeader className="text-center sm:text-center mb-8">
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
          <DialogTitle className="text-3xl font-display font-bold neon-text">
            Contact Our Team
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            Meet the 4-member team behind this Digital Twin major project.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <TeamMemberCard member={member} />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            For project queries, contact our team coordinator.
          </p>
          <a 
            href="mailto:team@digitaltwinproject.com" 
            className="text-primary font-semibold hover:underline"
          >
            team@digitaltwinproject.com
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
