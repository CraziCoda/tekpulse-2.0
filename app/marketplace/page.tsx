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
import { Search, Plus, DollarSign, User, Clock, Tag, Image as ImageIcon, X } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();

  const [listingItem, setListingItem] = useState<any>({
    title: "",
    price: 0,
    description: "",
    category: "other",
    condition: "new",
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    let publicUrl: null | string = null;

    if (selectedImage) {
      const fileExt = selectedImage?.name.split(".").pop();
      const { data: imageData, error: uploadError } =
        await supabase.storage
          .from("market")
          .upload(
            `${user.id}/${Date.now()}.${fileExt}`,
            selectedImage as File
          );

      if (uploadError) {
        setIsCreatingListing(false);
        setCreatingListingError(uploadError.message);
        return;
      }

      let data = supabase.storage
        .from("market")
        .getPublicUrl(imageData.path);

      publicUrl = data.data.publicUrl;
    }

    const { error } = await supabase.from("product_listings").insert([
      {
        title: listingItem.title,
        description: listingItem.description,
        price: listingItem.price,
        category: listingItem.category,
        condition: listingItem.condition,
        user_id: user?.id,
        image_url: publicUrl,
      },
    ]);

    if (error) {
      setIsCreatingListing(false);
      setCreatingListingError(error.message);
      return;
    }
    setIsCreatingListing(false);
    setListingItem({ title: "", price: 0, description: "", category: "other", condition: "new" });
    removeImage();
    setIsListingDialogOpen(false);
    setCreatingListingError("");
    getProductListings();
  };

  const handleDeleteListing = async (listingId: any) => {
    const { error } = await supabase
      .from("product_listings")
      .delete()
      .eq("id", listingId);

    if (error) {
      console.error(error);
    } else {
      getProductListings();
    }
  };

  const getProductListings = async () => {
    const { data, error } = await supabase
      .from("product_listings")
      .select(
        `*,
        author:profiles (
          id,
          full_name,
          profile_pic
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Marketplace</h1>
                <p className="text-teal-100 text-lg">
                  Buy and sell items with fellow students
                </p>
              </div>
              <Dialog
                open={isListingDialogOpen}
                onOpenChange={setIsListingDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-white text-teal-600 hover:bg-teal-50 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    List Item
                  </Button>
                </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-teal-50 border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">List an Item</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a listing to sell your item to other students.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Calculus Textbook - 8th Edition"
                    className="border-teal-200 focus:border-teal-500"
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
                    className="border-teal-200 focus:border-teal-500"
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
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
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
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
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
                    className="min-h-[100px] border-teal-200 focus:border-teal-500"
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
                {creatingListingError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    {creatingListingError}
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsListingDialogOpen(false)}
                    className="border-teal-200 text-teal-600 hover:bg-teal-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddListing}
                    disabled={isCreatingListing}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg"
                  >
                    {isCreatingListing ? "Creating..." : "Create Listing"}
                  </Button>
                </div>
              </div>
            </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-teal-200 focus:border-teal-500 bg-white/50"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px] border-teal-200 focus:border-teal-500 bg-white/50">
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
          </div>

          {/* Listings Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 max-w-md mx-auto">
                <DollarSign className="mx-auto h-16 w-16 text-teal-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== "all"
                    ? "No items found"
                    : "No listings yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filters"
                    : "Be the first to list an item for sale!"}
                </p>
                <Button
                  onClick={() => setIsListingDialogOpen(true)}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List First Item
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item: any) => (
                <Card key={item.id} className="group hover:shadow-2xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/20 hover:scale-105">
                  <div className="relative">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-t-lg flex items-center justify-center">
                        <DollarSign className="h-16 w-16 text-teal-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className={`${getCategoryColor(item.category)} shadow-lg`}>
                        {item.category}
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg font-bold">
                        ₵{item.price}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </CardDescription>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${getConditionColor(item.condition)} shadow-sm`}>
                        {item.condition}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {moment(item.created_at).fromNow()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center ring-2 ring-white shadow-lg">
                          {item.author?.profile_pic ? (
                            <img
                              src={item.author.profile_pic}
                              alt={item.author.full_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {item?.author?.id === user?.id ? 'You' : item?.author?.full_name || "Anonymous"}
                        </span>
                      </div>
                      {user?.id === item.user_id ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteListing(item.id)}
                          className="shadow-lg"
                        >
                          Delete
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            router.push(
                              `/messages?id=${item.id}&user=${item.author.id}&type=marketplace&name=${item.title}&description=${item.description}`
                            );
                          }}
                          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg"
                        >
                          Contact
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
