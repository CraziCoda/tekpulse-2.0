'use client';

import { useState } from 'react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Calendar,
  MapPin,
  Users,
  Bookmark,
  Send,
  X,
  Plus,
  Crown,
  Star,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const samplePosts = [
  {
    id: 1,
    author: {
      name: 'Sarah Johnson',
      studentId: 'ST002',
      avatar: 'SJ',
      position: { title: 'CS President', level: 'president' }
    },
    content: 'Just finished my midterm exam! 📚 Feeling confident about Computer Science 101. Anyone else taking this course? Would love to form a study group for the final! #StudyGroup #CS101',
    timestamp: '2 hours ago',
    likes: 12,
    comments: 5,
    shares: 2,
    isLiked: false,
    isBookmarked: false,
    tags: ['StudyGroup', 'CS101'],
    type: 'text'
  },
  {
    id: 2,
    author: {
      name: 'Mike Davis',
      studentId: 'ST003',
      avatar: 'MD',
      position: { title: 'Business Rep', level: 'representative' }
    },
    content: 'Beautiful sunset from the campus library! 🌅 Perfect study atmosphere tonight. The new study pods on the 3rd floor are amazing!',
    timestamp: '4 hours ago',
    likes: 28,
    comments: 8,
    shares: 5,
    isLiked: true,
    isBookmarked: true,
    tags: ['CampusLife', 'Library'],
    type: 'text',
    location: 'Main Library'
  },
  {
    id: 3,
    author: {
      name: 'Emma Wilson',
      studentId: 'ST004',
      avatar: 'EW',
      position: null
    },
    content: 'PSA: The cafeteria is serving amazing pasta today! 🍝 Get there before 1 PM - it\'s going fast. Also, they finally have oat milk for coffee! ☕',
    timestamp: '6 hours ago',
    likes: 45,
    comments: 12,
    shares: 8,
    isLiked: false,
    isBookmarked: false,
    tags: ['Food', 'Cafeteria'],
    type: 'text',
    location: 'Student Center'
  },
  {
    id: 4,
    author: {
      name: 'Alex Brown',
      studentId: 'ST005',
      avatar: 'AB',
      position: null
    },
    content: 'Looking for someone to practice Spanish conversation with! 🇪🇸 I\'m intermediate level and would love to meet up weekly. Coffee on me! ☕',
    timestamp: '1 day ago',
    likes: 18,
    comments: 15,
    shares: 3,
    isLiked: true,
    isBookmarked: false,
    tags: ['LanguageExchange', 'Spanish'],
    type: 'text'
  },
  {
    id: 5,
    author: {
      name: 'David Kim',
      studentId: 'ST007',
      avatar: 'DK',
      position: { title: 'Student Body President', level: 'president' }
    },
    content: 'Reminder: Career Fair is tomorrow! 💼 I\'ve prepared my resume and researched 10 companies. Who else is going? Let\'s support each other! #CareerFair2024',
    timestamp: '1 day ago',
    likes: 67,
    comments: 23,
    shares: 15,
    isLiked: false,
    isBookmarked: true,
    tags: ['CareerFair2024', 'Jobs'],
    type: 'text',
    event: {
      title: 'Career Fair 2024',
      date: 'Tomorrow, 10:00 AM',
      location: 'Main Auditorium'
    }
  },
  {
    id: 6,
    author: {
      name: 'Lisa Chen',
      studentId: 'ST006',
      avatar: 'LC',
      position: { title: 'Medical Secretary', level: 'secretary' }
    },
    content: 'Important update for all medical students: New clinical rotation schedules are now available. Please check your student portal and confirm your preferences by Friday. 🏥',
    timestamp: '2 days ago',
    likes: 34,
    comments: 8,
    shares: 12,
    isLiked: false,
    isBookmarked: false,
    tags: ['Medical', 'Clinical', 'Important'],
    type: 'text'
  }
];

export default function PostsPage() {
  const [posts, setPosts] = useState(samplePosts);
  const [newPost, setNewPost] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');

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

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleBookmark = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleShare = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
    // In a real app, this would open a share dialog
    console.log('Sharing post:', postId);
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: {
          name: 'John Doe',
          studentId: 'ST001',
          avatar: 'JD',
          position: null
        },
        content: newPost,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        tags: [],
        type: 'text' as const
      };
      setPosts([post, ...posts]);
      setNewPost('');
      setIsCreateDialogOpen(false);
    }
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarFallback>{post.author.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold">{post.author.name}</h4>
                {post.author.position && (
                  <>
                    {(() => {
                      const LevelIcon = getLevelIcon(post.author.position.level);
                      return <LevelIcon className={`h-4 w-4 ${getLevelColor(post.author.position.level)}`} />;
                    })()}
                    <Badge variant="outline" className="text-xs">
                      {post.author.position.title}
                    </Badge>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{post.author.studentId}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed">{post.content}</p>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Event Card */}
          {post.event && (
            <Card className="mt-3 border-l-4 border-l-primary">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <h5 className="font-medium text-sm">{post.event.title}</h5>
                    <p className="text-xs text-muted-foreground">{post.event.date}</p>
                    <p className="text-xs text-muted-foreground">{post.event.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post.id)}
              className={cn(
                "flex items-center space-x-2 hover:text-red-500",
                post.isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
              <span className="text-sm">{post.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPost(post.id)}
              className="flex items-center space-x-2 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare(post.id)}
              className="flex items-center space-x-2 hover:text-green-500"
            >
              <Share className="h-4 w-4" />
              <span className="text-sm">{post.shares}</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBookmark(post.id)}
            className={cn(
              "hover:text-yellow-500",
              post.isBookmarked && "text-yellow-500"
            )}
          >
            <Bookmark className={cn("h-4 w-4", post.isBookmarked && "fill-current")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campus Feed</h1>
            <p className="text-muted-foreground">
              Share updates and connect with fellow students
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create a Post</DialogTitle>
                <DialogDescription>
                  Share something with your fellow students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="What's happening on campus?"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={4}
                      className="resize-none border-none p-0 focus-visible:ring-0 text-lg"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {280 - newPost.length}
                    </span>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!newPost.trim() || newPost.length > 280}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Post */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="What's happening on campus?"
                  onClick={() => setIsCreateDialogOpen(true)}
                  readOnly
                  className="resize-none cursor-pointer"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline">
            Load More Posts
          </Button>
        </div>

        {/* Comments Dialog */}
        <Dialog open={selectedPost !== null} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4">
                {/* Original Post */}
                <div className="pb-4 border-b">
                  <PostCard post={posts.find(p => p.id === selectedPost)} />
                </div>
                
                {/* Comments */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">Alex Brown</span>
                        <span className="text-xs text-muted-foreground">2h</span>
                      </div>
                      <p className="text-sm">Great post! I'm also looking for study partners.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>LC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">Lisa Chen</span>
                        <Star className="h-3 w-3 text-blue-600" />
                        <Badge variant="outline" className="text-xs">Medical Secretary</Badge>
                        <span className="text-xs text-muted-foreground">1h</span>
                      </div>
                      <p className="text-sm">Count me in! Let's create a group chat.</p>
                    </div>
                  </div>
                </div>
                
                {/* Add Comment */}
                <div className="flex items-start space-x-3 pt-4 border-t">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex space-x-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  );
}