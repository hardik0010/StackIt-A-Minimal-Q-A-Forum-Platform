import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, MessageSquare, ThumbsUp, User as UserIcon, Calendar, Lock, Eye, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGuestActions } from '../hooks/useGuestActions';
import VoteButtons from '../components/VoteButtons';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  tags: string[];
  answers: any[];
  upvotes: number;
  downvotes: number;
  voteCount: number;
  views: number;
  createdAt: string;
  userVote?: 'upvote' | 'downvote' | null;
}

const PublicDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { handleGuestAction, requireAuth } = useGuestActions();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/questions');
      console.log('API Response:', response.data); // Debug log
      
      // Handle the correct API response structure
      if (response.data.success && response.data.data && response.data.data.questions) {
        setQuestions(response.data.data.questions);
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]); // Ensure questions is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = Array.isArray(questions) ? questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (question.tags && question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  ) : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleVoteChange = (questionId: string, newVoteCount: number, newUserVote: 'upvote' | 'downvote' | null) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(question => 
        question._id === questionId 
          ? { ...question, voteCount: newVoteCount, userVote: newUserVote }
          : question
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading questions..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Guest Notice Banner */}
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Eye className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-blue-800">
                      You're browsing as a guest
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        You can view questions and search content. To ask questions, vote, comment, or access all features, please{' '}
                        <Link to="/signup" className="font-medium underline hover:text-blue-600">
                          create an account
                        </Link>{' '}
                        or{' '}
                        <Link to="/login" className="font-medium underline hover:text-blue-600">
                          sign in
                        </Link>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to StackIt
              </h2>
              <p className="text-gray-600 mb-4">
                A community-driven platform for developers to ask questions, share knowledge, and learn from each other.
              </p>
              {!isAuthenticated && (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Join the Community
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search questions, tags, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to ask a question!'}
                  </p>
                  {isAuthenticated && (
                    <div className="mt-6">
                      <Link
                        to="/ask"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ask Question
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div key={question._id} className="bg-white shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex space-x-4">
                      {/* Voting Section */}
                      <div className="flex-shrink-0">
                        <VoteButtons
                          itemId={question._id}
                          itemType="question"
                          initialVoteCount={question.voteCount || 0}
                          userVote={question.userVote || null}
                          onVoteChange={(newVoteCount, newUserVote) => 
                            handleVoteChange(question._id, newVoteCount, newUserVote)
                          }
                        />
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Link
                            to={`/question/${question._id}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {question.title}
                          </Link>
                          {question.answers && question.answers.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {question.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                          {question.content.length > 200 && '...'}
                        </p>

                        {/* Tags */}
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {question.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta Information */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              <span>
                                {question.author?.profile?.firstName && question.author?.profile?.lastName
                                  ? `${question.author.profile.firstName} ${question.author.profile.lastName}`
                                  : question.author?.username || 'Anonymous'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(question.createdAt || new Date().toISOString())}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{question.views || 0} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicDashboard; 