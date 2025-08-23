import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Target
} from "lucide-react";

interface MetricsCardsProps {
  data: {
    totalUsers: number;
    totalExams: number;
    totalAttempts: number;
    totalQuestions: number;
    totalOrders: number;
    completedAttempts: number;
    averageScore: number | null;
  };
}

export function MetricsCards({ data }: MetricsCardsProps) {
  const completionRate = data.totalAttempts > 0
    ? Math.round((data.completedAttempts / data.totalAttempts) * 100)
    : 0;

  const metrics = [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Exams",
      value: data.totalExams.toLocaleString(),
      icon: BookOpen,
      description: "Available certifications",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Attempts",
      value: data.totalAttempts.toLocaleString(),
      icon: FileText,
      description: "Exam attempts made",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Questions Bank",
      value: data.totalQuestions.toLocaleString(),
      icon: TrendingUp,
      description: "Total questions available",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Orders",
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      description: "Total orders placed",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Completed Attempts",
      value: data.completedAttempts.toLocaleString(),
      icon: CheckCircle,
      description: `${completionRate}% completion rate`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Average Score",
      value: data.averageScore ? `${Math.round(data.averageScore)}%` : "N/A",
      icon: Target,
      description: "Overall average score",
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function MetricsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

