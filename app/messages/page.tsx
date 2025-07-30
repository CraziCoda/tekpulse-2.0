"use client";

import { useState, useEffect, useRef } from "react";
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
const moment = require("moment");
import React from "react";

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

// Helper to parse attachment info from message string
function parseAttachment(message: string) {
  const match = message.match(/^attachment\(([^)]+)\):\s*([^;]+);/i);
  if (!match) return null;
  return {
    type: match[1],
    id: match[2],
  };
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [allUsers, setAllUsers] = useState<any>([]);
  const [conversations, setConversations] = useState<any>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [attachmentPreview, setAttachmentPreview] = useState<any>(null);
  const currentConversationRef = useRef<any>(null);

  // Watch newMessage for attachment pattern and remove the string from input
  useEffect(() => {
    const parsed = parseAttachment(newMessage);
    if (parsed) {
      setAttachmentPreview(parsed);
      setNewMessage(""); // Remove the string from the input
    }
    // Only set preview if pattern is present
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage && !attachmentPreview) {
      alert("Please enter a message");
      return;
    }
    if (!currentConversation) {
      alert("Please select a conversation");
      return;
    }

    // If there's an attachment, prepend it to the message string
    let content = newMessage;
    if (attachmentPreview) {
      content = `attachment(${attachmentPreview.type}): ${attachmentPreview.id};` + (newMessage ? " " + newMessage : "");
    }

    const { error } = await supabase.from("messages").insert({
      chat_room_id: currentConversation.id,
      sender_id: user.id,
      receiver_id: currentConversation.otherUser.id,
      content,
    });

    if (error) {
      console.error(error);
    } else {
      setNewMessage("");
      setAttachmentPreview(null);
    }
  };

  // Enhanced filter: search by name or position
  const filteredStudents = allUsers.filter((s: any) => {
    const term = studentSearch.toLowerCase();
    return s.full_name.toLowerCase().includes(term);
    // ||
    // (s.position && s.position.toLowerCase().includes(term))
  });

  const loadConversations = async () => {
    const { data: chatRooms, error } = await supabase
      .from("chat_members")
      .select(
        `
        chat_room_id,
        chat_room:chat_rooms (
          id,
          created_at,
          last_active,
          chat_members (
            user_id,
            profile:profiles (
              id,
              full_name,
              student_id
            )
          ),
          messages (
            id,
            content,
            created_at,
            sender_id,
            is_read
          ),
          unread_count:unread_message_counts (
            unread_count
          )
        )
      `
      )
      .eq("user_id", user.id)
      .eq("chat_room.unread_message_counts.receiver_id", user.id)
      .order("created_at", {
        ascending: false,
        referencedTable: "chat_rooms.messages",
      })
      .limit(1, { foreignTable: "chat_rooms.messages" });

    if (error) {
      console.error(error);
      return;
    }

    const convos: any = [];

    for (const room of chatRooms) {
      // @ts-ignore
      const otherUser = room?.chat_room?.chat_members?.find(
        (m: any) => m.user_id !== user.id
      );

      // @ts-ignore
      const lastMessage = room?.chat_room?.messages[0];

      // @ts-ignore
      const unreadCount = room?.chat_room?.unread_count[0]?.unread_count;

      const conversation = {
        // @ts-ignore
        id: room?.chat_room?.id as any,
        name: otherUser?.profile?.full_name,
        otherUser: otherUser?.profile,
        lastMessage: lastMessage?.content,
        timestamp: moment(lastMessage?.created_at).fromNow(),
        unread: unreadCount,
        online: false,
      };

      convos.push(conversation);
    }

    setConversations(convos);
  };

  async function startConversation(id: any) {
    const { data: chatRooms, error } = await supabase
      .from("chat_rooms")
      .select(
        `
        id,
        chat_members!inner (
          user_id,
          profile:profiles (
            id,
            full_name
          )
        )
      `
      )
      .in("chat_members.user_id", [user.id, id]);

    if (error) {
      console.error(error);
      return;
    }

    if (chatRooms?.length == 0) {
      const { data: newRoom, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({})
        .select()
        .single();

      if (roomError) {
        console.error(roomError);
        return;
      }

      if (newRoom) {
        await supabase.from("chat_members").insert([
          { chat_room_id: newRoom.id, user_id: user.id },
          { chat_room_id: newRoom.id, user_id: id },
        ]);

        const selectedUser = allUsers.find((u: any) => u.id === id);

        const conversation = {
          name: selectedUser.full_name,
          id: newRoom.id,
          otherUser: selectedUser,
          lastMessage: "",
          timestamp: "",
          unread: 0,
          online: true,
        };

        setCurrentConversation(conversation);
      }
    } else if (chatRooms?.length > 0) {
      const user_profile: any = chatRooms[0].chat_members.find(
        (m) => m.user_id === id
      );

      const conversation = {
        name: user_profile?.profile?.full_name || "",
        id: chatRooms[0].id,
        otherUser: user_profile?.profile,
        lastMessage: "",
        timestamp: "",
        unread: 0,
        online: true,
      };

      setCurrentConversation(conversation);
    }
  }

  async function getMessages() {
    const currentConversation = currentConversationRef.current;

    if (!currentConversation) {
      return;
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_room_id", currentConversation?.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setMessages(messages);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("chat_room_id", currentConversation?.id)
        .eq("receiver_id", user.id);
    }
  }

  async function checkForMessages() {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async () => {
          await getMessages();
          await loadConversations();
        }
      )
      .subscribe();
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
      let formatted = data.map((profile: any) => {
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
      formatted = formatted.filter((_user: any) => _user.id !== user.id);

      setAllUsers(formatted);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
      checkForMessages();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      getMessages();
      currentConversationRef.current = currentConversation;
    }
  }, [currentConversation]);

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
            {conversations.map((conversation: any) => (
              <div
                key={conversation.id}
                onClick={() => setCurrentConversation(conversation)}
                className={cn(
                  "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  currentConversation?.id === conversation.id && "bg-muted"
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
                        {conversation.lastMessage || "No messages yet"}
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
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>
                        {currentConversation?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {currentConversation.online && (
                      <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{currentConversation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.online
                        ? "Active now"
                        : "Last seen 2 hours ago"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message: any) => {
                  const attachment = parseAttachment(message.content);
                  // Remove the attachment string from the message content if present
                  let messageText = message.content;
                  if (attachment) {
                    // Remove the attachment string from the start of the message
                    messageText = messageText.replace(
                      /^attachment\([^)]+\):\s*[^;]+;\s*/i,
                      ""
                    );
                  }
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender_id === user.id
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div>
                        {/* Show attachment above message if exists */}
                        {attachment && (
                          <div className="mb-1">
                            <AttachmentPreview type={attachment.type} id={attachment.id} />
                          </div>
                        )}
                        {/* Show message text if any */}
                        {messageText.trim() && (
                          <div
                            className={cn(
                              "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                              message.sender_id === user.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm">{messageText}</p>
                            <p
                              className={cn(
                                "text-xs mt-1",
                                message.sender_id === user.id
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {moment(message.created_at).fromNow()}
                            </p>
                          </div>
                        )}
                        {/* If only attachment, show time below */}
                        {!messageText.trim() && attachment && (
                          <p
                            className={cn(
                              "text-xs mt-1",
                              message.sender_id === user.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {moment(message.created_at).fromNow()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                {/* Attachment preview above input */}
                {attachmentPreview && (
                  <div className="mb-2 flex items-center">
                    <AttachmentPreview type={attachmentPreview.type} id={attachmentPreview.id} />
                    <button
                      type="button"
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      aria-label="Remove attachment"
                      onClick={() => {
                        setAttachmentPreview(null);
                        setNewMessage("");
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
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
                        (c: any) => c.name === student.full_name
                      );
                      if (existing) {
                        setSelectedConversation(existing.id);
                      } else {
                        // alert(`Start conversation with ${student.full_name}`);
                        startConversation(student.id);
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

// Simple attachment preview component
function AttachmentPreview({ type, id }: { type: string; id: string }) {
  // You can expand this to render images, files, etc. based on type
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-muted border">
      <span className="font-semibold capitalize">{type}</span>
      <span className="text-xs text-muted-foreground">ID: {id}</span>
    </div>
  );
}
