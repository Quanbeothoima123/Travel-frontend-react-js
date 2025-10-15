import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAdmin } from "../../contexts/AdminContext";
import "./AdminSupportPage.css";

const API_BASE =
  process.env.REACT_APP_DOMAIN_BACKEND || "http://localhost:5000";

const AdminSupportPage = () => {
  const { admin, loading: adminLoading } = useAdmin();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [counts, setCounts] = useState({
    all: 0,
    waiting: 0,
    active: 0,
    closed: 0,
  });

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedConvRef = useRef(null); // 👈 Thêm ref để track selectedConv

  // 👈 Sync selectedConv với ref
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO
  useEffect(() => {
    if (adminLoading || !admin) return;

    const socket = io(API_BASE, {
      auth: {
        userId: admin.id,
        userType: "admin",
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Admin connected to socket");
    });

    // Nhận conversation mới
    socket.on("new-support-conversation", () => {
      fetchConversations();
    });

    // Nhận tin nhắn mới
    socket.on("new-support-message", (message) => {
      console.log("📨 Received new support message:", message);

      // 👈 Sử dụng ref để lấy giá trị mới nhất
      const currentSelectedConv = selectedConvRef.current;

      // Cập nhật messages nếu đang xem conversation này
      if (
        currentSelectedConv &&
        message.conversationId === currentSelectedConv._id
      ) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }

      // Cập nhật conversation list
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: message.content,
                sender: message.sender,
                sentAt: message.createdAt,
              },
              unreadCount: {
                ...conv.unreadCount,
                admin:
                  currentSelectedConv?._id === message.conversationId
                    ? 0
                    : conv.unreadCount.admin + 1,
              },
            };
          }
          return conv;
        })
      );
    });

    // Typing indicators
    socket.on("support-user-typing", ({ userType, conversationId }) => {
      console.log("⌨️ User typing in conversation:", conversationId);
      const currentSelectedConv = selectedConvRef.current;
      if (userType === "user" && currentSelectedConv?._id === conversationId) {
        setIsTyping(true);
      }
    });

    socket.on("support-user-stop-typing", ({ conversationId }) => {
      console.log("⏸️ User stop typing in conversation:", conversationId);
      const currentSelectedConv = selectedConvRef.current;
      if (currentSelectedConv?._id === conversationId) {
        setIsTyping(false);
      }
    });

    // Conversation closed
    socket.on("conversation-closed", ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? { ...conv, status: "closed" } : conv
        )
      );

      const currentSelectedConv = selectedConvRef.current;
      if (currentSelectedConv?._id === conversationId) {
        setSelectedConv({ ...currentSelectedConv, status: "closed" });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [admin, adminLoading]); // 👈 KHÔNG thêm selectedConv vào dependencies

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/support?status=${filter}&search=${searchTerm}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchConversations();
    }
  }, [filter, searchTerm, admin]);

  // Select conversation
  const handleSelectConversation = async (conv) => {
    // Leave room cũ
    if (selectedConv) {
      socketRef.current?.emit("leave-support-chat", selectedConv._id);
    }

    setSelectedConv(conv);
    setMessages([]);
    setLoading(true);
    setIsTyping(false); // 👈 Reset typing khi chuyển conversation

    // 👈 Join room MỚI NGAY LẬP TỨC
    socketRef.current?.emit("join-support-chat", conv._id);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/support/${conv._id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        setSelectedConv(data.conversation);

        // Mark as read
        socketRef.current?.emit("mark-support-as-read", {
          conversationId: conv._id,
        });

        // Reset unread count
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conv._id
              ? { ...c, unreadCount: { ...c.unreadCount, admin: 0 } }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Fetch conversation error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConv || sending) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput("");

    socketRef.current?.emit("send-support-message", {
      conversationId: selectedConv._id,
      content,
      type: "text",
    });

    setSending(false);
  };

  // Typing
  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!selectedConv) return;

    socketRef.current?.emit("support-typing-start", {
      conversationId: selectedConv._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("support-typing-stop", {
        conversationId: selectedConv._id,
      });
    }, 1000);
  };

  // Join conversation
  const handleJoinConversation = async () => {
    if (!selectedConv) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/support/${selectedConv._id}/join`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setSelectedConv({
          ...selectedConv,
          status: "active",
          assignedAdmin: admin,
        });
        fetchConversations();
      }
    } catch (error) {
      console.error("Join conversation error:", error);
    }
  };

  // Close conversation
  const handleCloseConversation = async () => {
    if (
      !selectedConv ||
      !window.confirm("Bạn có chắc muốn đóng cuộc trò chuyện này?")
    )
      return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/admin/support/${selectedConv._id}/close`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setSelectedConv({ ...selectedConv, status: "closed" });
        fetchConversations();
      }
    } catch (error) {
      console.error("Close conversation error:", error);
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
    return d.toLocaleDateString("vi-VN");
  };

  const formatMessageTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (adminLoading) {
    return (
      <div className="asp-container">
        <div className="asp-loading">⏳ Đang tải thông tin admin...</div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="asp-container">
        <div className="asp-loading">❌ Không thể tải thông tin admin</div>
      </div>
    );
  }

  return (
    <div className="asp-container">
      {/* Sidebar */}
      <div className="asp-sidebar">
        <div className="asp-sidebar-header">
          <h2 className="asp-title">Hỗ Trợ Khách Hàng</h2>
        </div>

        <div className="asp-filters">
          {[
            { key: "all", label: "Tất cả", count: counts.all },
            { key: "waiting", label: "Chờ xử lý", count: counts.waiting },
            { key: "active", label: "Đang xử lý", count: counts.active },
            { key: "closed", label: "Đã đóng", count: counts.closed },
          ].map((f) => (
            <button
              key={f.key}
              className={`asp-filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.count > 0 && <span className="asp-count">{f.count}</span>}
            </button>
          ))}
        </div>

        <div className="asp-search">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="asp-search-input"
          />
        </div>

        <div className="asp-conversations">
          {loading && conversations.length === 0 ? (
            <div className="asp-loading">⏳ Đang tải...</div>
          ) : conversations.length === 0 ? (
            <div className="asp-empty">📭 Không có cuộc trò chuyện</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                className={`asp-conv-item ${
                  selectedConv?._id === conv._id ? "active" : ""
                } ${conv.unreadCount?.admin > 0 ? "unread" : ""}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="asp-conv-avatar">
                  {conv.user?.avatar ? (
                    <img src={conv.user.avatar} alt={conv.user.fullName} />
                  ) : (
                    <div className="asp-avatar-placeholder">
                      {conv.user?.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className={`asp-status-dot ${conv.status}`}></span>
                </div>
                <div className="asp-conv-content">
                  <div className="asp-conv-header">
                    <span className="asp-conv-name">
                      {conv.user?.fullName || "Khách hàng"}
                    </span>
                    <span className="asp-conv-time">
                      {formatTime(conv.lastMessage?.sentAt || conv.createdAt)}
                    </span>
                  </div>
                  <div className="asp-conv-preview">
                    {conv.lastMessage?.content || conv.issueDescription}
                  </div>
                  {conv.unreadCount?.admin > 0 && (
                    <span className="asp-unread-badge">
                      {conv.unreadCount.admin}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="asp-chat-area">
        {selectedConv ? (
          <>
            <div className="asp-chat-header">
              <div className="asp-chat-user-info">
                <div className="asp-chat-avatar">
                  {selectedConv.user?.avatar ? (
                    <img
                      src={selectedConv.user.avatar}
                      alt={selectedConv.user.fullName}
                    />
                  ) : (
                    <div className="asp-avatar-placeholder">
                      {selectedConv.user?.fullName?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="asp-chat-name">
                    {selectedConv.user?.fullName || "Khách hàng"}
                  </div>
                  <div className="asp-chat-status">
                    <span className={`asp-status-badge ${selectedConv.status}`}>
                      {selectedConv.status === "waiting" && "⏳ Đang chờ"}
                      {selectedConv.status === "active" && "✅ Đang hoạt động"}
                      {selectedConv.status === "closed" && "🔒 Đã đóng"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="asp-chat-actions">
                {selectedConv.status === "waiting" && (
                  <button
                    className="asp-btn asp-btn-primary"
                    onClick={handleJoinConversation}
                  >
                    Tham gia
                  </button>
                )}
                {selectedConv.status === "active" && (
                  <button
                    className="asp-btn asp-btn-danger"
                    onClick={handleCloseConversation}
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>

            <div className="asp-messages">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`asp-message ${
                    msg.senderType === "admin"
                      ? "admin"
                      : msg.isSystemMessage
                      ? "system"
                      : "user"
                  }`}
                >
                  {msg.isSystemMessage ? (
                    <div className="asp-system-message">{msg.content}</div>
                  ) : (
                    <>
                      <div className="asp-message-avatar">
                        {msg.sender?.avatar ? (
                          <img
                            src={msg.sender.avatar}
                            alt={msg.sender.fullName}
                          />
                        ) : (
                          <div className="asp-avatar-placeholder-sm">
                            {msg.sender?.fullName?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                        )}
                      </div>
                      <div className="asp-message-content">
                        <div className="asp-message-sender">
                          {msg.sender?.fullName}
                        </div>
                        <div className="asp-message-bubble">{msg.content}</div>
                        <div className="asp-message-time">
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="asp-typing-indicator">
                  <div className="asp-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="asp-typing-text">Đang nhập...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedConv.status !== "closed" && (
              <div className="asp-input-area">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={messageInput}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
                  disabled={sending}
                  className="asp-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="asp-send-btn"
                >
                  {sending ? "⏳" : "📤"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="asp-empty-state">
            <div className="asp-empty-icon">💬</div>
            <h3>Chọn một cuộc trò chuyện</h3>
            <p>
              Chọn cuộc trò chuyện từ danh sách để bắt đầu hỗ trợ khách hàng
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportPage;
