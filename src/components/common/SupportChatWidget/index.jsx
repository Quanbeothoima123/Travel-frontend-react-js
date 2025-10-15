import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../../contexts/AuthContext"; // 👈 Import useAuth
import "./SupportChatWidget.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const SupportChatWidget = () => {
  const { user, loading } = useAuth(); // 👈 Lấy user từ AuthContext
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState("closed"); // closed, login, preChat, chat, feedback
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);

  // Pre-chat form
  const [issueDescription, setIssueDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Feedback form
  const [isResolved, setIsResolved] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Set cookie
  const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  // Delete cookie
  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Initialize socket
  const initializeSocket = (userId) => {
    if (socketRef.current) return;

    const socket = io(API_BASE, {
      auth: {
        userId,
        userType: "user",
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ User connected to support socket");
    });

    socket.on("new-support-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("support-user-typing", ({ userType }) => {
      if (userType === "admin") setIsTyping(true);
    });

    socket.on("support-user-stop-typing", () => {
      setIsTyping(false);
    });

    socket.on("conversation-closed", () => {
      setCurrentView("feedback");
    });

    return socket;
  };

  // Check auth on widget open
  const handleWidgetOpen = async () => {
    setIsOpen(true);

    // 👈 Nếu chưa load xong AuthContext thì đợi
    if (loading) return;

    // 👈 Kiểm tra user từ AuthContext
    if (!user) {
      setCurrentView("login");
      return;
    }

    // 👈 User đã đăng nhập, khởi tạo socket
    initializeSocket(user._id);

    // Kiểm tra conversation đang mở
    const savedConvId = getCookie("activeSupportConversationId");
    if (savedConvId) {
      await loadConversation(savedConvId);
    } else {
      setCurrentView("preChat");
    }
  };

  // Load existing conversation
  const loadConversation = async (convId) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/support/${convId}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setConversationId(convId);
        setMessages(data.messages);
        setCurrentView("chat");

        socketRef.current?.emit("join-support-chat", convId);
        socketRef.current?.emit("mark-support-as-read", {
          conversationId: convId,
        });
      } else {
        deleteCookie("activeSupportConversationId");
        setCurrentView("preChat");
      }
    } catch (error) {
      console.error("Load conversation error:", error);
      setCurrentView("preChat");
    }
  };

  // Create new conversation
  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/v1/support/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          issueDescription: issueDescription.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConversationId(data.conversationId);
        setCookie("activeSupportConversationId", data.conversationId);
        setCurrentView("chat");
        setIssueDescription("");
        setPhoneNumber("");

        await loadConversation(data.conversationId);
      }
    } catch (error) {
      console.error("Create conversation error:", error);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput("");

    socketRef.current?.emit("send-support-message", {
      conversationId,
      content,
      type: "text",
    });

    setSending(false);
  };

  // Typing indicator
  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    socketRef.current?.emit("support-typing-start", { conversationId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("support-typing-stop", { conversationId });
    }, 1000);
  };

  // Close conversation
  const handleCloseConversation = async () => {
    if (!window.confirm("Bạn có chắc muốn đóng cuộc trò chuyện?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/support/${conversationId}/close`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        deleteCookie("activeSupportConversationId");
        setCurrentView("feedback");
      }
    } catch (error) {
      console.error("Close conversation error:", error);
    }
  };

  // New conversation
  const handleNewConversation = () => {
    deleteCookie("activeSupportConversationId");
    setConversationId(null);
    setMessages([]);
    setCurrentView("preChat");
    socketRef.current?.emit("leave-support-chat", conversationId);
  };

  // Submit feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/support/${conversationId}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            isResolved,
            rating: isResolved ? rating : null,
            comment: !isResolved ? feedbackComment : "",
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setIsOpen(false);
        setCurrentView("closed");
        setIsResolved(null);
        setRating(0);
        setFeedbackComment("");
      }
    } catch (error) {
      console.error("Submit feedback error:", error);
    }
  };

  // Close widget
  const handleClose = () => {
    setIsOpen(false);
    if (conversationId) {
      socketRef.current?.emit("leave-support-chat", conversationId);
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // 👈 Đợi AuthContext load xong
  if (loading) {
    return null; // hoặc hiển thị spinner nhỏ
  }

  return (
    <>
      {/* Floating Button */}
      <button className="scw-trigger-btn" onClick={handleWidgetOpen}>
        💬 Hỗ trợ
      </button>

      {/* Widget Window */}
      {isOpen && (
        <div className="scw-widget">
          {/* Header */}
          <div className="scw-header">
            <div className="scw-header-info">
              <div className="scw-header-icon">💬</div>
              <div>
                <div className="scw-header-title">Hỗ Trợ Khách Hàng</div>
                <div className="scw-header-subtitle">
                  Chúng tôi luôn sẵn sàng hỗ trợ bạn
                </div>
              </div>
            </div>
            <button className="scw-close-btn" onClick={handleClose}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="scw-content">
            {/* Login Required */}
            {currentView === "login" && (
              <div className="scw-login">
                <div className="scw-login-icon">🔒</div>
                <h3>Vui lòng đăng nhập</h3>
                <p>Bạn cần đăng nhập để sử dụng tính năng hỗ trợ trực tuyến</p>
                <button
                  className="scw-btn scw-btn-primary"
                  onClick={() => (window.location.href = "/login")}
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}

            {/* Pre-Chat Form */}
            {currentView === "preChat" && (
              <div className="scw-pre-chat">
                <div className="scw-welcome">
                  <div className="scw-welcome-icon">👋</div>
                  <h3>Xin chào{user?.fullName ? `, ${user.fullName}` : ""}!</h3>
                  <p>
                    Chúng tôi rất vui được hỗ trợ bạn. Vui lòng mô tả vấn đề của
                    bạn.
                  </p>
                </div>
                <div className="scw-form" onSubmit={handleCreateConversation}>
                  <div className="scw-form-group">
                    <label className="scw-label">Mô tả vấn đề *</label>
                    <textarea
                      className="scw-textarea"
                      placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      rows="4"
                      required
                    />
                  </div>
                  <div className="scw-form-group">
                    <label className="scw-label">
                      Số điện thoại (Tùy chọn)
                    </label>
                    <input
                      type="tel"
                      className="scw-input"
                      placeholder="Nhập số điện thoại..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="scw-btn scw-btn-primary scw-btn-full"
                    onClick={handleCreateConversation}
                    disabled={!issueDescription.trim()}
                  >
                    Bắt đầu trò chuyện
                  </button>
                </div>
              </div>
            )}

            {/* Chat */}
            {currentView === "chat" && (
              <>
                <div className="scw-messages">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`scw-message ${
                        msg.senderType === "user"
                          ? "user"
                          : msg.isSystemMessage
                          ? "system"
                          : "admin"
                      }`}
                    >
                      {msg.isSystemMessage ? (
                        <div className="scw-system-message">{msg.content}</div>
                      ) : (
                        <>
                          <div className="scw-message-bubble">
                            {msg.content}
                          </div>
                          <div className="scw-message-time">
                            {formatTime(msg.createdAt)}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="scw-typing-indicator">
                      <div className="scw-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="scw-typing-text">
                        Admin đang nhập...
                      </span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="scw-actions">
                  <button
                    className="scw-action-btn"
                    onClick={handleNewConversation}
                  >
                    🔄 Tạo cuộc trò chuyện mới
                  </button>
                  <button
                    className="scw-action-btn scw-action-danger"
                    onClick={handleCloseConversation}
                  >
                    ⛔ Đóng cuộc trò chuyện
                  </button>
                </div>

                <div className="scw-input-area">
                  <input
                    type="text"
                    className="scw-input"
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
                    disabled={sending}
                  />
                  <button
                    className="scw-send-btn"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending}
                  >
                    📤
                  </button>
                </div>
              </>
            )}

            {/* Feedback */}
            {currentView === "feedback" && (
              <div className="scw-feedback">
                <div className="scw-feedback-icon">⭐</div>
                <h3>Phản hồi của bạn</h3>
                <p>Vấn đề của bạn đã được giải quyết chưa?</p>

                {isResolved === null && (
                  <div className="scw-feedback-buttons">
                    <button
                      className="scw-btn scw-btn-success"
                      onClick={() => setIsResolved(true)}
                    >
                      ✅ Đã giải quyết
                    </button>
                    <button
                      className="scw-btn scw-btn-outline"
                      onClick={() => setIsResolved(false)}
                    >
                      ❌ Chưa giải quyết
                    </button>
                  </div>
                )}

                {isResolved === true && (
                  <div className="scw-rating">
                    <p>Đánh giá mức độ hài lòng:</p>
                    <div className="scw-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`scw-star ${
                            rating >= star ? "active" : ""
                          }`}
                          onClick={() => setRating(star)}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    <button
                      className="scw-btn scw-btn-primary scw-btn-full"
                      onClick={handleSubmitFeedback}
                      disabled={rating === 0}
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                )}

                {isResolved === false && (
                  <div className="scw-feedback-form">
                    <textarea
                      className="scw-textarea"
                      placeholder="Vui lòng cho chúng tôi biết lý do..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows="4"
                    />
                    <button
                      className="scw-btn scw-btn-primary scw-btn-full"
                      onClick={handleSubmitFeedback}
                      disabled={!feedbackComment.trim()}
                    >
                      Gửi phản hồi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
