// src/pages/messenger/Messenger.jsx

import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Topbar from "../../components/topbar/Topbar";
import Conversation from "../../components/conversation/Conversation";
import Message from "../../components/message/Message";
import { io } from "socket.io-client";
import api from "../../api";
import Search from '../../components/search/Search'; // --- IMPORT THE SEARCH COMPONENT ---

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useRef();
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({ sender: data.senderId, text: data.text, createdAt: Date.now() });
    });
  }, []);

  useEffect(() => {
    socket.current.emit("addUser", user._id);
  }, [user]);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await api.get("/conversations/" + user._id);
        setConversations(res.data);
      } catch (err) { console.log(err) }
    };
    getConversations();
  }, [user._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await api.get("/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) { console.log(err) }
    };
    if (currentChat) getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage) return;
    const message = { senderId: user._id, text: newMessage, conversationId: currentChat._id };
    const receiverId = currentChat.members.find((member) => member !== user._id);
    socket.current.emit("sendMessage", { senderId: user._id, receiverId, text: newMessage });
    try {
      const res = await api.post("/messages", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) { console.log(err) }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- ADD THIS FUNCTION TO START A NEW CHAT ---
  const handleStartConversation = async (friend) => {
    try {
      const res = await api.post('/conversations', {
        senderId: user._id,
        receiverId: friend._id,
      });
      // Check if the conversation already exists in our list
      if (!conversations.find(c => c._id === res.data._id)) {
        setConversations(prev => [...prev, res.data]);
      }
      setCurrentChat(res.data);
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

  return (
    <>
      <Topbar />
      <div className="h-[calc(100vh-70px)] flex bg-background-primary">
        {/* Chat Menu */}
        <div className="flex-[3.5] p-4 border-r border-gray-700">
          
          {/* --- REPLACE THE OLD INPUT WITH THE SEARCH COMPONENT --- */}
          <Search onUserSelect={handleStartConversation} />

          <div className="mt-4 flex flex-col gap-2 overflow-y-auto">
            {conversations.map((c) => (
              <div key={c._id} onClick={() => setCurrentChat(c)}>
                <Conversation conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>

        {/* Chat Box */}
        <div className="flex-[5.5] flex flex-col">
          {currentChat ? (
            <>
              <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} ref={scrollRef}>
                    <Message message={m} own={m.senderId === user._id} />
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="mt-auto p-4 flex items-center border-t border-gray-700">
                <textarea
                  className="w-full p-3 bg-gray-700/50 text-white rounded-lg focus:outline-none resize-none"
                  placeholder="Write something..."
                  onChange={(e) => setNewMessage(e.target.value)}
                  value={newMessage}
                ></textarea>
                <button type="submit" className="ml-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Send
                </button>
              </form>
            </>
          ) : (
            <span className="flex items-center justify-center h-full text-3xl text-gray-500 cursor-default">
              Open a conversation to start a chat.
            </span>
          )}
        </div>
      </div>
    </>
  );
}