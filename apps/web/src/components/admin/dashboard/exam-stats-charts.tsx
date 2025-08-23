import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ExamStatsChartsProps {
  data: {
    examStats: {
      certification: string;
      totalQuestions: number;
      totalAttempts: number;
      averageScore: number | null;
      passRate: number;
    }[];
  };
}

const examConfig = {
  totalAttempts: {
    label: "Attempts",
    color: "hsl(var(--chart-1))",
  },
  passRate: {
    label: "Pass Rate %",
    color: "hsl(var(--chart-2))",
  },
  averageScore: {
    label: "Avg Score %",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function ExamStatsCharts({ data }: ExamStatsChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Exam Statistics Overview
            <Badge variant="secondary" className="text-xs">
              {data.examStats.length} exams
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={examConfig} className="h-[400px] w-full">
            <BarChart
              data={data.examStats}
              margin={{
                left: 20,
                right: 20,
                top: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="certification"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="totalAttempts"
                fill="var(--color-totalAttempts)"
                radius={[2, 2, 0, 0]}
                name="Total Attempts"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pass Rate by Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={examConfig} className="h-[300px] w-full">
            <BarChart
              data={data.examStats}
              layout="horizontal"
              margin={{
                left: 80,
                right: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="certification"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={70}
                fontSize={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="passRate"
                fill="var(--color-passRate)"
                radius={[0, 2, 2, 0]}
                name="Pass Rate %"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Score by Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={examConfig} className="h-[300px] w-full">
            <BarChart
              data={data.examStats}
              layout="horizontal"
              margin={{
                left: 80,
                right: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="certification"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={70}
                fontSize={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="averageScore"
                fill="var(--color-averageScore)"
                radius={[0, 2, 2, 0]}
                name="Avg Score %"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export function ExamStatsChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>

      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

