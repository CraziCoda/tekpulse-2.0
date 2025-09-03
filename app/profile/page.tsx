"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  GraduationCap,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";
import supabase from "@/lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>({});
  const [userStats, setUserStats] = useState<any>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any>([]);

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (user && !isEditing) {
      setEditedUser({
        phone_number: user.phone_number,
        major: user.major,
        year: user.year,
        bio: user.bio,
      });
    }
  }, [user, isEditing]);

  useEffect(() => {
    if (user) {
      userOverview();
      getRecentActivity();
      supabase.auth.getUser().then(({ data }) => {
        setUser({
          ...user,
          email: data.user?.email,
        });
      });
    }
  }, [user]);

  async function userOverview() {
    const { data, error } = await supabase
      .from("user_activity_summary")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setUserStats([
        { label: "Communities Joined", value: data.communities_joined },
        { label: "Items Listed", value: data.product_listings },
        { label: "Items Found", value: data.items_found },
        { label: "Posts", value: data.post_count },
      ]);
    }
  }

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !user) return;

    setIsUploading(true);

    const fileExt = selectedImage.name.split(".").pop();
    const { data: imageData, error: uploadError } = await supabase.storage
      .from("profile-pic")
      .upload(`${user.id}/${Date.now()}.${fileExt}`, selectedImage);

    if (uploadError) {
      console.error(uploadError);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("profile-pic")
      .getPublicUrl(imageData.path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ profile_pic: data.publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
    } else {
      setUser({ ...user, profile_pic: data.publicUrl });
    }

    setIsUploading(false);
    setSelectedImage(null);
    setImagePreview(null);
    await getUserProfile();
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        phone_number: editedUser.phone_number,
        major: editedUser.major,
        year: editedUser.year,
        bio: editedUser.bio,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
    } else {
      setUser({ ...user, ...editedUser });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      phone_number: user.phone_number,
      major: user.major,
      year: user.year,
      bio: user.bio,
    });
    setIsEditing(false);
  };

  async function getRecentActivity() {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("activities")
      .select(`
        *,
        actor:profiles!activities_actor_id_fkey(full_name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error);
    } else {
      setRecentActivity(data || []);
    }
  }

  if (!user) return null;

  return (
    <ProtectedLayout>
      <div className=" bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Profile</h1>
                <p className="text-indigo-100 text-lg">
                  Manage your account settings and preferences
                </p>
              </div>
              {!isEditing ? (
                <Button className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="lg:col-span-1 bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 p-1 shadow-xl">
                    <Avatar className="h-full w-full">
                      {user.profile_pic ? (
                        <img
                          src={user.profile_pic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-2xl bg-gradient-to-r from-indigo-100 to-purple-100">
                          {user.full_name?.charAt(0) || user.name?.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <Button
                        size="sm"
                        className="rounded-full h-8 w-8 p-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                        asChild
                      >
                        <label className="cursor-pointer">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image Preview and Upload */}
                {imagePreview && (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-full mx-auto"
                    />
                    <div className="flex space-x-2 justify-center">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                        onClick={handleImageUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <Badge className="mt-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0">
                    Student ID: {user.student_id}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {userStats.map((stat: any) => (
                    <div key={stat.label} className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-white/50">
                      <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm border-white/20">
                  <TabsTrigger value="personal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Personal Info</TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Activity</TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Personal Information</CardTitle>
                      <CardDescription className="text-gray-600">
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={user.full_name || ""}
                          readOnly
                          disabled
                          className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user.email || ""}
                          readOnly
                          disabled
                          className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          value={user.student_id || ""}
                          readOnly
                          disabled
                          className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={
                            isEditing
                              ? editedUser.phone_number || ""
                              : user.phone_number || ""
                          }
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              phone_number: e.target.value,
                            })
                          }
                          readOnly={!isEditing}
                          placeholder="(555) 123-4567"
                          className={isEditing ? "border-indigo-200 focus:border-indigo-500" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="major">Major</Label>
                        <Input
                          id="major"
                          value={
                            isEditing
                              ? editedUser.major || ""
                              : user.major || ""
                          }
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              major: e.target.value,
                            })
                          }
                          readOnly={!isEditing}
                          placeholder="Computer Science"
                          className={isEditing ? "border-indigo-200 focus:border-indigo-500" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={
                            isEditing ? editedUser.year || "" : user.year || ""
                          }
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              year: e.target.value,
                            })
                          }
                          readOnly={!isEditing}
                          placeholder="Junior"
                          className={isEditing ? "border-indigo-200 focus:border-indigo-500" : ""}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={
                          isEditing ? editedUser.bio || "" : user.bio || ""
                        }
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, bio: e.target.value })
                        }
                        readOnly={!isEditing}
                        placeholder="Tell other students about yourself..."
                        className={isEditing ? "border-indigo-200 focus:border-indigo-500" : ""}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Recent Activity</CardTitle>
                      <CardDescription className="text-gray-600">
                        Your recent actions and interactions on the platform
                      </CardDescription>
                    </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-white/50"
                        >
                          <div className="flex-shrink-0">
                            {activity.activity_type === "message_received" && (
                              <Mail className="h-5 w-5 text-blue-500" />
                            )}
                            {activity.activity_type === "post_liked" && (
                              <GraduationCap className="h-5 w-5 text-green-500" />
                            )}
                            {activity.activity_type === "post_commented" && (
                              <MapPin className="h-5 w-5 text-orange-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {recentActivity.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No recent activity
                        </div>
                      )}
                    </div>
                  </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Account Settings</CardTitle>
                      <CardDescription className="text-gray-600">
                        Manage your account preferences and privacy settings
                      </CardDescription>
                    </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-white/50 rounded-lg">
                        <h4 className="font-medium mb-2 text-gray-900">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Receive email notifications for messages and important
                          updates
                        </p>
                        <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                          Configure Notifications
                        </Button>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-white/50 rounded-lg">
                        <h4 className="font-medium mb-2 text-gray-900">Privacy Settings</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Control who can see your profile and contact you
                        </p>
                        <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                          Manage Privacy
                        </Button>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-white/50 rounded-lg">
                        <h4 className="font-medium mb-2 text-gray-900">Change Password</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Update your account password for security
                        </p>
                        <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
    </ProtectedLayout>
  );
}
