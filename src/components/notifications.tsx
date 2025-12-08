'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import type { Notification } from "@/lib/types";
import { useState, useEffect, useRef, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "@/firebase";
import { getNotifications } from "@/lib/api-frontend-services";

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const fetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => {
    return user?.id || user?.uid || null;
  }, [user?.id, user?.uid]);

  // Only fetch when popover opens or user changes
  useEffect(() => {
    const currentUserId = userId ? String(userId) : null;
    
    // If no user, clear notifications
    if (!currentUserId) {
      if (lastUserIdRef.current !== null) {
        setNotifications([]);
        lastUserIdRef.current = null;
        hasFetchedRef.current = false;
      }
      setLoading(false);
      return;
    }

    // Only fetch if:
    // 1. User ID changed (new user logged in)
    // 2. Popover is opened and we haven't fetched yet for this user
    const shouldFetch = 
      (lastUserIdRef.current !== currentUserId) ||
      (isOpen && !hasFetchedRef.current && lastUserIdRef.current === currentUserId);

    if (!shouldFetch || fetchingRef.current) {
      return;
    }

    // Fetch notifications
    async function fetchNotifications() {
      fetchingRef.current = true;
      lastUserIdRef.current = currentUserId;
      
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data || []);
        hasFetchedRef.current = true;
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    }

    fetchNotifications();
  }, [userId, isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
            )}
            <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <Button variant="link" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>Mark all as read</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
                {loading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : notifications.length > 0 ? notifications.map(notification => (
                    <div
                        key={notification.id}
                        className="flex items-start gap-3 p-4 hover:bg-secondary cursor-pointer"
                        onClick={() => handleMarkAsRead(notification.id)}
                    >
                        {!notification.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        <div className={`space-y-1 flex-1 ${notification.read ? 'pl-5' : ''}`}>
                            <p className="text-sm font-medium leading-none">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground">{format(parseISO(notification.date), "PPP")}</p>
                        </div>
                    </div>
                )) : (
                    <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
                )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
