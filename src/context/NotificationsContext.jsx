import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToNotifications, markNotificationRead } from "../firebase/firestore";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext({ notifications: [], unreadCount: 0 });

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    const unsub = subscribeToNotifications(user.uid, setNotifications);
    return unsub;
  }, [user]);

  const markRead = (id) => markNotificationRead(id);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
