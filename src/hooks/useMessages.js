import { useState, useEffect } from "react";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage as sendMsg,
  markMessagesRead,
  getOrCreateConversation,
} from "../firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { conversations, loading };
}

export function useMessages(convId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!convId) return;
    const unsub = subscribeToMessages(convId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      if (user) markMessagesRead(convId, user.uid);
    });
    return unsub;
  }, [convId, user]);

  const sendMessage = async (text) => {
    if (!user || !convId || !text.trim()) return;
    await sendMsg(convId, user.uid, text);
  };

  return { messages, loading, sendMessage };
}

export async function startConversation(teacherId, schoolId, jobId) {
  return getOrCreateConversation(teacherId, schoolId, jobId);
}
