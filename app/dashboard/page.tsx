"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Users,
  BookOpen,
  DollarSign,
  Bell,
  TrendingUp,
  Clock,
  MapPin,
  Tag,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import supabase from "@/lib/supabase";
import moment from "moment";
import { useEffect } from "react";

const upcomingEvents = [
  {
    id: 1,
    title: "Mid-term Examinations",
    date: "2024-03-15",
    time: "09:00 AM",
    location: "Various Halls",
    type: "academic",
  },
  {
    id: 2,
    title: "Career Fair 2024",
    date: "2024-03-20",
    time: "10:00 AM",
    location: "Main Auditorium",
    type: "event",
  },
  {
    id: 3,
    title: "Library Books Due",
    date: "2024-03-18",
    time: "11:59 PM",
    location: "Central Library",
    type: "deadline",
  },
];


export default function DashboardPage() {
  const [platformSummary, setPlatformSummary] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalLostItems: 0,
    totalFoundItems: 0,
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isAnnouncementsDialogOpen, setIsAnnouncementsDialogOpen] =
    useState(false);

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isEventsDialogOpen, setIsEventsDialogOpen] = useState(false);

  const quickStats = [
    {
      title: "Active Students",
      value: platformSummary.totalUsers,
      icon: Users,
      change: "+12%",
      color: "text-blue-600",
    },
    {
      title: "Lost Items",
      value: platformSummary.totalLostItems,
      icon: Clock,
      change: "-8%",
      color: "text-orange-600",
    },
    {
      title: "Marketplace Items",
      value: platformSummary.totalItems,
      icon: DollarSign,
      change: "+24%",
      color: "text-green-600",
    },
    {
      title: "Found Items",
      value: platformSummary.totalFoundItems,
      icon: Tag,
      change: "+3%",
      color: "text-purple-600",
    },
  ];
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-green-100 text-green-800";
      case "deadline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-yellow-500";
      case "normal":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  async function getPlatformSummary() {
    const { data, error } = await supabase
      .from("platform_summary")
      .select("*")
      .single();
    if (error) {
      console.error(error);
    } else {
      setPlatformSummary({
        totalUsers: data.total_profiles,
        totalItems: data.marketplace_items,
        totalLostItems: data.lost_items,
        totalFoundItems: data.found_items,
      });
    }
  }

  async function getAnnouncements() {
    const { data, error } = await supabase.from("announcements").select("*");
    if (error) {
      console.error(error);
    } else {
      setAnnouncements(data);
    }
  }

  async function getUpcomingEvents() {
    const { data, error } = await supabase.from("events").select("*");
    if (error) {
      console.error(error);
    } else {
      setUpcomingEvents(data);
    }
  }

  useEffect(() => {
    getPlatformSummary();
    getAnnouncements();
    getUpcomingEvents();
  }, []);

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4 opacity-30">
              <Sparkles className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back! 👋</h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening on campus today.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              const gradients = [
                'from-blue-500 to-cyan-500',
                'from-orange-500 to-red-500', 
                'from-green-500 to-emerald-500',
                'from-purple-500 to-pink-500'
              ];
              return (
                <Card key={stat.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${gradients[index]} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mb-3">{stat.value}</p>
                    </div>
                    <div className="flex items-center">
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        vs last month
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Upcoming Events
                </CardTitle>
                <CardDescription className="text-base">
                  Important dates and events you shouldn't miss
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event, index) => (
                  <div
                    key={event.id}
                    className="group flex items-start space-x-4 p-4 rounded-xl border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex-shrink-0">
                      <Badge className={`${getEventTypeColor(event.type)} shadow-sm`}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">{event.title}</h4>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span className="font-medium">{event.date}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Dialog open={isEventsDialogOpen} onOpenChange={setIsEventsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:shadow-lg transition-all duration-200">
                      View All Events
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      All Events
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start space-x-4 p-4 rounded-lg border"
                        >
                          <div className="flex-shrink-0">
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold mb-2">{event.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>{event.date}</span>
                              <span>•</span>
                              <span>{event.time}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {upcomingEvents.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No events available
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

            {/* Announcements */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 mr-3">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  Latest Announcements
                </CardTitle>
                <CardDescription className="text-base">
                  Stay updated with the latest campus news
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`group p-4 rounded-xl border-l-4 ${getPriorityColor(
                      announcement.priority
                    )} bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {announcement.title}
                      </h4>
                      <Badge
                        variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {announcement.content}
                    </p>
                    <span className="text-xs text-muted-foreground font-medium">
                      {moment(announcement.created_at).fromNow()}
                    </span>
                  </div>
                ))}
                <Dialog
                  open={isAnnouncementsDialogOpen}
                  onOpenChange={setIsAnnouncementsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:shadow-lg transition-all duration-200">
                      View All Announcements
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      All Announcements
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className={`p-4 rounded-lg border-l-4 ${getPriorityColor(
                            announcement.priority
                          )} bg-muted/50`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-base font-semibold">
                              {announcement.title}
                            </h4>
                            <Badge
                              variant={
                                announcement.priority === "high"
                                  ? "destructive"
                                  : announcement.priority === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {announcement.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                            {announcement.content}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {moment(announcement.created_at).fromNow()}
                          </span>
                        </div>
                      ))}
                      {announcements.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No announcements available
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mr-3">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="text-base">
                Frequently used features for easy access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: BookOpen, label: 'Course Registration', gradient: 'from-blue-500 to-cyan-500' },
                  { icon: DollarSign, label: 'Pay Fees', gradient: 'from-green-500 to-emerald-500' },
                  { icon: Users, label: 'Study Groups', gradient: 'from-purple-500 to-pink-500' },
                  { icon: MapPin, label: 'Campus Services', gradient: 'from-orange-500 to-red-500' }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button 
                      key={action.label}
                      variant="outline" 
                      className="h-auto flex-col py-6 border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
