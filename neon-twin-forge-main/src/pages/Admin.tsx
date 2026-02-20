import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Brain, 
  Layers, 
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimeButton } from "@/components/ui/anime-button";
import { cn } from "@/lib/utils";

const mockUsers = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", status: "active", twins: 2, lastActive: "2 hours ago" },
  { id: 2, name: "Sarah Smith", email: "sarah@example.com", status: "active", twins: 1, lastActive: "5 mins ago" },
  { id: 3, name: "Mike Chen", email: "mike@example.com", status: "inactive", twins: 3, lastActive: "3 days ago" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", status: "active", twins: 1, lastActive: "1 hour ago" },
  { id: 5, name: "Chris Wilson", email: "chris@example.com", status: "pending", twins: 0, lastActive: "Never" },
];

const mockTwins = [
  { id: 1, name: "Alex's Primary Twin", owner: "Alex Johnson", status: "active", conversations: 156 },
  { id: 2, name: "Alex's Work Twin", owner: "Alex Johnson", status: "training", conversations: 42 },
  { id: 3, name: "Sarah's Twin", owner: "Sarah Smith", status: "active", conversations: 89 },
  { id: 4, name: "Mike's Twin Alpha", owner: "Mike Chen", status: "inactive", conversations: 234 },
  { id: 5, name: "Emily's Twin", owner: "Emily Davis", status: "active", conversations: 67 },
];

const mockJobs = [
  { id: 1, type: "Training", target: "Alex's Work Twin", status: "running", progress: 67, started: "10 mins ago" },
  { id: 2, type: "Sync", target: "Sarah's Twin", status: "completed", progress: 100, started: "1 hour ago" },
  { id: 3, type: "Training", target: "Mike's Twin Beta", status: "queued", progress: 0, started: "Pending" },
  { id: 4, type: "Backup", target: "All Twins", status: "completed", progress: 100, started: "Yesterday" },
];

type Tab = "users" | "twins" | "jobs";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-primary/20 text-primary",
      inactive: "bg-muted text-muted-foreground",
      pending: "bg-yellow-500/20 text-yellow-500",
      training: "bg-secondary/20 text-secondary",
      running: "bg-primary/20 text-primary",
      completed: "bg-green-500/20 text-green-500",
      queued: "bg-yellow-500/20 text-yellow-500",
    };
    return styles[status as keyof typeof styles] || "bg-muted text-muted-foreground";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "running":
      case "training":
        return <Clock className="w-4 h-4" />;
      case "pending":
      case "queued":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

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
            <span className="neon-text">Admin</span> Panel
          </h1>
          <p className="text-muted-foreground">
            Manage users, twins, and system jobs
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: "1,234", icon: Users, color: "text-primary" },
            { label: "Active Twins", value: "2,847", icon: Brain, color: "text-secondary" },
            { label: "Jobs Today", value: "156", icon: Layers, color: "text-accent" },
            { label: "System Health", value: "99.9%", icon: Settings, color: "text-green-500" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="overflow-hidden">
            {/* Tab Header */}
            <div className="border-b border-border/50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-2">
                  {[
                    { id: "users" as Tab, label: "Users", icon: Users },
                    { id: "twins" as Tab, label: "Twins", icon: Brain },
                    { id: "jobs" as Tab, label: "Jobs", icon: Layers },
                  ].map((tab) => (
                    <AnimeButton
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </AnimeButton>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl bg-input/50 border border-border/50 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 overflow-x-auto">
              {activeTab === "users" && (
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Twins</th>
                      <th className="pb-3 font-medium">Last Active</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1", getStatusBadge(user.status))}>
                            {getStatusIcon(user.status)}
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4">{user.twins}</td>
                        <td className="py-4 text-muted-foreground">{user.lastActive}</td>
                        <td className="py-4">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "twins" && (
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="pb-3 font-medium">Twin</th>
                      <th className="pb-3 font-medium">Owner</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Conversations</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTwins.map((twin, index) => (
                      <motion.tr
                        key={twin.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 font-medium">{twin.name}</td>
                        <td className="py-4 text-muted-foreground">{twin.owner}</td>
                        <td className="py-4">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1", getStatusBadge(twin.status))}>
                            {getStatusIcon(twin.status)}
                            {twin.status}
                          </span>
                        </td>
                        <td className="py-4">{twin.conversations}</td>
                        <td className="py-4">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "jobs" && (
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="pb-3 font-medium">Job</th>
                      <th className="pb-3 font-medium">Target</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Progress</th>
                      <th className="pb-3 font-medium">Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockJobs.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 font-medium">{job.type}</td>
                        <td className="py-4 text-muted-foreground">{job.target}</td>
                        <td className="py-4">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1", getStatusBadge(job.status))}>
                            {getStatusIcon(job.status)}
                            {job.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${job.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{job.progress}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground">{job.started}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}
