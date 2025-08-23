import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  FileText,
  BookOpen,
  Settings,
  TrendingUp,
  Download,
  Upload
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export function QuickActions() {
  const actions = [
    {
      title: "Create New Exam",
      description: "Add a new certification exam",
      icon: Plus,
      href: "/dashboard/exams/create-exam",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      variant: "default" as const,
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      href: "/dashboard/users",
      color: "text-green-600",
      bgColor: "bg-green-100",
      variant: "outline" as const,
    },
    {
      title: "View Exams",
      description: "Browse all available exams",
      icon: BookOpen,
      href: "/dashboard/exams",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      variant: "outline" as const,
    },
    {
      title: "Orders Management",
      description: "Manage user orders and payments",
      icon: FileText,
      href: "/dashboard/orders",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      variant: "outline" as const,
    },
  ];

  const utilities = [
    {
      title: "Export Reports",
      description: "Download system reports",
      icon: Download,
      action: "export",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Import Data",
      description: "Bulk import exam questions",
      icon: Upload,
      action: "import",
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      action: "settings",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="group"
                >
                  <div className="p-4 rounded-lg border hover:shadow-md transition-all duration-200 hover:border-primary/50">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-4 w-4 ${action.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm group-hover:text-primary transition-colors">
                          {action.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Utilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {utilities.map((utility) => {
              const Icon = utility.icon;
              return (
                <Button
                  key={utility.title}
                  variant="ghost"
                  className="h-auto p-4 justify-start hover:bg-muted/50"
                  onClick={() => {
                    // TODO: Implement utility actions
                    console.log(`${utility.action} action triggered`);
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`p-2 rounded-lg ${utility.bgColor}`}>
                      <Icon className={`h-4 w-4 ${utility.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium text-sm">
                        {utility.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {utility.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

