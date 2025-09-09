"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  Plus,
  MessageSquare,
  Calendar,
  BookOpen,
  GraduationCap,
  Building,
  Star,
  TrendingUp,
  Clock,
  Pin,
  Crown,
  UserCheck,
  UserPlus,
  UserMinus,
  Settings,
  Paperclip,
  X,
  Heart,
  Send,
} from "lucide-react";
import supabase from "@/lib/supabase";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function CommunitiesPage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [manageCommunityId, setManageCommunityId] = useState<number | null>(
    null
  );
  const [positionApplication, setPositionApplication] = useState({
    title: "",
    community_id: "",
    level: "",
    reason: "",
  });
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");

  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [creatingCommunityError, setCreatingCommunityError] = useState("");
  const [communities, setCommunities] = useState<any>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [selectedCommunityForPost, setSelectedCommunityForPost] =
    useState<any>(null);
  const [newPost, setNewPost] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<any>([]);
  const [newComment, setNewComment] = useState("");
  const [selectedPostForComment, setSelectedPostForComment] = useState<number | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [postComments, setPostComments] = useState<any>({});
  const [showComments, setShowComments] = useState<number | null>(null);

  const [newCommunity, setNewCommunity] = useState<{
    name: string;
    type: string;
    description: string;
    tags: string;
    parent: string | null;
  }>({
    name: "",
    type: "special",
    description: "",
    tags: "",
    parent: null,
  });

  const communityTypes = [
    { value: "all", label: "All Communities" },
    { value: "department", label: "Departments" },
    { value: "faculty", label: "Faculties" },
    { value: "college", label: "Colleges" },
    { value: "special", label: "Special Groups" },
  ];

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      department: "bg-blue-100 text-blue-800",
      faculty: "bg-purple-100 text-purple-800",
      college: "bg-green-100 text-green-800",
      special: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "department":
        return BookOpen;
      case "faculty":
        return GraduationCap;
      case "college":
        return Building;
      case "special":
        return Star;
      default:
        return Users;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "president":
        return Crown;
      case "secretary":
        return Star;
      case "representative":
        return UserCheck;
      default:
        return Users;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "president":
        return "text-yellow-600";
      case "secretary":
        return "text-blue-600";
      case "representative":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredCommunities = communities.filter((community: any) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.parent_name?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || community.type === selectedType;
    return matchesSearch && matchesType;
  });

  const joinedCommunities = communities.filter((c: any) =>
    c.member_ids?.includes(user?.id)
  );

  const handleJoinCommunity = async (communityId: string) => {
    const commmunity = communities.find((c: any) => c.id === communityId);

    if (!commmunity) {
      console.error("Community not found");
      return;
    }

    if (commmunity?.member_ids?.includes(user.id)) {
      return;
    }

    const { data, error } = await supabase.from("community_members").insert({
      community_id: communityId,
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      return;
    }

    setCommunities(
      communities.map((c: any) =>
        c.id === communityId
          ? { ...c, member_ids: [...c.member_ids, user.id] }
          : c
      )
    );
  };

  const handleApplyForLeadership = async () => {
    if (!positionApplication.title.trim()) {
      setApplicationError("Position title is required");
      return;
    }
    if (!positionApplication.community_id) {
      setApplicationError("Please select a community");
      return;
    }
    if (!positionApplication.level) {
      setApplicationError("Please select a leadership level");
      return;
    }
    if (!positionApplication.reason.trim()) {
      setApplicationError("Please provide a reason");
      return;
    }

    setIsApplying(true);
    setApplicationError("");

    const { error } = await supabase.from("member_positions").insert({
      community_id: positionApplication.community_id,
      title: positionApplication.title,
      level: positionApplication.level,
      reason: positionApplication.reason,
      user_id: user.id,
    });

    if (error) {
      setApplicationError(error.message);
      setIsApplying(false);
      return;
    }

    setIsApplying(false);
    setPositionApplication({
      title: "",
      community_id: "",
      level: "",
      reason: "",
    });
    setIsApplyDialogOpen(false);
  };

  const handleCreateCommunity = async () => {
    if (newCommunity.name.trim() === "") {
      setCreatingCommunityError("Community name is required");
      return;
    } else if (newCommunity.description.trim() === "") {
      setCreatingCommunityError("Description is required");
      return;
    } else if (newCommunity.tags.trim() === "") {
      setCreatingCommunityError("Tags are required");
      return;
    }

    if (!user?.is_admin) {
      setCreatingCommunityError("You are not authorized to create a community");
      return;
    }
    setIsCreatingCommunity(true);

    const { error } = await supabase.from("communities").insert([
      {
        name: newCommunity.name,
        type: newCommunity.type,
        parent_id: newCommunity.parent,
        description: newCommunity.description,
        tags: newCommunity.tags,
      },
    ]);

    if (error) {
      setIsCreatingCommunity(false);
      setCreatingCommunityError(error.message);
      return;
    }

    setCreatingCommunityError("");
    setIsCreatingCommunity(false);
    setIsCreateDialogOpen(false);
  };

  async function getUserProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (data) {
        setUser(data);
      }
    }
  }

  async function getCommunities() {
    const { data, error } = await supabase.from("community_details").select(`
        *,
        leaders:member_positions(
          id,
          title,
          level,
          user_id,
          leader:profiles(id, full_name, student_id, profile_pic)
        )
      `);

    if (error) {
      console.error("Error:", error);
    } else {
      const formattedData = data?.map((community: any) => ({
        ...community,
        leaders:
          community.leaders?.filter((pos: any) => pos.approved !== false) || [],
      }));
      setCommunities(formattedData);
    }
  }

  async function getRecentPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:profiles(
          id,
          full_name,
          student_id,
          profile_pic,
          positions:member_positions(
            id,
            title,
            level,
            approved
          )
        ),
        community:communities(
          id,
          name,
          type
        ),
        likes(count),
        comments(count),
        users_liked:likes(user_id)
      `
      )
      .not("community_id", "is", null)
      .eq("author.positions.approved", true)
      .eq("users_liked.user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error:", error);
    } else {
      const formattedPosts =
        data?.map((post: any) => ({
          ...post,
          author: {
            ...post.author,
            position: post.author.positions?.[0] || null,
          },
        })) || [];
      setRecentPosts(formattedPosts);
    }
  }

  const CommunityCard = ({ community }: { community: any }) => {
    const TypeIcon = getTypeIcon(community.type);

    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-blue-200 shadow-lg">
                <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {community.name.charAt(0) +
                    community.name.split(" ")?.[1]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <CardTitle className="text-xl font-bold">
                    {community.name}
                  </CardTitle>
                  {community.isPrivate && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-sm text-xs">
                      Private
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge
                    className={`${getTypeColor(
                      community.type
                    )} shadow-sm font-medium`}
                  >
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {community.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-medium">
                    {community.faculty}
                  </span>
                </div>

                {/* Community Leaders */}
                {community?.leaders?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {community.leaders.map((leader: any, index: number) => {
                      const LevelIcon = getLevelIcon(leader.level);
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-1 text-xs bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 px-2 py-1 rounded-full"
                        >
                          <div className="p-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                            <LevelIcon className="h-2 w-2 text-white" />
                          </div>
                          <span className="font-medium">
                            {leader.leader?.full_name}
                          </span>
                          <span className="text-muted-foreground">
                            ({leader.title})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {community.canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setManageCommunityId(community.id);
                    setIsManageDialogOpen(true);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              {community.member_ids.includes(user?.id) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCommunityForPost(community);
                    setIsPostDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Post
                </Button>
              )}
              <Button
                className={
                  community.member_ids.includes(user?.id)
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
                }
                size="sm"
                onClick={() => handleJoinCommunity(community.id)}
              >
                {community.member_ids.includes(user?.id) ? "Joined" : "Join"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 line-clamp-2">
            {community.description}
          </CardDescription>

          <div className="flex flex-wrap gap-2 mb-4">
            {community.tags.split(",").map((tag: string) => (
              <Badge
                key={tag}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-sm hover:shadow-md transition-shadow text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 dark:bg-slate-700 px-3 py-1 rounded-full">
                <div className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium">
                  {community.member_count} members
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 dark:bg-slate-700 px-3 py-1 rounded-full">
                <div className="p-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                  <MessageSquare className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium">
                  {community?.posts?.length} posts
                </span>
              </div>
            </div>
            {/* <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{community.recentActivity}</span>
            </div> */}
          </div>

          <div className="text-xs text-muted-foreground bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 p-2 rounded-lg">
            <span className="font-medium">
              Moderated by:{" "}
              {["Dr. Cheeks", "Dr. Binks", "Dr. Pinks"].join(", ")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleLike = async (postId: number) => {
    const post = recentPosts.find((p: any) => p.id === postId);
    const isLiked = post?.users_liked?.some((like: any) => like.user_id === user.id);
    
    if (!isLiked) {
      await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
    }
    
    setRecentPosts(recentPosts.map((p: any) => 
      p.id === postId ? {
        ...p,
        users_liked: isLiked 
          ? p.users_liked.filter((like: any) => like.user_id !== user.id)
          : [...p.users_liked, { user_id: user.id }],
        likes: [{ count: isLiked ? (p.likes?.[0]?.count || 1) - 1 : (p.likes?.[0]?.count || 0) + 1 }]
      } : p
    ));
  };

  const handleComment = async () => {
    if (!newComment.trim() || !selectedPostForComment) return;
    
    setIsCommenting(true);
    const { error } = await supabase.from("comments").insert({
      content: newComment.trim(),
      post_id: selectedPostForComment,
      author_id: user.id,
    });

    if (!error) {
      setNewComment("");
      setSelectedPostForComment(null);
      setRecentPosts(recentPosts.map((p: any) => 
        p.id === selectedPostForComment ? {
          ...p,
          comments: [{ count: (p.comments?.[0]?.count || 0) + 1 }]
        } : p
      ));
      if (showComments === selectedPostForComment) {
        getPostComments(selectedPostForComment);
      }
    }
    setIsCommenting(false);
  };

  const getPostComments = async (postId: number) => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:profiles(
          id,
          full_name,
          profile_pic
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (!error) {
      setPostComments({ ...postComments, [postId]: data || [] });
    }
  };

  const toggleComments = (postId: number) => {
    if (showComments === postId) {
      setShowComments(null);
    } else {
      setShowComments(postId);
      if (!postComments[postId]) {
        getPostComments(postId);
      }
    }
  };

  useEffect(() => {
    getUserProfile();
    getCommunities();
    getRecentPosts();
  }, []);

  useEffect(() => {
    if (user) {
      getRecentPosts();
    }
  }, [user]);

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4 opacity-30">
              <Users className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Communities 🏛️
              </h1>
              <p className="text-blue-100 text-lg">
                Connect with students in your department, faculty, and college
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex space-x-2">
              <Dialog
                open={isApplyDialogOpen}
                onOpenChange={setIsApplyDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Crown className="h-4 w-4 mr-2" />
                    Apply for Leadership
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Apply for Leadership Position</DialogTitle>
                    <DialogDescription>
                      Apply to become a leader in your department or faculty
                      community.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position Title</Label>
                      <Input
                        id="position"
                        placeholder="e.g., CS Department President"
                        value={positionApplication.title}
                        onChange={(e) =>
                          setPositionApplication({
                            ...positionApplication,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="community">Community</Label>
                      <Select
                        value={positionApplication.community_id}
                        onValueChange={(value) =>
                          setPositionApplication({
                            ...positionApplication,
                            community_id: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select community" />
                        </SelectTrigger>
                        <SelectContent>
                          {communities.map((community: any) => (
                            <SelectItem key={community.id} value={community.id}>
                              {community.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Leadership Level</Label>
                      <Select
                        value={positionApplication.level}
                        onValueChange={(value) =>
                          setPositionApplication({
                            ...positionApplication,
                            level: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="representative">
                            Representative
                          </SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="president">President</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">
                        Why do you want this position?
                      </Label>
                      <Textarea
                        id="reason"
                        placeholder="Explain your motivation and qualifications..."
                        rows={4}
                        value={positionApplication.reason}
                        onChange={(e) =>
                          setPositionApplication({
                            ...positionApplication,
                            reason: e.target.value,
                          })
                        }
                      />
                    </div>
                    {applicationError && (
                      <p className="text-red-500 text-sm">{applicationError}</p>
                    )}
                    <Button
                      className="w-full"
                      onClick={handleApplyForLeadership}
                      disabled={isApplying}
                    >
                      {isApplying ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Community</DialogTitle>
                    <DialogDescription>
                      Start a new community for your department, club, or
                      interest group.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Community Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Photography Club"
                        value={newCommunity.name}
                        onChange={(e) =>
                          setNewCommunity({
                            ...newCommunity,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Community Type</Label>
                      <Select
                        defaultValue={newCommunity.type}
                        onValueChange={(value) =>
                          setNewCommunity({ ...newCommunity, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="department">Department</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="special_group">
                            Special Group
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent">Parent Community</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent community" />
                        </SelectTrigger>
                        <SelectContent>
                          {communities.map((community: any) => (
                            <SelectItem key={community.id} value={community.id}>
                              {community.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the purpose and goals of this community..."
                        value={newCommunity.description}
                        onChange={(e) =>
                          setNewCommunity({
                            ...newCommunity,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., photography, art, creative"
                        value={newCommunity.tags}
                        onChange={(e) =>
                          setNewCommunity({
                            ...newCommunity,
                            tags: e.target.value,
                          })
                        }
                      />
                    </div>
                    {creatingCommunityError && (
                      <p className="text-red-500">{creatingCommunityError}</p>
                    )}
                    <Button
                      className="w-full"
                      onClick={handleCreateCommunity}
                      disabled={isCreatingCommunity}
                    >
                      {isCreatingCommunity ? "Creating..." : "Create Community"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger
                value="discover"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                Discover
              </TabsTrigger>
              <TabsTrigger
                value="joined"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                My Communities ({joinedCommunities.length})
              </TabsTrigger>
              <TabsTrigger
                value="feed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                Recent Posts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {communityTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={
                        selectedType === type.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedType(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Communities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCommunities.map((community: any) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>

              {filteredCommunities.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 mx-auto max-w-md">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">
                      No communities found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="joined" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {joinedCommunities.map((community: any) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>

              {joinedCommunities.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 mx-auto max-w-md">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">
                      No communities joined yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Discover and join communities to connect with fellow
                      students
                    </p>
                    <Button
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg"
                      onClick={() => setSelectedType("all")}
                    >
                      Discover Communities
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="feed" className="space-y-4">
              <div className="max-w-2xl mx-auto space-y-4">
                {recentPosts.map((post: any) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {post.community?.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            •
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">
                              {post.author?.full_name}
                            </span>
                            {post.author?.position && (
                              <>
                                {(() => {
                                  const LevelIcon = getLevelIcon(
                                    post.author.position.level
                                  );
                                  return (
                                    <LevelIcon
                                      className={`h-3 w-3 ${getLevelColor(
                                        post.author.position.level
                                      )}`}
                                    />
                                  );
                                })()}
                                <Badge variant="outline" className="text-xs">
                                  {post.author.position.title}
                                </Badge>
                              </>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            •
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {moment(post.created_at).fromNow()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm mb-3">{post.content}</p>

                      {/* Post Attachment */}
                      {post.attachment_url && (() => {
                        const fileName = post.attachment_url.split('/').pop() || 'attachment';
                        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
                        const isExecutable = ['exe', 'bat', 'cmd', 'scr', 'com', 'pif', 'msi', 'jar'].includes(fileExt);
                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
                        const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExt);
                        
                        return (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            {isImage ? (
                              <img
                                src={post.attachment_url}
                                alt="Post attachment"
                                className="w-full max-h-96 object-cover"
                              />
                            ) : isVideo ? (
                              <video
                                src={post.attachment_url}
                                controls
                                className="w-full max-h-96 rounded-lg"
                              />
                            ) : (
                              <div className={`p-3 rounded-lg ${isExecutable ? 'bg-red-50 border border-red-200' : 'bg-gray-100'}`}>
                                {isExecutable && (
                                  <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
                                    ⚠️ Executable file - Exercise caution
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <div className={`p-1 rounded ${isExecutable ? 'bg-red-500' : 'bg-blue-500'}`}>
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium">{fileName}</p>
                                    <p className="text-xs text-muted-foreground uppercase">{fileExt} file</p>
                                  </div>
                                  <a 
                                    href={post.attachment_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={`px-2 py-1 rounded text-xs ${isExecutable ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                  >
                                    Download
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post.id);
                            }}
                            className={`flex items-center space-x-1 ${post.users_liked?.some((like: any) => like.user_id === user.id) ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${post.users_liked?.some((like: any) => like.user_id === user.id) ? 'fill-current' : ''}`} />
                            <span>{post.likes?.[0]?.count || 0}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComments(post.id);
                            }}
                            className="flex items-center space-x-1"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments?.[0]?.count || 0}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {showComments === post.id && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                          {/* Existing Comments */}
                          {postComments[post.id]?.map((comment: any) => (
                            <div key={comment.id} className="flex space-x-2">
                              <Avatar className="h-6 w-6">
                                {comment.author?.profile_pic ? (
                                  <img src={comment.author.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <AvatarFallback className="text-xs">
                                    {comment.author?.full_name?.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-2">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-medium">{comment.author?.full_name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {moment(comment.created_at).fromNow()}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Comment Input */}
                          <div className="flex space-x-2">
                            <Avatar className="h-6 w-6">
                              {user?.profile_pic ? (
                                <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <AvatarFallback className="text-xs">
                                  {user?.full_name?.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1 flex space-x-2">
                              <Input
                                placeholder="Write a comment..."
                                value={selectedPostForComment === post.id ? newComment : ""}
                                onChange={(e) => {
                                  setNewComment(e.target.value);
                                  setSelectedPostForComment(post.id);
                                }}
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                disabled={!newComment || isCommenting || selectedPostForComment !== post.id}
                                onClick={handleComment}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {recentPosts.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 mx-auto max-w-md">
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">
                      No community posts yet
                    </h3>
                    <p className="text-muted-foreground">
                      Join communities and start posting to see content here
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Create Community Post Dialog */}
          <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  Create Post in {selectedCommunityForPost?.name}
                </DialogTitle>
                <DialogDescription>
                  Share something with your community members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  placeholder="What's happening in your community?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={4}
                />

                {/* Image Upload */}
                <div className="space-y-2">
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Add Attachment
                      <input
                        type="file"
                        accept="*/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedImage(file);
                            const reader = new FileReader();
                            reader.onload = () =>
                              setImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPostDialogOpen(false);
                      setSelectedImage(null);
                      setImagePreview(null);
                      setNewPost("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!newPost.trim() && !selectedImage) return;

                      setIsCreatingPost(true);

                      let publicUrl: null | string = null;

                      if (selectedImage) {
                        const fileExt = selectedImage.name.split(".").pop();
                        const { data: imageData, error: uploadError } =
                          await supabase.storage
                            .from("post-images")
                            .upload(
                              `${user.id}/${Date.now()}.${fileExt}`,
                              selectedImage
                            );

                        if (!uploadError) {
                          const { data } = supabase.storage
                            .from("post-images")
                            .getPublicUrl(imageData.path);
                          publicUrl = data.publicUrl;
                        }
                      }

                      const { error } = await supabase.from("posts").insert({
                        content: newPost,
                        author_id: user.id,
                        community_id: selectedCommunityForPost.id,
                        attachment_url: publicUrl,
                      });

                      if (!error) {
                        setNewPost("");
                        setSelectedImage(null);
                        setImagePreview(null);
                        setIsPostDialogOpen(false);
                        getRecentPosts();
                      }
                      setIsCreatingPost(false);
                    }}
                    disabled={
                      (!newPost.trim() && !selectedImage) || isCreatingPost
                    }
                  >
                    {isCreatingPost ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Community Management Dialog */}
          <Dialog
            open={isManageDialogOpen}
            onOpenChange={setIsManageDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Manage Community</DialogTitle>
                <DialogDescription>
                  Add or remove members from your community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search students by name or ID..."
                    className="flex-1"
                  />
                  <Button>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        {user?.profile_pic ? (
                          <img
                            src={user.profile_pic}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <AvatarFallback>JD</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">ST001</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>AB</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Alex Brown</p>
                        <p className="text-xs text-muted-foreground">
                          ST005 • Member
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <UserMinus className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedLayout>
  );
}
