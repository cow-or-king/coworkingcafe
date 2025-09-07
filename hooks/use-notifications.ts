"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useMessaging } from "./use-messaging-socketio";

interface NotificationCounts {
  totalUnread: number;
  messagesDMs: number;
  channels: number;
  channelBreakdown: Record<string, number>;
}

export function useNotifications() {
  const { data: session } = useSession();
  const { socket, isConnected } = useMessaging();

  const [notificationCounts, setNotificationCounts] =
    useState<NotificationCounts>({
      totalUnread: 0,
      messagesDMs: 0,
      channels: 0,
      channelBreakdown: {},
    });

  // Load initial notification counts ONLY ONCE via REST API
  const loadInitialNotificationCounts = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Loading initial notification counts from API (one-time only)
      const response = await fetch("/api/messaging/notifications/counts");
      const data = await response.json();

      if (data.success) {
        setNotificationCounts(data.counts);
        // Initial notification counts loaded successfully
      }
    } catch (error: unknown) {
      // Error loading initial notification counts - handle silently
    }
  }, [session?.user?.id]);

  // Socket.IO real-time notification handling - NO POLLING!
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Setting up real-time Socket.IO notification listeners

    const handleInitialNotificationCounts = (counts: NotificationCounts) => {
      // Initial notification counts received
      setNotificationCounts(counts);
    };

    const handleNotificationIncrement = (data: {
      channelId: string;
      channelType: string;
      increment: number;
    }) => {
      // Notification increment received
      setNotificationCounts((prev) => {
        const newCounts = { ...prev };

        // Update channel-specific counter
        const currentCount = prev.channelBreakdown[data.channelId] || 0;
        newCounts.channelBreakdown = {
          ...prev.channelBreakdown,
          [data.channelId]: Math.max(0, currentCount + data.increment),
        };

        // Update totals based on channel type
        if (data.channelType === "direct" || data.channelType === "dm") {
          newCounts.messagesDMs = Math.max(
            0,
            prev.messagesDMs + data.increment
          );
        } else {
          newCounts.channels = Math.max(0, prev.channels + data.increment);
        }

        newCounts.totalUnread = newCounts.messagesDMs + newCounts.channels;

        // Notification counts updated

        return newCounts;
      });
    };

    const handleNotificationsRead = (data: {
      channelId: string;
      channelType: string;
    }) => {
      // Notifications read event received
      setNotificationCounts((prev) => {
        const channelCount = prev.channelBreakdown[data.channelId] || 0;
        if (channelCount === 0) {
          // No notifications to clear for channel
          return prev;
        }

        const newCounts = { ...prev };

        // Reset channel-specific counter
        newCounts.channelBreakdown = {
          ...prev.channelBreakdown,
          [data.channelId]: 0,
        };

        // Reduce appropriate counter based on channel type
        if (data.channelType === "direct" || data.channelType === "dm") {
          newCounts.messagesDMs = Math.max(0, prev.messagesDMs - channelCount);
        } else {
          newCounts.channels = Math.max(0, prev.channels - channelCount);
        }

        newCounts.totalUnread = newCounts.messagesDMs + newCounts.channels;

        // Notifications cleared successfully

        return newCounts;
      });
    };

    // Add Socket.IO event listeners
    socket.on("initial_notification_counts", handleInitialNotificationCounts);
    socket.on("notification_increment", handleNotificationIncrement);
    socket.on("notifications_read", handleNotificationsRead);

    return () => {
      // Remove event listeners on cleanup
      socket.off(
        "initial_notification_counts",
        handleInitialNotificationCounts
      );
      socket.off("notification_increment", handleNotificationIncrement);
      socket.off("notifications_read", handleNotificationsRead);
    };
  }, [socket, isConnected]);

  // Load initial counts only once when component mounts or session changes
  useEffect(() => {
    if (session?.user?.id) {
      loadInitialNotificationCounts();
    }
  }, [session?.user?.id, loadInitialNotificationCounts]);

  // Mark channel as read function with real-time Socket.IO updates
  const markChannelAsRead = useCallback(
    (channelId: string, channelType?: string) => {
      // markChannelAsRead called

      if (!session?.user?.id) {
        // Cannot mark channel as read: no user session
        return;
      }

      // Optimistic UI update - immediately clear notifications for better UX
      setNotificationCounts((prev) => {
        const channelCount = prev.channelBreakdown[channelId] || 0;
        if (channelCount === 0) {
          // No unread messages in channel
          return prev;
        }

        const newCounts = { ...prev };
        newCounts.channelBreakdown = {
          ...prev.channelBreakdown,
          [channelId]: 0,
        };

        // Reduce appropriate counter
        if (channelType === "direct" || channelType === "dm") {
          newCounts.messagesDMs = Math.max(0, prev.messagesDMs - channelCount);
        } else {
          newCounts.channels = Math.max(0, prev.channels - channelCount);
        }

        newCounts.totalUnread = newCounts.messagesDMs + newCounts.channels;

        // Optimistic notification update

        return newCounts;
      });

      // The actual message read tracking is handled by the ChatWindow component
      // which calls markMessagesAsRead via Socket.IO when messages are viewed
    },
    [session?.user?.id]
  );

  // Removed loadNotificationCounts from return since we no longer need manual refreshing
  return {
    notificationCounts,
    markChannelAsRead,
  };
}
