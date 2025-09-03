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
  Search,
  Plus,
  MapPin,
  Clock,
  User,
  Tag,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import moment from "moment";

export default function LostFoundPage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<"lost" | "found">("lost");
  const [isReporting, setIsReporting] = useState(false);
  const [createReportError, setCreateReportError] = useState("");
  const [reports, setReports] = useState<any>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();

  const reportsFiltered = reports.filter((report: any) =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lostItems = reportsFiltered.filter(
    (report: any) => report.status === "lost"
  );
  const foundItems = reportsFiltered.filter(
    (report: any) => report.status === "found"
  );

  const [reportItem, setReportItem] = useState<any>({
    title: "",
    description: "",
    location: "",
    category: "",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      bag: "bg-blue-100 text-blue-800",
      electronics: "bg-purple-100 text-purple-800",
      personal: "bg-green-100 text-green-800",
      books: "bg-orange-100 text-orange-800",
      accessories: "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  async function getUserProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user?.id)
        .single();

      if (data) {
        setUser(data);
      }
    }
  }

  const handleReport = async () => {
    if (reportItem.title.trim() === "") {
      setCreateReportError("Title is required");
      return;
    }

    if (reportItem.description.trim() === "") {
      setCreateReportError("Description is required");
      return;
    }

    if (reportItem.location.trim() === "") {
      setCreateReportError("Location is required");
      return;
    }
    if (reportItem.category.trim() === "") {
      setCreateReportError("Category is required");
      return;
    }
    setIsReporting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    let publicUrl: null | string = null;

    if (selectedImage) {
      const fileExt = selectedImage?.name.split(".").pop();
      const { data: imageData, error: uploadError } = await supabase.storage
        .from("lost-found")
        .upload(`${user.id}/${Date.now()}.${fileExt}`, selectedImage as File);

      if (uploadError) {
        setIsReporting(false);
        setCreateReportError(uploadError.message);
        return;
      }

      let data = supabase.storage
        .from("lost-found")
        .getPublicUrl(imageData.path);

      publicUrl = data.data.publicUrl;
    }

    const { error } = await supabase.from("lost_and_founds").insert([
      {
        title: reportItem.title,
        description: reportItem.description,
        location: reportItem.location,
        category: reportItem.category,
        user_id: user?.id,
        status: reportType,
        image_url: publicUrl,
      },
    ]);

    if (error) {
      setCreateReportError(error.message);
      setIsReporting(false);
      return;
    }

    setCreateReportError("");
    setIsReporting(false);
    setReportItem({ title: "", description: "", location: "", category: "" });
    removeImage();
    setIsReportDialogOpen(false);
    getReports();
  };

  const handleResolved = async (id: any) => {
    const { error } = await supabase
      .from("lost_and_founds")
      .update({
        is_resolved: true,
      })
      .eq("id", id);

    getReports();
    if (error) {
      console.error(error);
    }
  };

  const handleDeleteReport = async (reportId: any) => {
    const { error } = await supabase
      .from("lost_and_founds")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error(error);
    } else {
      getReports();
    }
  };

  const getReports = async () => {
    const { data, error } = await supabase
      .from("lost_and_founds")
      .select(
        `
        *,
        author:profiles (
          id,
          full_name,
          profile_pic
        ) 
        `
      )
      .eq("is_resolved", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setReports(data);
    }
  };
  const ItemCard = ({ item }: { item: any }) => (
    <Card
      className={`border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
        user?.is_admin ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      <div className="relative">
        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            className={
              item.status === "lost"
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg font-medium"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg font-medium"
            }
          >
            {item.status === "lost" ? "Lost" : "Found"}
          </Badge>
        </div>

        {/* Item Image */}
        {item.image_url ? (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-muted/50 to-muted rounded-t-lg flex items-center justify-center">
            <Tag className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-xl leading-tight line-clamp-2">
              {item.title}
            </h3>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-sm">
              {item.category}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-md">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-foreground">{item.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-md">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <span className="text-muted-foreground font-medium">
              {moment(item.created_at).fromNow()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-md">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-muted-foreground font-medium">
              {item.author.id === user?.id ? "You" : item.author.full_name}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            className={`w-full font-medium ${
              item.author.id === user?.id
                ? "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white border-0 shadow-lg"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg"
            }`}
            onClick={(e) => {
              if (item.author.id === user?.id) {
                handleResolved(item.id);
                e.currentTarget.disabled = true;
              } else {
                router.push(
                  `/messages?id=${item.id}&user=${item.author.id}&type=lost-found&name=${item.title}&description=${item.description}`
                );
              }
            }}
          >
            {item.author.id === user?.id
              ? "Mark as Resolved"
              : "Contact Reporter"}
          </Button>

          {user?.is_admin && item.author.id !== user?.id && (
            <Button
              className="w-full font-medium"
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteReport(item.id)}
            >
              Admin: Remove Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    getUserProfile();
    getReports();
  }, []);

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-8 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4 opacity-30">
              <Search className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Lost & Found 🔍
              </h1>
              <p className="text-orange-100 text-lg">
                Help reunite lost items with their owners
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Dialog
              open={isReportDialogOpen}
              onOpenChange={setIsReportDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Report an Item
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Help others by reporting lost or found items on campus.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex space-x-2">
                    <Button
                      className={
                        reportType === "lost"
                          ? "flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg"
                          : "flex-1 border-2 border-red-200 hover:bg-red-50"
                      }
                      onClick={() => setReportType("lost")}
                    >
                      Lost Item
                    </Button>
                    <Button
                      className={
                        reportType === "found"
                          ? "flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg"
                          : "flex-1 border-2 border-green-200 hover:bg-green-50"
                      }
                      onClick={() => setReportType("found")}
                    >
                      Found Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Item Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Blue Backpack"
                      value={reportItem.title}
                      onChange={(e) =>
                        setReportItem({ ...reportItem, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed description of the item"
                      rows={3}
                      value={reportItem.description}
                      onChange={(e) =>
                        setReportItem({
                          ...reportItem,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Library - 2nd Floor"
                      value={reportItem.location}
                      onChange={(e) =>
                        setReportItem({
                          ...reportItem,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., electronics, bag, books"
                      value={reportItem.category}
                      onChange={(e) =>
                        setReportItem({
                          ...reportItem,
                          category: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Item Photo (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <label className="cursor-pointer">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Add Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      </Button>
                      {selectedImage && (
                        <span className="text-sm text-muted-foreground">
                          {selectedImage.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {createReportError && (
                    <p className="text-red-500 text-sm">{createReportError}</p>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-lg"
                    onClick={handleReport}
                    disabled={isReporting}
                  >
                    {isReporting
                      ? "Reporting..."
                      : `Report ${
                          reportType === "lost" ? "Lost" : "Found"
                        } Item`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-orange-100 focus:border-orange-300 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <Tabs defaultValue="lost" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger
                value="lost"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                Lost Items ({lostItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="found"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
              >
                Found Items ({foundItems.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="lost" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lostItems.map((item: any) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
              {lostItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 mx-auto max-w-md">
                    <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">
                      No lost items found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="found" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foundItems.map((item: any) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
              {foundItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 mx-auto max-w-md">
                    <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">No found items</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedLayout>
  );
}
