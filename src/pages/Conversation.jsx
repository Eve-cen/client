// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { apiFetch } from "../utils/api";
// import socket from "../utils/socket";

// const Conversation = () => {
//   const { conversationId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [chatPartner, setChatPartner] = useState(null);
//   const [typing, setTyping] = useState(false);

//   const currentUser = localStorage.getItem("currentUser");
//   let user = null;

//   if (currentUser) {
//     try {
//       user = JSON.parse(currentUser);
//     } catch (err) {
//       console.error("Failed to parse user from localStorage:", err);
//     }
//   }

//   const fetchMessages = async () => {
//     try {
//       const data = await apiFetch({
//         endpoint: `/chat/${conversationId}`,
//         method: "GET",
//       });

//       // Extract messages and conversation
//       const { conversation, messages: fetchedMessages } = data;
//       setMessages(fetchedMessages);

//       // Determine chat partner (the other person in the conversation)
//       if (conversation) {
//         const partner =
//           conversation.guest._id === user?._id
//             ? conversation.host
//             : conversation.guest;
//         setChatPartner(partner);
//       }

//       console.log(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//   }, [conversationId]);

//   const sendMessage = async () => {
//     if (!newMessage.trim()) return;
//     try {
//       const msg = await apiFetch({
//         endpoint: `/chat/${conversationId}`,
//         method: "POST",
//         body: { text: newMessage },
//       });
//       setMessages((prev) => [...prev, msg]);
//       setNewMessage("");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     socket.emit("join_conversation", conversationId);

//     socket.on("new_message", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     socket.on("typing", () => setTyping(true));
//     socket.on("stop_typing", () => setTyping(false));

//     return () => socket.off();
//   }, [conversationId]);

//   return (
//     <div className="w-full mx-auto flex flex-col h-[90vh]">
//       {/* Chat Partner Header */}
//       {chatPartner && (
//         <div className="flex items-center gap-3 p-3 bg-gray-100 sticky top-0 z-10">
//           <img
//             src={chatPartner.profileImage || "/default-avatar.png"}
//             alt={chatPartner.displayName}
//             className="w-10 h-10 rounded-full object-cover"
//           />
//           <div>
//             <p className="font-semibold">
//               {chatPartner.displayName || "Unkown user"}
//             </p>
//             {typing && <p className="text-xs text-gray-500">Typing…</p>}
//           </div>
//         </div>
//       )}

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-4">
//         {messages.map((msg) => (
//           <div
//             key={msg._id}
//             className={`w-fit max-w-[60%] break-words p-2 rounded-lg ${
//               msg.sender._id === user?._id
//                 ? "ml-auto bg-primary text-white"
//                 : "bg-gray-100"
//             }`}
//           >
//             {msg.text}
//             <div className="text-xs text-gray-400 mt-1">
//               {new Date(msg.createdAt).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <div className="flex gap-2 p-2">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => {
//             setNewMessage(e.target.value);
//             socket.emit("typing", { conversationId });
//           }}
//           onBlur={() => socket.emit("stop_typing", { conversationId })}
//           className="flex-1 border rounded-lg p-2"
//           placeholder="Type a message..."
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-primary text-white px-4 py-2 rounded-lg"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Conversation;

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import socket from "../utils/socket";

const Conversation = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatPartner, setChatPartner] = useState(null);
  const [typing, setTyping] = useState(false);

  const currentUser = localStorage.getItem("currentUser");
  const user = currentUser ? JSON.parse(currentUser) : null;
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch messages and conversation
  const fetchMessages = async () => {
    try {
      const data = await apiFetch({
        endpoint: `/chat/${conversationId}`,
        method: "GET",
      });
      const { conversation, messages: fetchedMessages } = data;
      setMessages(fetchedMessages);

      const partner =
        conversation.guest._id === user?._id
          ? conversation.host
          : conversation.guest;
      setChatPartner(partner);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket events
  useEffect(() => {
    socket.emit("join_conversation", conversationId);

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (data) => {
      if (data.userId !== user._id) setTyping(true);
    });

    socket.on("stop_typing", (data) => {
      if (data.userId !== user._id) setTyping(false);
    });

    return () => {
      socket.emit("leave_conversation", conversationId);
      socket.off("new_message");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [conversationId, user._id]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Optimistic update
    const tempMsg = {
      _id: "temp-" + Date.now(),
      text: newMessage,
      sender: user,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    try {
      const msg = await apiFetch({
        endpoint: `/chat/${conversationId}`,
        method: "POST",
        body: { text: tempMsg.text },
      });
      // Replace temp message with real message from server
      setMessages((prev) => prev.map((m) => (m._id === tempMsg._id ? msg : m)));
    } catch (err) {
      console.error(err);
      // Optionally remove temp message on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    }
  };

  // Handle typing indicator
  const handleTyping = (value) => {
    setNewMessage(value);
    socket.emit("typing", { conversationId, userId: user._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId, userId: user._id });
    }, 1000);
  };

  return (
    <div className="w-full mx-auto flex flex-col h-[90vh]">
      {/* Header */}
      {chatPartner && (
        <div className="flex items-center gap-3 p-3 bg-gray-100 sticky top-0 z-10">
          <img
            src={chatPartner.profileImage || "/default-avatar.png"}
            alt={chatPartner.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{chatPartner.displayName}</p>
            {typing && <p className="text-xs text-gray-500">Typing…</p>}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`w-fit max-w-[60%] break-words p-2 rounded-lg ${
              msg.sender._id === user?._id
                ? "ml-auto bg-primary text-white"
                : "bg-gray-100"
            }`}
          >
            {msg.text}
            <div className="text-xs text-gray-400 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          className="flex-1 border rounded-lg p-2"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Conversation;
