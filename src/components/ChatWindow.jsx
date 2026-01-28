import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import socket from "../utils/socket";
import { toast } from "react-toastify";

export default function ChatWindow() {
  const { conversationId } = useParams();
  const [text, setText] = useState("");
  const currentUser = localStorage.getItem("currentUser");
  let user = null;

  if (currentUser) {
    try {
      user = JSON.parse(currentUser);
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
    }
  } else {
    console.warn("No currentUser in localStorage");
  }

  const { data: messages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      apiFetch({
        endpoint: `/chat/${conversationId}`,
      }),
    enabled: !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: (text) =>
      apiFetch({
        endpoint: `/chat/${conversationId}`,
        method: "POST",
        body: { text },
      }),
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
    onSuccess: () => {},
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMessage.mutate(text);
    setText("");
  };

  useEffect(() => {
    socket.emit("join_conversation", conversationId);

    socket.on("new_message", (msg) => {
      queryClient.invalidateQueries(["messages", conversationId]);
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));

    return () => socket.off();
  }, []);

  return (
    <div className="flex flex-col h-[90vh] bg-gray-100">
      <div className="overflow-y-auto p-4 space-y-3">
        {messages?.map((msg) => {
          const isMine = msg.sender._id === user._id;

          return (
            <div
              key={msg._id}
              className={`flex ${
                isMine ? "justify-end" : "justify-start"
              } mb-2`}
            >
              <div
                className={`
          relative
          max-w-[60%] 
          px-4 py-2 
          rounded-2xl
          break-words
          ${isMine ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}
        `}
              >
                {/* Message text */}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Timestamp and read indicator */}
                <div className="flex items-center justify-end mt-1 text-xs opacity-70 space-x-1">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMine && msg.read && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M2 12l9 9L22 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="w-full fixed bottom-0 border-t p-3 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.emit("typing", { conversationId });
          }}
          onBlur={() => socket.emit("stop_typing", { conversationId })}
          placeholder="Type a message…"
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button className="bg-blue-600 text-white px-4 rounded-lg">Send</button>
      </form>
    </div>
  );
}
