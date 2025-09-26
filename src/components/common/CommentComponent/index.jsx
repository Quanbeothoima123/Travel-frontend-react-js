import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaHeart,
  FaThumbsDown,
  FaReply,
  FaPaperPlane,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaUserSecret,
  FaSpinner,
  FaSort,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
} from "react-icons/fa";
import "./CommentComponent.css";
import ConfirmModal from "../ConfirmModal";

const API_BASE = process.env.REACT_APP_DOMAIN_BACKEND;

// ENHANCED: Uncontrolled textarea component với IME support
const UncontrolledTextarea = React.memo(
  ({
    commentId,
    placeholder,
    className,
    rows,
    autoFocus,
    onFocus,
    onClick,
    onTextareaReady,
  }) => {
    const textareaRef = useRef(null);
    const composingRef = useRef(false);
    const lastValueRef = useRef("");

    useEffect(() => {
      if (textareaRef.current && onTextareaReady) {
        onTextareaReady(commentId, textareaRef.current);
        if (autoFocus) {
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 100);
        }
      }
    }, [commentId, autoFocus, onTextareaReady]);

    const handleCompositionStart = useCallback(() => {
      composingRef.current = true;
    }, []);

    const handleCompositionEnd = useCallback(() => {
      composingRef.current = false;
      if (textareaRef.current) {
        lastValueRef.current = textareaRef.current.value;
      }
    }, []);

    const handleInput = useCallback(() => {
      if (!composingRef.current && textareaRef.current) {
        lastValueRef.current = textareaRef.current.value;
      }
    }, []);

    return (
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        className={className}
        rows={rows}
        onFocus={onFocus}
        onClick={onClick}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
      />
    );
  }
);

const CommentComponent = ({ targetId, targetType = "news", currentUser }) => {
  // Main comments state
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  // ENHANCED: Nested replies state with depth tracking
  const [repliesData, setRepliesData] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({}); // Track which nested replies are expanded

  // DELETE comment
  const [confirmDeleteCmt, setConfirmDeleteCmt] = useState(false);
  // Form states
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [totalCommentsCount, setTotalCommentsCount] = useState(0); // Track total including nested

  // Uncontrolled components state management
  const [replyAnonymousStates, setReplyAnonymousStates] = useState({});

  // Refs
  const replyTextareaRefs = useRef(new Map());
  const mainTextareaRef = useRef(null);
  const activeReplyRef = useRef(null);
  const clickTimeoutRef = useRef(null); // FIXED: Prevent immediate trigger

  // Helper functions for uncontrolled textareas
  const registerTextarea = useCallback((commentId, textareaElement) => {
    if (textareaElement) {
      replyTextareaRefs.current.set(commentId, textareaElement);
      activeReplyRef.current = commentId;
    }
  }, []);

  const getReplyContent = useCallback((commentId) => {
    const textarea = replyTextareaRefs.current.get(commentId);
    return textarea ? textarea.value : "";
  }, []);

  const setReplyContent = useCallback((commentId, content) => {
    const textarea = replyTextareaRefs.current.get(commentId);
    if (textarea) {
      textarea.value = content;
    }
  }, []);

  const clearReplyData = useCallback((commentId) => {
    replyTextareaRefs.current.delete(commentId);
    setReplyAnonymousStates((prev) => {
      const updated = { ...prev };
      delete updated[commentId];
      return updated;
    });
  }, []);

  const getReplyAnonymousState = useCallback(
    (commentId) => {
      return replyAnonymousStates[commentId] || false;
    },
    [replyAnonymousStates]
  );

  const setReplyAnonymousState = useCallback((commentId, value) => {
    setReplyAnonymousStates((prev) => ({
      ...prev,
      [commentId]: value,
    }));
  }, []);

  // Load comments when component mounts or targetId changes
  useEffect(() => {
    if (targetId) {
      fetchComments(1, sortBy, true);
      fetchTotalCommentsCount(); // Fetch total count including nested
    }
  }, [targetId, sortBy]);

  // Fetch total comments count including nested
  const fetchTotalCommentsCount = async () => {
    if (!targetId) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/comments/count?targetId=${targetId}&targetType=${targetType}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTotalCommentsCount(result.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tổng số bình luận:", error);
      // Fallback to pagination count
      setTotalCommentsCount(pagination?.totalComments || 0);
    }
  };

  // Helper functions
  const maskName = (fullName) => {
    if (!fullName || fullName.length <= 2) return fullName;
    const words = fullName.trim().split(" ");
    return words
      .map((word) => {
        if (word.length <= 2) return word;
        const firstChar = word[0];
        const lastChar = word[word.length - 1];
        const middle = "*".repeat(word.length - 2);
        return firstChar + middle + lastChar;
      })
      .join(" ");
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diff = now - commentTime;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return commentTime.toLocaleDateString("vi-VN");
  };

  const getDisplayName = (comment) => {
    if (comment.privateInfoUser?.isAnonymous === true) {
      return comment.privateInfoUser.displayName || "Người dùng ẩn danh";
    }
    if (comment.userId?.fullName) {
      return maskName(comment.userId.fullName);
    }
    return "Người dùng";
  };

  const getDisplayAvatar = (comment) => {
    if (comment.privateInfoUser?.isAnonymous === true) {
      return comment.privateInfoUser.avatar || "https://via.placeholder.com/40";
    }
    return comment.userId?.avatar || "https://via.placeholder.com/40";
  };

  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;

    if (comment.privateInfoUser?.isAnonymous === true) {
      return comment.privateInfoUser.userId === currentUser._id;
    } else {
      return comment.userId?._id === currentUser._id;
    }
  };

  // Fetch main comments
  const fetchComments = async (page = 1, newSortBy = sortBy, reset = false) => {
    if (!targetId) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        targetId,
        targetType,
        page,
        limit: 10,
        sortBy: newSortBy,
        loadReplies: "false",
      });

      const response = await fetch(
        `${API_BASE}/api/v1/comments/getComments?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (reset || page === 1) {
          setComments(result.data.comments);
          fetchTotalCommentsCount(); // Update total count after fetching comments
        } else {
          setComments((prev) => [...prev, ...result.data.comments]);
        }

        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED: Fetch nested replies với includeNested = true
  const fetchReplies = async (commentId, page = 1) => {
    setRepliesData((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        loading: true,
      },
    }));

    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 5,
        sortBy: "newest",
        includeNested: "true", // ENHANCED: Enable nested replies
      });

      const response = await fetch(
        `${API_BASE}/api/v1/comments/replies/${commentId}?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();

        setRepliesData((prev) => ({
          ...prev,
          [commentId]: {
            replies:
              page === 1
                ? result.data.replies
                : [...(prev[commentId]?.replies || []), ...result.data.replies],
            pagination: result.data.pagination,
            loading: false,
          },
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải phản hồi:", error);
      setRepliesData((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          loading: false,
        },
      }));
    }
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    if (newSort !== sortBy) {
      setSortBy(newSort);
    }
  };

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/comments/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          targetType,
          content: newComment,
          isAnonymous,
        }),
      });

      if (response.ok) {
        setNewComment("");
        setIsAnonymous(false);
        fetchComments(1, sortBy, true);
        fetchTotalCommentsCount(); // Update total count
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId) => {
    const replyContent = getReplyContent(parentId);
    const isReplyAnonymous = getReplyAnonymousState(parentId);

    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/comments/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          targetType,
          content: replyContent,
          parentCommentId: parentId,
          isAnonymous: isReplyAnonymous,
        }),
      });

      if (response.ok) {
        setReplyContent(parentId, "");
        setReplyAnonymousState(parentId, false);
        setReplyingTo(null);
        clearReplyData(parentId);
        activeReplyRef.current = null;

        // Refresh replies and update total count
        await fetchReplies(parentId, 1);
        fetchTotalCommentsCount(); // Update total count
        setShowReplies((prev) => ({
          ...prev,
          [parentId]: true,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment function
  const handleDeleteComment = async (commentId) => {
    setDeletingComment(commentId);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/comments/delete/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );

        setRepliesData((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((parentId) => {
            if (updated[parentId]?.replies) {
              updated[parentId].replies = updated[parentId].replies.filter(
                (reply) => reply._id !== commentId
              );
            }
          });
          return updated;
        });

        // Clean up states
        clearReplyData(commentId);
        if (replyingTo === commentId) {
          setReplyingTo(null);
          activeReplyRef.current = null;
        }

        fetchTotalCommentsCount(); // Update total count
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Có lỗi xảy ra khi xóa bình luận");
      }
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      alert("Có lỗi xảy ra khi xóa bình luận");
    } finally {
      setDeletingComment(null);
    }
  };

  // Like/Unlike comment
  const handleLikeComment = async (commentId, isLiked) => {
    try {
      const endpoint = isLiked
        ? `${API_BASE}/api/v1/comments/unLike`
        : `${API_BASE}/api/v1/comments/like`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        const result = await response.json();
        updateCommentCounts(
          commentId,
          result.data.likeCount,
          result.data.dislikeCount,
          !isLiked,
          false
        );
      }
    } catch (error) {
      console.error("Lỗi khi like bình luận:", error);
    }
  };

  // Dislike/Undislike comment
  const handleDislikeComment = async (commentId, isDisliked) => {
    try {
      const endpoint = isDisliked
        ? `${API_BASE}/api/v1/comments/unDisLike`
        : `${API_BASE}/api/v1/comments/disLike`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });
      if (response.ok) {
        const result = await response.json();
        updateCommentCounts(
          commentId,
          result.data.likeCount,
          result.data.dislikeCount,
          false,
          !isDisliked
        );
      }
    } catch (error) {
      console.error("Lỗi khi dislike bình luận:", error);
    }
  };

  // ENHANCED: Update comment counts in nested structure
  const updateCommentCounts = (
    commentId,
    likeCount,
    dislikeCount,
    isLiked,
    isDisliked
  ) => {
    // Update main comments
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? { ...comment, likeCount, dislikeCount, isLiked, isDisliked }
          : comment
      )
    );

    // Update nested replies recursively
    const updateNestedReplies = (replies) => {
      return replies.map((reply) => {
        if (reply._id === commentId) {
          return { ...reply, likeCount, dislikeCount, isLiked, isDisliked };
        }
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          return {
            ...reply,
            nestedReplies: updateNestedReplies(reply.nestedReplies),
          };
        }
        return reply;
      });
    };

    setRepliesData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((parentId) => {
        if (updated[parentId]?.replies) {
          updated[parentId].replies = updateNestedReplies(
            updated[parentId].replies
          );
        }
      });
      return updated;
    });
  };

  // Toggle replies visibility
  const toggleReplies = (commentId) => {
    const isShowing = showReplies[commentId];

    if (!isShowing) {
      if (!repliesData[commentId]) {
        fetchReplies(commentId, 1);
      }
    }

    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // ENHANCED: Toggle nested replies
  const toggleNestedReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Load more replies
  const loadMoreReplies = (commentId) => {
    const currentData = repliesData[commentId];
    if (currentData?.pagination?.hasNextPage) {
      fetchReplies(commentId, currentData.pagination.currentPage + 1);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    if (pagination?.hasNextPage && !loading) {
      fetchComments(pagination.currentPage + 1, sortBy, false);
    }
  };

  // SIMPLIFIED: Handle cancel reply - just clear without confirmation
  const handleCancelReply = useCallback(() => {
    if (!replyingTo) return;

    const currentReplyingTo = replyingTo;
    setReplyContent(currentReplyingTo, "");
    setReplyAnonymousState(currentReplyingTo, false);
    clearReplyData(currentReplyingTo);
    setReplyingTo(null);
    activeReplyRef.current = null;
  }, [replyingTo, setReplyContent, setReplyAnonymousState, clearReplyData]);

  // Handle reply button click
  const handleReplyClick = useCallback(
    (commentId) => {
      if (replyingTo && replyingTo !== commentId) {
        handleCancelReply(); // Clear existing reply without confirmation
      }
      setReplyingTo(commentId);
    },
    [replyingTo, handleCancelReply]
  );

  // Handle main textarea interaction
  const handleMainTextareaInteraction = useCallback((e) => {
    e.stopPropagation();

    if (activeReplyRef.current) {
      e.preventDefault();
      e.target.blur();

      const activeReplyTextarea = replyTextareaRefs.current.get(
        activeReplyRef.current
      );
      if (activeReplyTextarea) {
        setTimeout(() => {
          activeReplyTextarea.focus();
        }, 0);
      }
      return false;
    }
  }, []);

  // SIMPLIFIED: Handle click outside - clear text immediately without confirmation
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!replyingTo) return;

      // Clear any existing timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      // Set a timeout to prevent immediate trigger
      clickTimeoutRef.current = setTimeout(() => {
        const replyForm = document.querySelector(
          `[data-reply-id="${replyingTo}"]`
        );
        const mainForm = document.querySelector(".new-comment-form");

        if (
          replyForm &&
          !replyForm.contains(event.target) &&
          !mainForm?.contains(event.target) &&
          !event.target.closest(".comment-actions") &&
          !event.target.closest(".action-btn")
        ) {
          // Simply clear reply without confirmation
          const currentReplyingTo = replyingTo;
          setReplyContent(currentReplyingTo, "");
          setReplyAnonymousState(currentReplyingTo, false);
          clearReplyData(currentReplyingTo);
          setReplyingTo(null);
          activeReplyRef.current = null;
        }
      }, 150); // Delay to prevent immediate trigger
    };

    if (replyingTo) {
      document.addEventListener("click", handleClickOutside, true);
      return () => {
        document.removeEventListener("click", handleClickOutside, true);
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
      };
    }
  }, [replyingTo, setReplyContent, setReplyAnonymousState, clearReplyData]);

  // ENHANCED: Recursive component để render nested replies
  const NestedReplies = ({
    replies,
    parentComment,
    depth = 0,
    maxDepth = 3,
  }) => {
    if (!replies || replies.length === 0 || depth > maxDepth) {
      return null;
    }

    return (
      <div className={`nested-replies depth-${depth}`}>
        {replies.map((reply) => (
          <div key={reply._id} className="nested-reply-item">
            <CommentItem
              comment={reply}
              isReply={true}
              parentComment={parentComment}
              depth={depth}
            />

            {/* Render nested replies recursively */}
            {reply.nestedReplies && reply.nestedReplies.length > 0 && (
              <div className="nested-replies-container">
                {expandedReplies[reply._id] ? (
                  <NestedReplies
                    replies={reply.nestedReplies}
                    parentComment={reply}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                  />
                ) : (
                  <button
                    onClick={() => toggleNestedReplies(reply._id)}
                    className="show-nested-replies-btn"
                  >
                    <FaChevronDown />
                    Xem {reply.nestedRepliesCount} phản hồi con
                  </button>
                )}

                {expandedReplies[reply._id] &&
                  reply.nestedReplies.length > 0 && (
                    <button
                      onClick={() => toggleNestedReplies(reply._id)}
                      className="hide-nested-replies-btn"
                    >
                      <FaChevronUp />
                      Ẩn phản hồi con
                    </button>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ENHANCED: Comment Item Component với nested support
  const CommentItem = ({
    comment,
    isReply = false,
    parentComment = null,
    depth = 0,
  }) => {
    const displayName = getDisplayName(comment);
    const avatar = getDisplayAvatar(comment);

    const hasReplies = comment.repliesCount > 0;
    const replies = repliesData[comment._id]?.replies || [];
    const repliesPagination = repliesData[comment._id]?.pagination;
    const repliesLoading = repliesData[comment._id]?.loading || false;

    return (
      <div
        className={`comment-item ${
          isReply ? "comment-reply" : ""
        } depth-${depth}`}
      >
        {isReply && <div className="comment-connector"></div>}

        <div className="comment-avatar">
          <img src={avatar} alt={displayName} className="avatar-img" />
        </div>

        <div className="comment-content">
          <div className="comment-bubble">
            <div className="comment-header">
              <span className="comment-author">{displayName}</span>
              {comment.privateInfoUser?.isAnonymous === true && (
                <FaUserSecret className="anonymous-icon" />
              )}
              {isReply && parentComment && (
                <span className="reply-to">
                  → {getDisplayName(parentComment)}
                </span>
              )}
              {depth > 0 && (
                <span className="depth-indicator">Cấp {depth + 1}</span>
              )}
            </div>
            <p className="comment-text">{comment.content}</p>
          </div>

          <div className="comment-actions">
            <span className="comment-time">
              {formatTime(comment.createdAt)}
            </span>

            <button
              onClick={() => handleLikeComment(comment._id, comment.isLiked)}
              className={`action-btn like-btn ${
                comment.isLiked ? "active" : ""
              }`}
              disabled={!currentUser}
            >
              <FaHeart />
              <span>{comment.likeCount || 0}</span>
            </button>

            <button
              onClick={() =>
                handleDislikeComment(comment._id, comment.isDisliked)
              }
              className={`action-btn dislike-btn ${
                comment.isDisliked ? "active" : ""
              }`}
              disabled={!currentUser}
            >
              <FaThumbsDown />
              <span>{comment.dislikeCount || 0}</span>
            </button>

            {currentUser &&
              depth < 3 && ( // Limit reply depth
                <button
                  onClick={() => handleReplyClick(comment._id)}
                  className="action-btn reply-btn"
                >
                  <FaReply />
                  <span>Phản hồi</span>
                </button>
              )}

            {canDeleteComment(comment) && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="action-btn delete-btn"
                disabled={deletingComment === comment._id}
              >
                {deletingComment === comment._id ? (
                  <FaSpinner className="fa-spin" />
                ) : (
                  <FaTrash />
                )}
                <span>Xóa</span>
              </button>
            )}

            {hasReplies && !isReply && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="action-btn toggle-replies-btn"
              >
                {showReplies[comment._id] ? <FaChevronUp /> : <FaChevronDown />}
                {showReplies[comment._id] ? "Ẩn" : "Xem"} {comment.repliesCount}{" "}
                phản hồi
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && currentUser && (
            <div className="reply-form" data-reply-id={comment._id}>
              <img
                src={currentUser?.avatar || "https://via.placeholder.com/32"}
                alt="Avatar"
                className="reply-avatar"
              />
              <div className="reply-input-container">
                <div className="reply-textarea-wrapper">
                  <UncontrolledTextarea
                    commentId={comment._id}
                    placeholder={`Phản hồi ${displayName}...`}
                    className="reply-textarea"
                    rows="2"
                    autoFocus={true}
                    onTextareaReady={registerTextarea}
                    onFocus={(e) => {
                      e.stopPropagation();
                      activeReplyRef.current = comment._id;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                  <button
                    onClick={() => handleSubmitReply(comment._id)}
                    className="reply-send-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <FaSpinner className="fa-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </div>
                <div className="reply-controls">
                  <label className="anonymous-checkbox">
                    <input
                      type="checkbox"
                      checked={getReplyAnonymousState(comment._id)}
                      onChange={(e) =>
                        setReplyAnonymousState(comment._id, e.target.checked)
                      }
                    />
                    {getReplyAnonymousState(comment._id) ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                    Phản hồi ẩn danh
                  </label>
                  <button
                    onClick={handleCancelReply}
                    className="cancel-reply-btn"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ENHANCED: Show replies with nested support */}
          {showReplies[comment._id] && (
            <div className="replies-container">
              {repliesLoading && replies.length === 0 && (
                <div className="replies-loading">
                  <FaSpinner className="fa-spin" />
                  <span>Đang tải phản hồi...</span>
                </div>
              )}

              {/* Direct replies */}
              {replies.map((reply) => (
                <div key={reply._id} className="reply-wrapper">
                  <CommentItem
                    comment={reply}
                    isReply={true}
                    parentComment={comment}
                    depth={depth + 1}
                  />

                  {/* Nested replies */}
                  {reply.nestedReplies && reply.nestedReplies.length > 0 && (
                    <div className="nested-replies-section">
                      {expandedReplies[reply._id] ? (
                        <NestedReplies
                          replies={reply.nestedReplies}
                          parentComment={reply}
                          depth={depth + 2}
                          maxDepth={3}
                        />
                      ) : (
                        <button
                          onClick={() => toggleNestedReplies(reply._id)}
                          className="show-nested-replies-btn"
                        >
                          <FaChevronDown />
                          Xem {reply.nestedRepliesCount} phản hồi con
                        </button>
                      )}

                      {expandedReplies[reply._id] && (
                        <button
                          onClick={() => toggleNestedReplies(reply._id)}
                          className="hide-nested-replies-btn"
                        >
                          <FaChevronUp />
                          Ẩn phản hồi con
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {repliesPagination?.hasNextPage && (
                <button
                  onClick={() => loadMoreReplies(comment._id)}
                  className="load-more-replies-btn"
                  disabled={repliesLoading}
                >
                  {repliesLoading ? (
                    <>
                      <FaSpinner className="fa-spin" />
                      Đang tải...
                    </>
                  ) : (
                    `Xem thêm phản hồi (${
                      repliesPagination.totalReplies - replies.length
                    })`
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="comment-component">
      <div className="comment-header-section">
        <div className="comment-title-row">
          <h3 className="comment-title">
            Bình luận ({totalCommentsCount || 0})
          </h3>

          <div className="comment-sort">
            <FaSort />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="mostLiked">Nhiều like nhất</option>
            </select>
          </div>
        </div>

        {currentUser ? (
          <div className="new-comment-form">
            <img
              src={currentUser?.avatar || "https://via.placeholder.com/40"}
              alt="Avatar"
              className="new-comment-avatar"
            />
            <div className="new-comment-input-container">
              <div className="new-comment-textarea-wrapper">
                <textarea
                  ref={mainTextareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="new-comment-textarea"
                  rows="3"
                  onFocus={handleMainTextareaInteraction}
                  onClick={handleMainTextareaInteraction}
                />
                <button
                  onClick={handleSubmitComment}
                  className="new-comment-send-btn"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    <FaSpinner className="fa-spin" />
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </div>
              <div className="new-comment-controls">
                <label className="anonymous-checkbox">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  {isAnonymous ? <FaEyeSlash /> : <FaEye />}
                  Bình luận ẩn danh
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="login-prompt">
            <p>Vui lòng đăng nhập để bình luận</p>
          </div>
        )}
      </div>

      <div className="comment-list">
        {loading && comments.length === 0 ? (
          <div className="comments-loading">
            <FaSpinner className="fa-spin" />
            <p>Đang tải bình luận...</p>
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}

            {pagination?.hasNextPage && (
              <button
                onClick={loadMoreComments}
                className="load-more-comments-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="fa-spin" />
                    Đang tải...
                  </>
                ) : (
                  `Xem thêm bình luận (${
                    pagination.totalComments - comments.length
                  })`
                )}
              </button>
            )}
          </>
        ) : (
          <div className="no-comments">
            <FaUser className="no-comments-icon" />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmDeleteCmt}
        onClose={() => setConfirmDeleteCmt(false)}
        onConfirm={handleDeleteComment}
        title="Xóa danh mục tin tức"
        message={`Bạn đồng ý xóa danh mục`}
      />
    </div>
  );
};

export default CommentComponent;
