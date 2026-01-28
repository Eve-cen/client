// // src/pages/Conversation.jsx
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { apiFetch } from "../utils/api";

// const Conversation = () => {
//   const { conversationId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");

//   const currentUser = localStorage.getItem("currentUser");
//   let user = null;

//   if (currentUser) {
//     try {
//       user = JSON.parse(currentUser);
//     } catch (err) {
//       console.error("Failed to parse user from localStorage:", err);
//     }
//   } else {
//     console.warn("No currentUser in localStorage");
//   }

//   const fetchMessages = async () => {
//     try {
//       const data = await apiFetch({
//         endpoint: `/chat/${conversationId}`,
//         method: "GET",
//       });
//       setMessages(data);
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

//   return (
//     <div className="w-full mx-auto p-4 flex flex-col h-[90vh]">
//       {/* {chatPartner && (
//         <div className="flex items-center gap-3 p-3 bg-white shadow-md border-b sticky top-0 z-10">
//           <img
//             src={chatPartner.profileImage}
//             alt={chatPartner.displayName}
//             className="w-10 h-10 rounded-full object-cover"
//           />
//           <div>
//             <p className="font-semibold">{chatPartner.displayName}</p>
//             {typing && <p className="text-xs text-gray-500">Typing…</p>}
//           </div>
//         </div>
//       )} */}
//       <div className="flex-1 overflow-y-auto mb-4 space-y-2">
//         {messages.map((msg) => (
//           <div
//             key={msg._id}
//             className={`p-2 rounded-lg max-w-[60%] ${
//               msg.sender._id === currentUser._id
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

//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
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

// src/pages/Conversation.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";

const Conversation = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatPartner, setChatPartner] = useState(null);
  const [typing, setTyping] = useState(false);

  const currentUser = localStorage.getItem("currentUser");
  let user = null;

  if (currentUser) {
    try {
      user = JSON.parse(currentUser);
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await apiFetch({
        endpoint: `/chat/${conversationId}`,
        method: "GET",
      });

      // Extract messages and conversation
      const { conversation, messages: fetchedMessages } = data;
      setMessages(fetchedMessages);

      // Determine chat partner (the other person in the conversation)
      if (conversation) {
        const partner =
          conversation.guest._id === user?._id
            ? conversation.host
            : conversation.guest;
        setChatPartner(partner);
      }

      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const msg = await apiFetch({
        endpoint: `/chat/${conversationId}`,
        method: "POST",
        body: { text: newMessage },
      });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col h-[90vh]">
      {/* Chat Partner Header */}
      {chatPartner && (
        <div className="flex items-center gap-3 p-3 bg-gray-100 sticky top-0 z-10">
          <img
            src={chatPartner.profileImage || "/default-avatar.png"}
            alt={chatPartner.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">
              {chatPartner.displayName || "Unkown user"}
            </p>
            {typing && <p className="text-xs text-gray-500">Typing…</p>}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded-lg max-w-[60%] ${
              msg.sender._id === user?.id
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
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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
