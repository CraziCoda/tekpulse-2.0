'use client';

import { useState, useEffect } from 'react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MessageSquare, 
  ShoppingBag, 
  Search, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Crown,
  Star,
  UserCheck,
  UserPlus,
  Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const adminStats = [
  {
    title: 'Total Users',
    value: '2,847',
    change: '+12%',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Active Messages',
    value: '1,234',
    change: '+8%',
    icon: MessageSquare,
    color: 'text-green-600'
  },
  {
    title: 'Marketplace Items',
    value: '156',
    change: '+24%',
    icon: ShoppingBag,
    color: 'text-purple-600'
  },
  {
    title: 'Leadership Applications',
    value: '8',
    change: '+3%',
    icon: Crown,
    color: 'text-orange-600'
  }
];

const recentUsers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@university.edu',
    studentId: 'ST001',
    joinDate: '2024-03-10',
    status: 'active',
    position: null
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    studentId: 'ST002',
    joinDate: '2024-03-12',
    status: 'active',
    position: { title: 'Class Representative', department: 'Computer Science', level: 'representative' }
  },
  {
    id: 3,
    name: 'Mike Davis',
    email: 'mike.davis@university.edu',
    studentId: 'ST003',
    joinDate: '2024-03-08',
    status: 'pending',
    position: null
  }
];

const leadershipApplications = [
  {
    id: 1,
    applicant: {
      name: 'Emma Wilson',
      email: 'emma.wilson@university.edu',
      studentId: 'ST004'
    },
    position: 'Student Council President',
    department: 'Student Government',
    level: 'president',
    reason: 'I have been actively involved in student activities for 3 years and want to represent all students.',
    appliedDate: '2024-03-10',
    status: 'pending'
  },
  {
    id: 2,
    applicant: {
      name: 'Alex Brown',
      email: 'alex.brown@university.edu',
      studentId: 'ST005'
    },
    position: 'CS Department Representative',
    department: 'Computer Science',
    level: 'representative',
    reason: 'As a senior CS student, I want to help bridge communication between students and faculty.',
    appliedDate: '2024-03-12',
    status: 'pending'
  },
  {
    id: 3,
    applicant: {
      name: 'Lisa Chen',
      email: 'lisa.chen@university.edu',
      studentId: 'ST006'
    },
    position: 'Engineering Faculty Secretary',
    department: 'Engineering & Technology',
    level: 'secretary',
    reason: 'I have excellent organizational skills and want to support engineering students.',
    appliedDate: '2024-03-08',
    status: 'approved'
  }
];

const currentLeaders = [
  {
    id: 1,
    name: 'David Kim',
    email: 'david.kim@university.edu',
    studentId: 'ST007',
    position: 'Student Body President',
    department: 'Student Government',
    level: 'president',
    appointedDate: '2024-01-15',
    communities: ['Student Government', 'All Campus']
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria.garcia@university.edu',
    studentId: 'ST008',
    position: 'Business Faculty President',
    department: 'Business & Economics',
    level: 'president',
    appointedDate: '2024-02-01',
    communities: ['Business Administration', 'Business Faculty']
  }
];

const reportedContent = [
  {
    id: 1,
    type: 'message',
    content: 'Inappropriate message content',
    reporter: 'Anonymous',
    reported: 'John Doe',
    status: 'pending',
    date: '2024-03-12'
  },
  {
    id: 2,
    type: 'listing',
    content: 'Fake marketplace listing',
    reporter: 'Sarah J.',
    reported: 'Mike D.',
    status: 'resolved',
    date: '2024-03-10'
  }
];

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState(leadershipApplications);
  const [leaders, setLeaders] = useState(currentLeaders);
  const [isAppointDialogOpen, setIsAppointDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.isAdmin) {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleApplicationAction = (applicationId: number, action: 'approve' | 'reject') => {
    setApplications(applications.map(app => 
      app.id === applicationId 
        ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' }
        : app
    ));
    
    if (action === 'approve') {
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        const newLeader = {
          id: leaders.length + 1,
          name: application.applicant.name,
          email: application.applicant.email,
          studentId: application.applicant.studentId,
          position: application.position,
          department: application.department,
          level: application.level,
          appointedDate: new Date().toISOString().split('T')[0],
          communities: [application.department]
        };
        setLeaders([...leaders, newLeader]);
      }
    }
  };

  const handleRemoveLeader = (leaderId: number) => {
    setLeaders(leaders.filter(leader => leader.id !== leaderId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'president':
        return Crown;
      case 'secretary':
        return Star;
      case 'representative':
        return UserCheck;
      default:
        return Users;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'president':
        return 'text-yellow-600';
      case 'secretary':
        return 'text-blue-600';
      case 'representative':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Shield className="h-8 w-8 mr-3 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, content, leadership positions, and platform settings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat) => {
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

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="content">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage student accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{user.name}</h4>
                            {user.position && (
                              <Badge variant="outline" className="text-xs">
                                {user.position.title}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">Student ID: {user.studentId} • Joined {user.joinDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leadership" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Current Student Leaders</CardTitle>
                  <CardDescription>
                    Manage appointed student leadership positions
                  </CardDescription>
                </div>
                <Dialog open={isAppointDialogOpen} onOpenChange={setIsAppointDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Appoint Leader
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Appoint Student Leader</DialogTitle>
                      <DialogDescription>
                        Directly appoint a student to a leadership position
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input id="studentId" placeholder="ST001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position Title</Label>
                        <Input id="position" placeholder="e.g., Class Representative" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department/Faculty</Label>
                        <Input id="department" placeholder="e.g., Computer Science" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="level">Leadership Level</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="representative">Representative</SelectItem>
                            <SelectItem value="secretary">Secretary</SelectItem>
                            <SelectItem value="president">President</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full">
                        Appoint Leader
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaders.map((leader) => {
                    const LevelIcon = getLevelIcon(leader.level);
                    return (
                      <div key={leader.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">{leader.name}</h4>
                                <LevelIcon className={`h-4 w-4 ${getLevelColor(leader.level)}`} />
                              </div>
                              <p className="text-sm font-medium text-primary">{leader.position}</p>
                              <p className="text-sm text-muted-foreground">{leader.department}</p>
                              <p className="text-xs text-muted-foreground">
                                Appointed: {leader.appointedDate} • {leader.studentId}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveLeader(leader.id)}>
                            Remove
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {leader.communities.map((community) => (
                            <Badge key={community} variant="secondary" className="text-xs">
                              {community}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leadership Applications</CardTitle>
                <CardDescription>
                  Review and approve student leadership applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((application) => {
                    const LevelIcon = getLevelIcon(application.level);
                    return (
                      <div key={application.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              <AvatarFallback>{application.applicant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">{application.applicant.name}</h4>
                                <LevelIcon className={`h-4 w-4 ${getLevelColor(application.level)}`} />
                              </div>
                              <p className="text-sm font-medium text-primary">{application.position}</p>
                              <p className="text-sm text-muted-foreground">{application.department}</p>
                              <p className="text-xs text-muted-foreground">
                                Applied: {application.appliedDate} • {application.applicant.studentId}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {application.reason}
                          </p>
                        </div>
                        {application.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApplicationAction(application.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApplicationAction(application.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>
                  Review and moderate reported content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportedContent.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{report.content}</h4>
                          <p className="text-sm text-muted-foreground">
                            Reported by {report.reporter} • Against {report.reported}
                          </p>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Security Settings</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure authentication and security policies
                    </p>
                    <Button variant="outline" size="sm">
                      Manage Security
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Content Policies</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Set community guidelines and content moderation rules
                    </p>
                    <Button variant="outline" size="sm">
                      Edit Policies
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Leadership Settings</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure leadership application process and permissions
                    </p>
                    <Button variant="outline" size="sm">
                      Manage Leadership
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">System Maintenance</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Schedule maintenance and manage system updates
                    </p>
                    <Button variant="outline" size="sm">
                      System Tools
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}