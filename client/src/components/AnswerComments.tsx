import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Edit, Trash2, Send, X, Check } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface AnswerCommentsProps {
  answerId: string;
  comments: Comment[];
  onCommentsUpdate: () => void;
}

const AnswerComments: React.FC<AnswerCommentsProps> = ({
  answerId,
  comments,
  onCommentsUpdate
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await axios.post(`/api/answers/${answerId}/comments`, {
        content: commentContent
      });

      if (response.data.success) {
        toast.success('Comment added successfully!');
        setCommentContent('');
        setShowCommentForm(false);
        onCommentsUpdate();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add comment';
      toast.error(message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Please enter content to edit');
      return;
    }

    try {
      const response = await axios.put(`/api/answers/${answerId}/comments/${commentId}`, {
        content: editContent
      });

      if (response.data.success) {
        toast.success('Comment updated successfully!');
        setEditingComment(null);
        setEditContent('');
        onCommentsUpdate();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update comment';
      toast.error(message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/answers/${answerId}/comments/${commentId}`);
      if (response.data.success) {
        toast.success('Comment deleted successfully!');
        onCommentsUpdate();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete comment';
      toast.error(message);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </h4>
        {isAuthenticated && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showCommentForm ? 'Cancel' : 'Add Comment'}
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write your comment..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {commentContent.length}/500 characters
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCommentForm(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={submittingComment || !commentContent.trim()}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {comment.author.profile?.firstName && comment.author.profile?.lastName
                        ? `${comment.author.profile.firstName} ${comment.author.profile.lastName}`
                        : comment.author.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs text-gray-500">(edited)</span>
                    )}
                  </div>
                  
                  {editingComment === comment._id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={2}
                        maxLength={500}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {editContent.length}/500 characters
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={cancelEditing}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  )}
                </div>
                
                {/* Edit/Delete buttons for comment author */}
                {user?._id === comment.author._id && editingComment !== comment._id && (
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => startEditing(comment)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit comment"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnswerComments; 