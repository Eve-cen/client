import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import socket from "../utils/socket";

export default function ChatWindow({ conversationId }) {
  const [text, setText] = useState("");

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
        {messages?.map((msg) => (
          <div
            key={msg._id}
            className={`max-w-[70%] p-3 rounded-xl ${
              msg.sender._id === "me"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
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
