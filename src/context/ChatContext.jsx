// src/context/ChatContext.jsx
import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext(); // ✅ default undefined

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  return (
    <ChatContext.Provider
      value={{ conversations, setConversations, loaded, setLoaded }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// ✅ useChat hook
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
