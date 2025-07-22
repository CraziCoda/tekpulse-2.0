'use client';

import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, BookOpen, DollarSign, Bell, TrendingUp, Clock, MapPin } from 'lucide-react';

const upcomingEvents = [
  {
    id: 1,
    title: 'Mid-term Examinations',
    date: '2024-03-15',
    time: '09:00 AM',
    location: 'Various Halls',
    type: 'academic',
  },
  {
    id: 2,
    title: 'Career Fair 2024',
    date: '2024-03-20',
    time: '10:00 AM',
    location: 'Main Auditorium',
    type: 'event',
  },
  {
    id: 3,
    title: 'Library Books Due',
    date: '2024-03-18',
    time: '11:59 PM',
    location: 'Central Library',
    type: 'deadline',
  },
];

const quickStats = [
  {
    title: 'Active Students',
    value: '2,847',
    icon: Users,
    change: '+12%',
    color: 'text-blue-600',
  },
  {
    title: 'Lost Items',
    value: '23',
    icon: Clock,
    change: '-8%',
    color: 'text-orange-600',
  },
  {
    title: 'Marketplace Items',
    value: '156',
    icon: DollarSign,
    change: '+24%',
    color: 'text-green-600',
  },
  {
    title: 'Campus Events',
    value: '8',
    icon: Calendar,
    change: '+3%',
    color: 'text-purple-600',
  },
];

const announcements = [
  {
    id: 1,
    title: 'New Semester Registration Open',
    content: 'Registration for Spring 2024 semester is now open. Deadline: March 30th.',
    timestamp: '2 hours ago',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Campus Wi-Fi Maintenance',
    content: 'Scheduled maintenance on March 16th from 2:00 AM to 4:00 AM.',
    timestamp: '1 day ago',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Student Health Services Update',
    content: 'New COVID-19 protocols are now in effect. Please review the guidelines.',
    timestamp: '3 days ago',
    priority: 'low',
  },
];

export default function DashboardPage() {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'event':
        return 'bg-green-100 text-green-800';
      case 'deadline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening on campus today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                    <span className="text-sm text-muted-foreground ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </CardTitle>
              <CardDescription>
                Important dates and events you shouldn't miss
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-4 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                      <span>{event.date}</span>
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
              <Button variant="outline" className="w-full">
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Latest Announcements
              </CardTitle>
              <CardDescription>
                Stay updated with the latest campus news
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className={`p-3 rounded-lg border-l-4 ${getPriorityColor(announcement.priority)} bg-muted/50`}
                >
                  <h4 className="text-sm font-medium mb-1">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                  <span className="text-xs text-muted-foreground">{announcement.timestamp}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Announcements
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used features for easy access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col py-4">
                <BookOpen className="h-6 w-6 mb-2" />
                <span className="text-sm">Course Registration</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-sm">Pay Fees</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Study Groups</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <MapPin className="h-6 w-6 mb-2" />
                <span className="text-sm">Campus Services</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}