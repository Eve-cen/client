import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { useChat } from "../context/ChatContext";
import VencomeLoader from "../components/Loader";

const ChatPage = () => {
  const { conversations, setConversations, loaded, setLoaded } = useChat();
  const [loading, setLoading] = useState(!loaded);
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch if we haven't loaded yet
    if (!loaded) {
      const fetchConversations = async () => {
        try {
          const data = await apiFetch({
            endpoint: "/chat/conversations",
            method: "GET",
            credentials: "include",
          });
          setConversations(data);
          setLoaded(true);
        } catch (err) {
          console.error("Failed to load conversations", err);
        } finally {
          setLoading(false);
        }
      };

      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [loaded, setConversations, setLoaded]);

  if (loading) return <VencomeLoader />;
  if (!conversations.length) return <p>No conversations yet.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Conversations</h1>
      <div className="flex flex-col gap-3">
        {conversations.map((conv) => (
          <div
            key={conv._id}
            onClick={() => navigate(`/chat/${conv._id}`)}
            className="cursor-pointer p-3 rounded-lg hover:bg-gray-100 flex justify-between items-center border"
          >
            <div>
              <p className="font-semibold">
                {conv.host.displayName === conv.guest.displayName
                  ? "Unknown User"
                  : conv.host.displayName === currentUser?.displayName
                  ? conv.guest.displayName
                  : conv.host.displayName}
              </p>
              <p className="text-gray-500 text-sm truncate max-w-xs">
                {conv.lastMessage || "No messages yet"}
              </p>
            </div>
            <span className="text-gray-400 text-xs">
              {new Date(conv.lastMessageAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatPage;
