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
import { Search, Plus, DollarSign, User, Clock, Tag } from "lucide-react";
import supabase from "@/lib/supabase";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isListingDialogOpen, setIsListingDialogOpen] = useState(false);

  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [creatingListingError, setCreatingListingError] = useState("");
  const [listings, setListings] = useState<any>([]);

  const router = useRouter();

  const [listingItem, setListingItem] = useState<any>({
    title: "",
    price: 0,
    description: "",
    category: "other",
    condition: "new",
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "books", label: "Books" },
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "supplies", label: "Supplies" },
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      books: "bg-blue-100 text-blue-800",
      electronics: "bg-purple-100 text-purple-800",
      furniture: "bg-green-100 text-green-800",
      supplies: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getConditionColor = (condition: string) => {
    const colors: { [key: string]: string } = {
      New: "bg-green-100 text-green-800",
      "Like New": "bg-emerald-100 text-emerald-800",
      Good: "bg-yellow-100 text-yellow-800",
      Used: "bg-orange-100 text-orange-800",
    };
    return colors[condition] || "bg-gray-100 text-gray-800";
  };

  const filteredItems = listings.filter((item: any) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleAddListing = async () => {
    if (listingItem.title.trim() === "") {
      setCreatingListingError("Title is required");
      return;
    }

    if (listingItem.description.trim() === "") {
      setCreatingListingError("Description is required");
      return;
    }

    if (listingItem.price <= 0) {
      setCreatingListingError("Price must be greater than 0");
      return;
    }

    if (listingItem.category.trim() === "") {
      setCreatingListingError("Category is required");
      return;
    }

    setIsCreatingListing(true);

    const { error } = await supabase.from("product_listings").insert([
      {
        title: listingItem.title,
        description: listingItem.description,
        price: listingItem.price,
        category: listingItem.category,
        condition: listingItem.condition,
        user_id: user?.id,
      },
    ]);

    if (error) {
      setIsCreatingListing(false);
      setCreatingListingError(error.message);
      return;
    }
    setIsCreatingListing(false);
    setIsListingDialogOpen(false);
    setCreatingListingError("");
    getProductListings();
  };

  const handleDeleteListing = async (listingId: any) => {};

  const getProductListings = async () => {
    const { data, error } = await supabase
      .from("product_listings")
      .select(
        `*,
        author:profiles (
          id,
          full_name
        )`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setListings(data);
      console.log(data);
    }
  };

  useEffect(() => {
    getUserProfile();
    getProductListings();
  }, []);

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
              Buy and sell items with fellow students
            </p>
          </div>
          <Dialog
            open={isListingDialogOpen}
            onOpenChange={setIsListingDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                List Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>List an Item</DialogTitle>
                <DialogDescription>
                  Create a listing to sell your item to other students.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Calculus Textbook - 8th Edition"
                    value={listingItem.title}
                    onChange={(e) => {
                      setListingItem({
                        ...listingItem,
                        title: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₵)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="45"
                    value={listingItem.price}
                    onChange={(e) =>
                      setListingItem({
                        ...listingItem,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    defaultValue={listingItem.category}
                    value={listingItem.category}
                    onValueChange={(value) =>
                      setListingItem({ ...listingItem, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    defaultValue={listingItem.condition}
                    value={listingItem.condition}
                    onValueChange={(value) =>
                      setListingItem({ ...listingItem, condition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like-new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of the item"
                    rows={4}
                    value={listingItem.description}
                    onChange={(e) =>
                      setListingItem({
                        ...listingItem,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                {creatingListingError && (
                  <p className="text-red-500">{creatingListingError}</p>
                )}
                <Button
                  className="w-full"
                  onClick={handleAddListing}
                  disabled={isCreatingListing}
                >
                  Create Listing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      <Badge className={getConditionColor(item.condition)}>
                        {item.condition}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-2xl font-bold text-primary">
                      {/* <DollarSign className="h-5 w-5" /> */}₵{item.price}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-2">
                  {item.description}
                </CardDescription>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>
                      Sold by{" "}
                      {item?.author?.id === user?.id
                        ? "You"
                        : item?.author?.full_name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Posted {moment(item.created_at).fromNow()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {item?.author?.id === user?.id ? (
                    <Button
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => handleDeleteListing(item.id)}
                    >
                      Remove Listing
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        router.push(
                          `/messages?id=${item.id}&user=${item.author.id}&type=marketplace&name=${item.title}&description=${item.description}`
                        );
                      }}
                    >
                      Contact Seller
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
