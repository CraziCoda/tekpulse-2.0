"use client";

import { useState, useEffect } from "react";
import {
  Home,
  MessageSquare,
  ShoppingBag,
  Search,
  User,
  Map,
  Settings,
  GraduationCap,
  LogOut,
  Shield,
  Users,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import supabase from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/posts", icon: Users, label: "Campus Feed" },
  { href: "/communities", icon: Building2, label: "Communities" },
  { href: "/lost-found", icon: Search, label: "Lost & Found" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { href: "/campus-map", icon: Map, label: "Campus Map" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    getUserProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      return;
    }

    router.push("/auth/login");
  };

  if (!user) return null;

  return (
    <div className="hidden md:flex flex-col w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 h-screen shadow-2xl">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">TekPulse</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50 hover:transform hover:scale-105"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {user.is_admin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group mt-2 border border-red-500/30",
                pathname === "/admin"
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg transform scale-105"
                  : "text-red-300 hover:text-white hover:bg-red-500/20 hover:transform hover:scale-105"
              )}
            >
              <Shield className={cn(
                "h-5 w-5 transition-all duration-200",
                pathname === "/admin" ? "text-white" : "text-red-400 group-hover:text-white"
              )} />
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-slate-800/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center ring-2 ring-slate-600 shadow-lg">
            {user.profile_pic ? (
              <img
                src={user.profile_pic}
                alt={user.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold">{user.full_name?.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
            <p className="text-xs text-slate-400 truncate">
              {user.student_id}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg transition-all duration-200 hover:transform hover:scale-105"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
