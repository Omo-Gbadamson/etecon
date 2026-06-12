import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { useConversations, useMessages } from "../../hooks/useMessages";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Avatar, EmptyState, Spinner } from "../../components/shared";
import { formatRelative } from "../../utils";
import { cn } from "../../utils/cn";

function ConversationList({ conversations, activeId, userId }) {
  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {conversations.map(conv => {
        const otherName = userId === conv.teacherId ? conv.schoolName : conv.teacherName;
        const otherPhoto = userId === conv.teacherId ? conv.schoolLogoURL : conv.teacherPhotoURL;
        return (
          <Link key={conv.id} to={`/messages/${conv.id}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition",
              activeId === conv.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50"
            )}>
            <Avatar src={otherPhoto} name={otherName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-900 truncate">{otherName || "Conversation"}</p>
              <p className="text-xs text-slate-500 truncate">{conv.lastMessage || "No messages yet"}</p>
            </div>
            {conv.lastMessageAt && (
              <span className="text-xs text-slate-400 flex-shrink-0">{formatRelative(conv.lastMessageAt)}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function ChatBubble({ msg, isOwn }) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
        isOwn
          ? "bg-indigo-700 text-white rounded-br-sm"
          : "bg-white border border-slate-100 text-slate-900 rounded-bl-sm shadow-sm"
      )}>
        <p>{msg.text}</p>
        <p className={cn("text-xs mt-1", isOwn ? "text-indigo-300" : "text-slate-400")}>
          {formatRelative(msg.sentAt)}
        </p>
      </div>
    </div>
  );
}

function ChatWindow({ convId }) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(convId);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const t = text;
    setText("");
    await sendMessage(t);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No messages yet. Send the first one!</p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <ChatBubble key={msg.id} msg={msg} isOwn={msg.senderId === user?.uid} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
        <input
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!text.trim()}
          className="p-2.5 bg-indigo-700 text-white rounded-xl hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default function MessagesPage() {
  const { convId } = useParams();
  const { user } = useAuth();
  const { conversations, loading } = useConversations();

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
        {/* Sidebar */}
        <div className={cn(
          "w-80 border-r border-slate-100 flex flex-col flex-shrink-0",
          convId ? "hidden md:flex" : "flex w-full md:w-80"
        )}>
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : conversations.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No conversations"
                description="Conversations with schools or teachers will appear here." />
            ) : (
              <ConversationList conversations={conversations} activeId={convId} userId={user?.uid} />
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={cn("flex-1 flex flex-col", !convId && "hidden md:flex")}>
          {convId ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <Link to="/messages" className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <p className="font-semibold text-slate-900">Conversation</p>
              </div>
              <ChatWindow convId={convId} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
