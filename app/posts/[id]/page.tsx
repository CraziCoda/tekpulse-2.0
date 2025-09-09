"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Send,
  ArrowLeft,
  Crown,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import supabase from "@/lib/supabase";
import moment from "moment";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isCommenting, setIsCommenting] = useState(false);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "president": return Crown;
      case "secretary": return Star;
      case "representative": return UserCheck;
      default: return Users;
    }
  };

  const handleLike = async () => {
    if (!post || !user) return;
    
    const isLiked = post.users_liked?.some((like: any) => like.user_id === user.id);
    
    if (!isLiked) {
      await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    }
    
    getPost();
  };

  const handleBookmark = async () => {
    if (!post || !user) return;
    
    const isBookmarked = post.users_bookmarked?.some((bookmark: any) => bookmark.user_id === user.id);
    
    if (!isBookmarked) {
      await supabase.from("bookmarks").insert({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from("bookmarks").delete().eq("post_id", post.id).eq("user_id", user.id);
    }
    
    getPost();
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !user || !post) return;
    
    setIsCommenting(true);
    
    const { error } = await supabase.from("comments").insert({
      content: newComment.trim(),
      post_id: post.id,
      author_id: user.id,
    });

    if (!error) {
      setNewComment("");
      getComments();
    }
    
    setIsCommenting(false);
  };

  const getPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles (
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
        users_liked:likes(user_id),
        users_bookmarked:bookmarks(user_id)
      `)
      .eq("id", params.id)
      .eq("users_liked.user_id", user?.id)
      .eq("users_bookmarked.user_id", user?.id)
      .single();

    if (!error && data) {
      setPost({
        ...data,
        author: {
          ...data.author,
          position: data.author.positions?.[0] || null,
        },
      });
    }
  };

  const getComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:profiles (
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
        )
      `)
      .eq("post_id", params.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data.map((comment: any) => ({
        ...comment,
        author: {
          ...comment.author,
          position: comment.author.positions?.[0] || null,
        },
      })));
    }
  };

  const getUserProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();
      if (data) setUser(data);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      getPost();
      getComments();
    }
  }, [user, params.id]);

  if (!post) return null;

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-purple-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Main Post */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 mb-6">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start space-x-3 mb-4">
                <Avatar className="ring-2 ring-purple-200 shadow-md">
                  {post.author?.profile_pic ? (
                    <img src={post.author.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                      {post.author?.full_name?.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-bold text-lg">{post.author?.full_name}</h4>
                    {post?.author?.position && (
                      <>
                        {(() => {
                          const LevelIcon = getLevelIcon(post.author.position.level);
                          return (
                            <div className="p-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                              <LevelIcon className="h-3 w-3 text-white" />
                            </div>
                          );
                        })()}
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-sm">
                          {post.author.position.title}
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="font-medium">{post.author.student_id}</span>
                    <span>•</span>
                    <span className="font-medium">{moment(post.created_at).fromNow()}</span>
                    {post.community && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                          {post.community.name}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-base leading-relaxed mb-4 text-slate-700">{post.content}</p>
                {post.attachment_url && (() => {
                  const fileName = post.attachment_url.split('/').pop() || 'attachment';
                  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
                  const isExecutable = ['exe', 'bat', 'cmd', 'scr', 'com', 'pif', 'msi', 'jar'].includes(fileExt);
                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
                  const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExt);
                  
                  return (
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      {isImage ? (
                        <img src={post.attachment_url} alt="Post attachment" className="w-full max-h-96 object-cover" />
                      ) : isVideo ? (
                        <video src={post.attachment_url} controls className="w-full max-h-96 rounded-xl" />
                      ) : (
                        <div className={`p-4 rounded-xl ${isExecutable ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-100'}`}>
                          {isExecutable && (
                            <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg">
                              <div className="flex items-center text-red-700 text-sm font-medium">
                                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Warning: Executable file - Exercise caution before downloading
                              </div>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isExecutable ? 'bg-red-500' : 'bg-blue-500'}`}>
                              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{fileName}</p>
                              <p className="text-xs text-muted-foreground uppercase">{fileExt} file</p>
                            </div>
                            <a 
                              href={post.attachment_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`px-3 py-1 rounded text-sm font-medium ${isExecutable ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors`}
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn(
                      "flex items-center space-x-2 hover:text-red-500 hover:bg-red-50 rounded-full px-3 py-2 transition-all",
                      post.users_liked?.some((like: any) => like.user_id === user.id) && "text-red-500 bg-red-50"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", post.users_liked?.some((like: any) => like.user_id === user.id) && "fill-current")} />
                    <span className="font-medium">{post.likes?.[0]?.count || 0}</span>
                  </Button>

                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">{post.comments?.[0]?.count || 0}</span>
                  </div>

                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:text-green-500 hover:bg-green-50 rounded-full px-3 py-2 transition-all">
                    <Share className="h-5 w-5" />
                    <span className="font-medium">Share</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    "hover:text-yellow-500 hover:bg-yellow-50 rounded-full p-2 transition-all",
                    post.users_bookmarked?.some((bookmark: any) => bookmark.user_id === user.id) && "text-yellow-500 bg-yellow-50"
                  )}
                >
                  <Bookmark className={cn("h-5 w-5", post.users_bookmarked?.some((bookmark: any) => bookmark.user_id === user.id) && "fill-current")} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Comment */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-purple-200">
                  {user?.profile_pic ? (
                    <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {user?.full_name?.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 border-2 border-purple-100 focus:border-purple-300 rounded-full"
                  />
                  <Button
                    size="sm"
                    disabled={!newComment || isCommenting}
                    onClick={handleCreateComment}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 rounded-full shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <Card key={comment.id} className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 ring-2 ring-purple-200">
                      {comment.author.profile_pic ? (
                        <img src={comment.author.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {comment.author.full_name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-sm">{comment.author.full_name}</span>
                        {comment.author.position && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-sm text-xs">
                            {comment.author.position.title}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{moment(comment.created_at).fromNow()}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}