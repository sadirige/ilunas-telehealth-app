import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  API_BASE_URL,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from '../api/client';

const DEFAULT_LIMIT = 10;
const POLL_INTERVAL_MS = 20000;
const MAX_RETRY_DELAY_MS = 30000;
const BASE_RETRY_DELAY_MS = 1500;
const MAX_RETRIES = 5;

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streamStatus, setStreamStatus] = useState('idle');
  const pollRef = useRef(null);
  const eventSourceRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadNotificationCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const data = await getNotifications({ limit: DEFAULT_LIMIT });
      setNotifications(data.results || []);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    refreshUnreadCount();
  }, [refreshNotifications, refreshUnreadCount]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || !window.EventSource) {
      setStreamStatus('polling');
      return undefined;
    }

    let isMounted = true;

    const clearRetry = () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };

    const connect = () => {
      if (!isMounted) {
        return;
      }

      const streamUrl = `${API_BASE_URL}/api/notifications/stream?token=${token}`;
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        retryCountRef.current = 0;
        setStreamStatus('connected');
        setStatus({ type: 'idle', message: '' });
      };

      eventSource.onmessage = () => {
        refreshNotifications();
        refreshUnreadCount();
      };

      eventSource.addEventListener('notification', () => {
        refreshNotifications();
        refreshUnreadCount();
      });

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;

        if (!isMounted) {
          return;
        }

        retryCountRef.current += 1;
        const retryDelay = Math.min(
          BASE_RETRY_DELAY_MS * 2 ** (retryCountRef.current - 1),
          MAX_RETRY_DELAY_MS
        );

        if (retryCountRef.current >= MAX_RETRIES) {
          setStreamStatus('failed');
          setStatus({
            type: 'error',
            message: 'Real-time notifications are unavailable. Please refresh the page to reconnect.'
          });
        } else {
          setStreamStatus('reconnecting');
          setStatus({
            type: 'warning',
            message: `Reconnecting to notifications... (Attempt ${retryCountRef.current}/${MAX_RETRIES})`
          });
        }

        clearRetry();
        retryTimeoutRef.current = setTimeout(connect, retryDelay);
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearRetry();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [refreshNotifications, refreshUnreadCount]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      refreshNotifications();
      refreshUnreadCount();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [refreshNotifications, refreshUnreadCount]);

  const handleMarkRead = async (notificationId) => {
    try {
      const data = await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? data.notification : item))
      );
      refreshUnreadCount();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  return {
    notifications,
    status,
    loading,
    unreadCount,
    hasUnread,
    streamStatus,
    refreshNotifications,
    handleMarkRead,
    handleMarkAllRead
  };
};

export default useNotifications;
