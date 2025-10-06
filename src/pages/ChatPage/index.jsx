// pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import {
  FaPaperPlane,
  FaArrowLeft,
  FaEdit,
  FaImage,
  FaSmile,
  FaPaperclip,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext"; // ✅ Dùng context của bạn
import { selectAndUploadImages } from "../../utils/uploadImages";
import "./ChatPage.css";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

// ✅ Socket được quản lý global để tránh reconnect
let socket = null;

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth(); // ✅ Lấy user từ context

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!chatId || !isMobile);
  const [typing, setTyping] = useState(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ Initialize socket chỉ một lần
  useEffect(() => {
    if (!socket && user) {
      console.log("🔌 Initializing socket connection...");

      socket = io(API_BASE, {
        auth: { userId: user._id },
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
      });

      socket.on("new-message", (message) => {
        console.log("📨 New message received:", message);
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      socket.on("chat-updated", ({ chatId: updatedChatId, lastMessage }) => {
        console.log("🔄 Chat updated:", updatedChatId);
        setChats((prev) => {
          const updated = prev.map((chat) =>
            chat.chatId === updatedChatId
              ? {
                  ...chat,
                  lastMessage,
                  updatedAt: new Date(),
                  unreadCount: chat.unreadCount + 1,
                }
              : chat
          );
          return updated.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        });
      });

      socket.on("user-typing", ({ userId }) => {
        setTyping(userId);
      });

      socket.on("user-stop-typing", () => {
        setTyping(null);
      });

      socket.on("message-deleted", ({ messageId }) => {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      });

      socket.on("message-edited", (editedMessage) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === editedMessage._id ? editedMessage : m))
        );
      });

      socket.on("message-reacted", ({ messageId, reactions }) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
        );
      });
    }

    // ✅ Cleanup khi unmount
    return () => {
      if (socket) {
        console.log("🔌 Disconnecting socket...");
        socket.disconnect();
        socket = null;
      }
    };
  }, [user]);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load chat list
  useEffect(() => {
    loadChatList();
  }, []);

  // Load specific chat
  useEffect(() => {
    if (chatId) {
      loadChatDetail(chatId);
      if (isMobile) setShowSidebar(false);
    }
  }, [chatId, isMobile]);

  // ✅ Tạo hoặc lấy chat từ userId (từ FriendsList)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const otherUserId = params.get("userId");

    if (otherUserId && !chatId) {
      console.log("📧 Creating/getting chat with user:", otherUserId);
      createOrGetChat(otherUserId);
    }
  }, [location.search, chatId]);

  const loadChatList = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/chat/getChatList`, {
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setChats(result.data);

        // Auto select first chat on desktop if no chatId
        if (!chatId && result.data.length > 0 && !isMobile) {
          navigate(`/user/chat/${result.data[0].chatId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error("❌ Load chat list error:", error);
    }
  };

  const createOrGetChat = async (otherUserId) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/chat/create-or-get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otherUserId }),
      });

      const result = await response.json();

      if (result.success) {
        // ✅ Clear query params và navigate đến chat
        navigate(`/user/chat/${result.data.chatId}`, { replace: true });
        loadChatList();
      }
    } catch (error) {
      console.error("❌ Create chat error:", error);
    }
  };

  const loadChatDetail = async (id) => {
    setLoading(true);
    try {
      // Load messages
      const messagesResponse = await fetch(
        `${API_BASE}/api/v1/message/get-messages/${id}`,
        { credentials: "include" }
      );
      const messagesResult = await messagesResponse.json();

      if (messagesResult.success) {
        setMessages(messagesResult.data.messages);
      }

      // Load chat info
      const chatResponse = await fetch(`${API_BASE}/api/v1/chat/detail/${id}`, {
        credentials: "include",
      });
      const chatResult = await chatResponse.json();

      if (chatResult.success) {
        setActiveChat(chatResult.data);
        setNickname(chatResult.data.otherUser.name);
      }

      // ✅ Join socket room
      if (socket && socket.connected) {
        socket.emit("join-chat", id);
        socket.emit("mark-as-read", { chatId: id });
      }

      // Reset unread count
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === id ? { ...chat, unreadCount: 0 } : chat
        )
      );

      scrollToBottom();
    } catch (error) {
      console.error("❌ Load chat detail error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !socket) return;

    const messageData = {
      chatId,
      content: newMessage.trim(),
      type: "text",
    };

    setNewMessage("");

    // ✅ Emit qua socket
    socket.emit("send-message", messageData);
    socket.emit("typing-stop", { chatId });
  };

  const handleSendImage = () => {
    if (!chatId || uploading || !socket) return;

    selectAndUploadImages({
      multiple: false,
      onStart: () => {
        setUploading(true);
      },
      onSuccess: (imageUrl) => {
        const messageData = {
          chatId,
          content: imageUrl,
          type: "image",
        };

        socket.emit("send-message", messageData);
        setUploading(false);
      },
      onError: (error) => {
        console.error("❌ Upload image error:", error);
        alert("Không thể tải ảnh lên. Vui lòng thử lại!");
        setUploading(false);
      },
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && chatId) {
      socket.emit("typing-start", { chatId });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing-stop", { chatId });
      }, 1000);
    }
  };

  const handleSetNickname = async () => {
    if (!chatId) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/chat/nickname/${chatId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nickname }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setActiveChat((prev) => ({
          ...prev,
          otherUser: { ...prev.otherUser, name: nickname },
        }));

        setChats((prev) =>
          prev.map((chat) =>
            chat.chatId === chatId
              ? { ...chat, otherUser: { ...chat.otherUser, name: nickname } }
              : chat
          )
        );

        setShowNicknameModal(false);
        alert("Đã đặt biệt danh thành công!");
      }
    } catch (error) {
      console.error("❌ Set nickname error:", error);
      alert("Không thể đặt biệt danh");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ✅ Chờ auth loading xong
  if (authLoading) {
    return <div className="loading-screen">Đang tải...</div>;
  }

  // ✅ Redirect nếu chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ`;
    return d.toLocaleDateString("vi-VN");
  };

  const formatMessagePreview = (msg) => {
    if (!msg) return "Chưa có tin nhắn";
    switch (msg.type) {
      case "image":
        return "📷 Hình ảnh";
      case "file":
        return "📎 File";
      case "video":
        return "🎥 Video";
      default:
        return msg.content || "";
    }
  };

  // ✅ Sidebar Component
  const renderSidebar = () => (
    <div className={`chat-sidebar ${showSidebar ? "show" : "hide"}`}>
      <div className="sidebar-header">
        <h2>Đoạn chat</h2>
      </div>

      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.chatId}
            className={`chat-item ${chatId === chat.chatId ? "active" : ""}`}
            onClick={() => {
              navigate(`/user/chat/${chat.chatId}`);
              if (isMobile) setShowSidebar(false);
            }}
          >
            <div className="chat-avatar">
              <img
                src={chat.otherUser.avatar || "/default-avatar.png"}
                alt={chat.otherUser.name}
              />
            </div>

            <div className="chat-info">
              <div className="chat-name">{chat.otherUser.name}</div>
              <div className="chat-preview">
                {chat.lastMessage?.isMe && "Bạn: "}
                {formatMessagePreview(chat.lastMessage)}
              </div>
            </div>

            <div className="chat-meta">
              <div className="chat-time">{formatTime(chat.updatedAt)}</div>
              {chat.unreadCount > 0 && (
                <div className="unread-badge">{chat.unreadCount}</div>
              )}
            </div>
          </div>
        ))}

        {chats.length === 0 && (
          <div className="empty-chats">Chưa có đoạn chat nào</div>
        )}
      </div>
    </div>
  );

  // ✅ Chat Content Component
  const renderChatContent = () => {
    if (!chatId) {
      return (
        <div className="no-chat-selected">
          <p>Chọn một đoạn chat để bắt đầu nhắn tin</p>
        </div>
      );
    }

    return (
      <div className="chat-content">
        {/* Header */}
        <div className="chat-header">
          {isMobile && (
            <button
              className="back-btn"
              onClick={() => {
                setShowSidebar(true);
                navigate("/user/chat");
              }}
            >
              <FaArrowLeft size={20} />
            </button>
          )}

          <div className="header-user">
            <img
              src={activeChat?.otherUser.avatar || "/default-avatar.png"}
              alt={activeChat?.otherUser.name}
            />
            <div>
              <div className="header-name">{activeChat?.otherUser.name}</div>
            </div>
          </div>

          <button
            className="more-btn"
            onClick={() => setShowNicknameModal(true)}
            title="Đặt biệt danh"
          >
            <FaEdit size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {loading && <div className="loading">Đang tải...</div>}

          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${
                msg.sender._id === user._id ? "sent" : "received"
              }`}
            >
              {msg.sender._id !== user._id && (
                <img
                  src={msg.sender.avatar || "/default-avatar.png"}
                  alt={msg.sender.userName}
                  className="msg-avatar"
                />
              )}

              <div className="message-bubble">
                {msg.type === "image" ? (
                  <div className="message-image-container">
                    <img
                      src={msg.content}
                      alt="Sent image"
                      className="message-image"
                      onClick={() => window.open(msg.content, "_blank")}
                    />
                  </div>
                ) : (
                  <div className="message-content">
                    {msg.content}
                    {msg.edited && (
                      <span className="edited-label"> (đã chỉnh sửa)</span>
                    )}
                  </div>
                )}
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          {uploading && (
            <div className="uploading-indicator">Đang tải ảnh lên...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="message-input-container" onSubmit={sendMessage}>
          <button
            type="button"
            className="input-icon-btn"
            onClick={handleSendImage}
            disabled={uploading}
            title="Gửi ảnh"
          >
            <FaImage size={20} />
          </button>

          <button type="button" className="input-icon-btn" disabled>
            <FaPaperclip size={20} />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Aa"
            className="message-input"
            disabled={uploading}
          />

          <button type="button" className="input-icon-btn" disabled>
            <FaSmile size={20} />
          </button>

          <button
            type="submit"
            className="send-btn"
            disabled={!newMessage.trim() || uploading}
          >
            <FaPaperPlane size={18} />
          </button>
        </form>
      </div>
    );
  };

  // ✅ Main render
  return (
    <div className="chat-page">
      {renderSidebar()}
      {renderChatContent()}

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowNicknameModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Đặt biệt danh</h3>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nhập biệt danh"
              className="nickname-input"
            />
            <div className="modal-actions">
              <button onClick={() => setShowNicknameModal(false)}>Hủy</button>
              <button onClick={handleSetNickname}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
