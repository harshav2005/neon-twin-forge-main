import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  Heart,
  TrendingUp,
  Calendar,
  ArrowUp
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import metricsService from "@/services/metricsService";

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await metricsService.getAnalytics();
        setData(result);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Use API data or fallbacks
  const moodData = data?.moodData || [];
  const heatmapData = data?.heatmap || [];
  const stats = data?.stats || { totalConversations: 0, avgMood: 0, stressLevel: 'Unknown' };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-neon-cyan animate-pulse">Loading Analytics...</div>
      </div>
    );
  }

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
            <span className="neon-text">Performance Analytics</span>
          </h1>
          <p className="text-muted-foreground">
            Monitor your digital twin's learning progress and system metrics
          </p>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4" variant="hover">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center">
                +12% <ArrowUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalConversations}</h3>
            <p className="text-xs text-muted-foreground">Total Conversations</p>
          </GlassCard>

          <GlassCard className="p-4" variant="hover">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Activity className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center">
                +5% <ArrowUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.avgMood}%</h3>
            <p className="text-xs text-muted-foreground">Average Mood Score</p>
          </GlassCard>

          <GlassCard className="p-4" variant="hover">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Heart className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center">
                Stable
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.stressLevel}</h3>
            <p className="text-xs text-muted-foreground">Stress Level</p>
          </GlassCard>

          <GlassCard className="p-4" variant="hover">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center">
                +8% <ArrowUp className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">98%</h3>
            <p className="text-xs text-muted-foreground">System Reliability</p>
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Mood Trends Chart */}
          <GlassCard className="p-6 h-[400px]">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Mood Trends (Last 7 Days)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveLine
                data={[
                  {
                    id: "mood",
                    data: moodData.length > 0 ? moodData.map((d: any) => ({ x: d.day, y: d.value })) : [{ x: 'Today', y: 0 }]
                  }
                ]}
                margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: 100, stacked: false }}
                curve="catmullRom"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                enableGridX={false}
                enableGridY={true}
                pointSize={8}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                enableArea={true}
                areaOpacity={0.15}
                useMesh={true}
                theme={{
                  axis: {
                    ticks: {
                      text: { fill: "hsl(var(--muted-foreground))" }
                    }
                  },
                  grid: {
                    line: { stroke: "hsl(var(--border))" }
                  },
                  crosshair: {
                    line: { stroke: "hsl(var(--primary))" }
                  }
                }}
                colors={["hsl(var(--primary))"]}
              />
            </div>
          </GlassCard>

          {/* Activity Heatmap */}
          <GlassCard className="p-6 h-[400px]">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              Interaction Heatmap
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveHeatMap
                data={heatmapData}
                margin={{ top: 50, right: 20, bottom: 60, left: 60 }}
                valueFormat=">-.0s"
                axisTop={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                }}
                axisRight={null}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                colors={{
                  type: 'sequential',
                  scheme: 'cool',
                }}
                emptyColor="hsl(var(--muted) / 0.1)"
                borderColor={{
                  from: 'color',
                  modifiers: [['darker', 0.8]],
                }}
                hoverTarget="cell"
                borderWidth={1}

                theme={{
                  text: { fill: "hsl(var(--foreground))" },
                  axis: {
                    ticks: {
                      text: { fill: "hsl(var(--muted-foreground))" }
                    }
                  }
                }}
              />
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
