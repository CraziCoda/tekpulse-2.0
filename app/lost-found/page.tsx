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
import { Search, Plus, MapPin, Clock, User, Tag } from "lucide-react";
import supabase from "@/lib/supabase";
import moment from "moment";

const lostItems = [
  {
    id: 1,
    title: "Blue Backpack",
    description: "Navy blue Jansport backpack with laptop compartment",
    location: "Library - 2nd Floor",
    dateReported: "2024-03-10",
    category: "bag",
    reportedBy: "John Smith",
    status: "lost",
  },
  {
    id: 2,
    title: "iPhone 14",
    description: "Black iPhone 14 with a clear case",
    location: "Student Center",
    dateReported: "2024-03-12",
    category: "electronics",
    reportedBy: "Sarah Johnson",
    status: "lost",
  },
  {
    id: 3,
    title: "Red Water Bottle",
    description: "Stainless steel red water bottle with university logo",
    location: "Gym - Main Hall",
    dateReported: "2024-03-08",
    category: "personal",
    reportedBy: "Mike Davis",
    status: "lost",
  },
];

const foundItems = [
  {
    id: 4,
    title: "Textbook - Physics 101",
    description: "Physics textbook with handwritten notes inside",
    location: "Physics Building - Room 203",
    dateReported: "2024-03-11",
    category: "books",
    reportedBy: "Emma Wilson",
    status: "found",
  },
  {
    id: 5,
    title: "Silver Watch",
    description: "Silver digital watch with black strap",
    location: "Cafeteria",
    dateReported: "2024-03-09",
    category: "accessories",
    reportedBy: "Alex Brown",
    status: "found",
  },
];

export default function LostFoundPage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<"lost" | "found">("lost");
  const [isReporting, setIsReporting] = useState(false);
  const [createReportError, setCreateReportError] = useState("");
  const [reports, setReports] = useState<any>([]);

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

    const { error } = await supabase.from("lost_and_founds").insert([
      {
        title: reportItem.title,
        description: reportItem.description,
        location: reportItem.location,
        category: reportItem.category,
        user_id: user?.id,
        status: reportType,
      },
    ]);

    setIsReportDialogOpen(false);
    if (error) {
      setCreateReportError(error.message);
      return;
    } else {
      setCreateReportError("");
    }
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

  const getReports = async () => {
    const { data, error } = await supabase
      .from("lost_and_founds")
      .select(
        `
        *,
        author:profiles (
          id,
          full_name
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <Badge className={getCategoryColor(item.category)}>
            {item.category}
          </Badge>
        </div>
        <p className="text-muted-foreground mb-3">{item.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{moment(item.created_at).fromNow()}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span>Reported by {item.author.full_name}</span>
          </div>
        </div>
        <Button
          className="w-full mt-4"
          variant="outline"
          onClick={(e) => {
            if (item.author.id === user?.id) {
              handleResolved(item.id);
              e.currentTarget.disabled = true;
            }
          }}
        >
          {item.author.id === user?.id
            ? "Mark as Resolved"
            : "Contact Reporter"}
        </Button>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    getUserProfile();
    getReports();
  }, []);

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
            <p className="text-muted-foreground">
              Help reunite lost items with their owners
            </p>
          </div>
          <Dialog
            open={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Report an Item</DialogTitle>
                <DialogDescription>
                  Help others by reporting lost or found items on campus.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex space-x-2">
                  <Button
                    variant={reportType === "lost" ? "default" : "outline"}
                    onClick={() => setReportType("lost")}
                    className="flex-1"
                  >
                    Lost Item
                  </Button>
                  <Button
                    variant={reportType === "found" ? "default" : "outline"}
                    onClick={() => setReportType("found")}
                    className="flex-1"
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
                      setReportItem({ ...reportItem, location: e.target.value })
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
                {createReportError && (
                  <p className="text-red-500">{createReportError}</p>
                )}
                <Button
                  className="w-full"
                  onClick={handleReport}
                  disabled={isReporting}
                >
                  Report {reportType === "lost" ? "Lost" : "Found"} Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">
              Lost Items ({lostItems.length})
            </TabsTrigger>
            <TabsTrigger value="found">
              Found Items ({foundItems.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="lost" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lostItems.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="found" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foundItems.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  );
}
