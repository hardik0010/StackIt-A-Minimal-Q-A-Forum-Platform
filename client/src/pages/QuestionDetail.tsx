import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  Eye, 
  Tag,
  CheckCircle,
  Edit,
  Trash2,
  Send,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import VoteButtons from '../components/VoteButtons';
import Navbar from '../components/Navbar';
import RichTextEditor from '../components/RichTextEditor';
import AnswerComments from '../components/AnswerComments';
import { useGuestActions } from '../hooks/useGuestActions';
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

interface Answer {
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
  isAccepted: boolean;
  voteCount: number;
  userVote?: 'upvote' | 'downvote' | null;
  isEdited?: boolean;
  editHistory?: any[];
  comments?: Comment[];
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  tags: string[];
  answers: Answer[];
  voteCount: number;
  userVote?: 'upvote' | 'downvote' | null;
  views: number;
  createdAt: string;
  status: string;
  acceptedAnswer?: string;
}

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { requireAuth } = useGuestActions();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (id) {
      fetchQuestion();
      fetchAnswers();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`/api/questions/${id}`);
      if (response.data.success) {
        setQuestion(response.data.data.question);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
    }
  };

  const fetchAnswers = async () => {
    try {
      const response = await axios.get(`/api/answers/question/${id}`);
      if (response.data.success) {
        setAnswers(response.data.data.answers);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionVoteChange = (newVoteCount: number, newUserVote: 'upvote' | 'downvote' | null) => {
    if (question) {
      setQuestion({ ...question, voteCount: newVoteCount, userVote: newUserVote });
    }
  };

  const handleAnswerVoteChange = (answerId: string, newVoteCount: number, newUserVote: 'upvote' | 'downvote' | null) => {
    setAnswers(prevAnswers => 
      prevAnswers.map(answer => 
        answer._id === answerId 
          ? { ...answer, voteCount: newVoteCount, userVote: newUserVote }
          : answer
      )
    );
  };

  const handleSubmitAnswer = async () => {
    requireAuth('answer questions', async () => {
      if (!answerContent.trim()) {
        toast.error('Please enter an answer');
        return;
      }

      setSubmittingAnswer(true);
      try {
        const response = await axios.post('/api/answers', {
          content: answerContent,
          questionId: id
        });

        if (response.data.success) {
          toast.success('Answer posted successfully!');
          setAnswerContent('');
          setShowAnswerForm(false);
          fetchAnswers(); // Refresh answers
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to post answer';
        toast.error(message);
      } finally {
        setSubmittingAnswer(false);
      }
    });
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const response = await axios.post(`/api/answers/${answerId}/accept`);
      if (response.data.success) {
        toast.success('Answer accepted!');
        fetchAnswers(); // Refresh answers
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to accept answer';
      toast.error(message);
    }
  };

  const handleUnacceptAnswer = async (answerId: string) => {
    try {
      const response = await axios.post(`/api/answers/${answerId}/unaccept`);
      if (response.data.success) {
        toast.success('Answer unaccepted!');
        fetchAnswers(); // Refresh answers
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to unaccept answer';
      toast.error(message);
    }
  };

  const handleEditAnswer = async (answerId: string) => {
    if (!editContent.trim()) {
      toast.error('Please enter content to edit');
      return;
    }

    try {
      const response = await axios.put(`/api/answers/${answerId}`, {
        content: editContent
      });

      if (response.data.success) {
        toast.success('Answer updated successfully!');
        setEditingAnswer(null);
        setEditContent('');
        fetchAnswers(); // Refresh answers
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update answer';
      toast.error(message);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/answers/${answerId}`);
      if (response.data.success) {
        toast.success('Answer deleted successfully!');
        fetchAnswers(); // Refresh answers
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete answer';
      toast.error(message);
    }
  };

  const startEditing = (answer: Answer) => {
    setEditingAnswer(answer._id);
    setEditContent(answer.content);
  };

  const cancelEditing = () => {
    setEditingAnswer(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading question..." />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Question not found</h2>
            <p className="text-gray-600 mt-2">The question you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isQuestionAuthor = user?._id === question.author._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto py-6 px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Questions
          </Link>
        </div>

        {/* Question */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-6">
            <div className="flex space-x-4">
              {/* Voting Section */}
              <div className="flex-shrink-0">
                <VoteButtons
                  itemId={question._id}
                  itemType="question"
                  initialVoteCount={question.voteCount}
                  userVote={question.userVote || null}
                  onVoteChange={handleQuestionVoteChange}
                />
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
                  {isQuestionAuthor && (
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div 
                  className="prose max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>
                        {question.author.profile?.firstName && question.author.profile?.lastName
                          ? `${question.author.profile.firstName} ${question.author.profile.lastName}`
                          : question.author.username}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(question.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{question.views || 0} views</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{answers.length} answer{answers.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {answers.length} Answer{answers.length !== 1 ? 's' : ''}
              </h2>
              {isAuthenticated && (
                <button
                  onClick={() => setShowAnswerForm(!showAnswerForm)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {showAnswerForm ? 'Cancel' : 'Post Answer'}
                </button>
              )}
            </div>

            {/* Answer Form */}
            {showAnswerForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Answer</h3>
                <RichTextEditor
                  value={answerContent}
                  onChange={setAnswerContent}
                  placeholder="Write your answer here... Use the toolbar above to format your text, add links, images, and more."
                />
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !answerContent.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingAnswer ? 'Posting...' : 'Post Answer'}
                  </button>
                  <button
                    onClick={() => setShowAnswerForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Answers List */}
            {answers.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No answers yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isAuthenticated ? 'Be the first to answer this question!' : 'Sign in to answer this question.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {answers.map((answer) => (
                  <div key={answer._id} className={`border rounded-lg p-4 ${
                    answer.isAccepted 
                      ? 'border-green-200 bg-green-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex space-x-4">
                      {/* Voting Section */}
                      <div className="flex-shrink-0">
                        <VoteButtons
                          itemId={answer._id}
                          itemType="answer"
                          initialVoteCount={answer.voteCount}
                          userVote={answer.userVote || null}
                          onVoteChange={(newVoteCount, newUserVote) => 
                            handleAnswerVoteChange(answer._id, newVoteCount, newUserVote)
                          }
                        />
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {answer.isAccepted && (
                              <div className="flex items-center" title="Accepted answer">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600 ml-1">Accepted</span>
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {answer.author.profile?.firstName && answer.author.profile?.lastName
                                ? `${answer.author.profile.firstName} ${answer.author.profile.lastName}`
                                : answer.author.username}
                            </span>
                            {answer.isEdited && (
                              <span className="text-xs text-gray-500">(edited)</span>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {isQuestionAuthor && (
                              <>
                                {answer.isAccepted ? (
                                  <button
                                    onClick={() => handleUnacceptAnswer(answer._id)}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Unaccept
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAcceptAnswer(answer._id)}
                                    className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Accept
                                  </button>
                                )}
                              </>
                            )}
                            
                            {/* Edit/Delete buttons for answer author */}
                            {user?._id === answer.author._id && (
                              <>
                                {editingAnswer === answer._id ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditAnswer(answer._id)}
                                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => startEditing(answer)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAnswer(answer._id)}
                                      className="text-gray-400 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Answer Content - Show editor if editing, otherwise show formatted content */}
                        {editingAnswer === answer._id ? (
                          <div className="mb-4">
                            <RichTextEditor
                              value={editContent}
                              onChange={setEditContent}
                              placeholder="Edit your answer..."
                            />
                          </div>
                        ) : (
                          <div 
                            className="prose max-w-none mb-4"
                            dangerouslySetInnerHTML={{ __html: answer.content }}
                          />
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(answer.createdAt)}</span>
                          </div>
                        </div>

                        {/* Comments Section */}
                        <AnswerComments
                          answerId={answer._id}
                          comments={answer.comments || []}
                          onCommentsUpdate={fetchAnswers}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionDetail; 