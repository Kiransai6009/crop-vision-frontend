import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Leaf, BarChart3, CloudRain } from "lucide-react";

interface ChartsContainerProps {
  ndviData: any[];
  yieldData: any[];
  weatherData: any[];
}

export const ChartsContainer = ({ ndviData, yieldData, weatherData }: ChartsContainerProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* NDVI Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 md:p-8 rounded-3xl glass-card border border-border/40 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">NDVI Vegetation Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly crop health indicator</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={ndviData}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 1]} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background) / 0.9)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="ndvi" stroke="hsl(160 84% 39%)" strokeWidth={3} fill="url(#ndviGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Yield Prediction Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 md:p-8 rounded-3xl glass-card border border-border/40 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">Actual vs Predicted Yield</h3>
              <p className="text-xs text-muted-foreground">Historical comparison (t/ha)</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={yieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background) / 0.9)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="hsl(var(--secondary))" strokeWidth={3} strokeDasharray="6 6" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weather Analytics Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 md:p-8 rounded-3xl glass-card border border-border/40 shadow-lg w-full"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CloudRain className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Rainfall vs Temperature</h3>
            <p className="text-xs text-muted-foreground">Meteorological indicators affecting crop health</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weatherData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background) / 0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                color: "hsl(var(--foreground))",
                fontSize: 12,
              }}
              cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
            />
            <Bar yAxisId="left" dataKey="rainfall" fill="hsl(var(--primary) / 0.8)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Line yAxisId="right" type="monotone" dataKey="temp" stroke="hsl(var(--destructive))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--destructive))" }} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
