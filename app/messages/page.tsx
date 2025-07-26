"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Plus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import supabase from "@/lib/supabase";

const conversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    lastMessage: "Hey, did you find your textbook?",
    timestamp: "2 min ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Mike Davis",
    lastMessage: "Thanks for helping with the assignment!",
    timestamp: "1 hour ago",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Emma Wilson",
    lastMessage: "See you at the study group tomorrow",
    timestamp: "3 hours ago",
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: "Alex Brown",
    lastMessage: "The project deadline is next week",
    timestamp: "1 day ago",
    unread: 0,
    online: false,
  },
];

const messages = [
  {
    id: 1,
    senderId: 2,
    content:
      "Hey! I saw your post about the lost textbook. Is it still missing?",
    timestamp: "10:30 AM",
    isCurrentUser: false,
  },
  {
    id: 2,
    senderId: 1,
    content: "Yes, I still haven't found it. It's the Physics 101 textbook.",
    timestamp: "10:32 AM",
    isCurrentUser: true,
  },
  {
    id: 3,
    senderId: 2,
    content: "I think I saw one in the library yesterday. Want me to check?",
    timestamp: "10:33 AM",
    isCurrentUser: false,
  },
  {
    id: 4,
    senderId: 1,
    content: "That would be amazing! Thank you so much 🙏",
    timestamp: "10:34 AM",
    isCurrentUser: true,
  },
  {
    id: 5,
    senderId: 2,
    content: "No problem! I'll head there after my class and let you know.",
    timestamp: "10:35 AM",
    isCurrentUser: false,
  },
];

const students = [
  { id: 101, name: "Alice Carter", position: "CS President" },
  { id: 102, name: "Brian Lee", position: "Business Rep" },
  { id: 103, name: "Chloe Kim", position: null },
  { id: 104, name: "David Smith", position: "Math Secretary" },
  // Add more students as needed
];

// Utility: map position to bg color
const positionBg = (position: string | null) => {
  if (!position) return "";
  if (position.toLowerCase().includes("president"))
    return "bg-blue-100 text-blue-800";
  if (position.toLowerCase().includes("rep"))
    return "bg-green-100 text-green-800";
  if (position.toLowerCase().includes("secretary"))
    return "bg-yellow-100 text-yellow-800";
  return "bg-muted text-muted-foreground";
};

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [allUsers, setAllUsers] = useState<any>([]);

  const selectedUser = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, this would send the message to the server
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  // Enhanced filter: search by name or position
  const filteredStudents = allUsers.filter((s: any) => {
    const term = studentSearch.toLowerCase();
    return s.full_name.toLowerCase().includes(term);
    // ||
    // (s.position && s.position.toLowerCase().includes(term))
  });

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

  const getUsers = async () => {
    const { data, error } = await supabase.from("profiles").select(`
    id,
    full_name,
    community_members (
      member_positions (
        position:position_id (
          title
        )
      )
    )
  `);

    if (error) {
      console.error(error);
    } else {
      const formatted = data.map((profile: any) => {
        const positions: any[] = [];

        profile.community_members?.forEach((member: any) => {
          member.member_positions?.forEach((mp: any) => {
            if (mp.position?.title && !positions.includes(mp.position.title)) {
              positions.push(mp.position.title);
            }
          });
        });

        return {
          id: profile.id,
          full_name: profile.full_name,
          positions: positions.slice(0, 3),
        };
      });

      setAllUsers(formatted);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  return (
    <ProtectedLayout>
      <div className="h-full flex">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  getUsers();
                  setShowStudentModal(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={cn(
                  "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedConversation === conversation.id && "bg-muted"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>
                        {conversation.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {conversation.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <Badge
                          variant="default"
                          className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>
                        {selectedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedUser.online && (
                      <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.online
                        ? "Active now"
                        : "Last seen 2 hours ago"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        message.isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          message.isCurrentUser
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Student Modal */}
        <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Conversation</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      setShowStudentModal(false);
                      const existing = conversations.find(
                        (c) => c.name === student.full_name
                      );
                      if (existing) {
                        setSelectedConversation(existing.id);
                      } else {
                        alert(`Start conversation with ${student.full_name}`);
                      }
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {student.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{student.full_name}</span>
                    {/* {student.position && (
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded font-semibold ${positionBg(
                          student.position
                        )}`}
                      >
                        {student.position}
                      </span>
                    )} */}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground p-2">
                  No students found.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedLayout>
  );
}
