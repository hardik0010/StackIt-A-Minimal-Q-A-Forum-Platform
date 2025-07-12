import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FlaggedQuestion {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  flags: Array<{
    user: {
      _id: string;
      username: string;
    };
    reason: string;
    description: string;
    createdAt: string;
  }>;
  createdAt: string;
}

interface FlaggedAnswer {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  question: {
    _id: string;
    title: string;
  };
  flags: Array<{
    user: {
      _id: string;
      username: string;
    };
    reason: string;
    description: string;
    createdAt: string;
  }>;
  createdAt: string;
}

const AdminFlagged: React.FC = () => {
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestion[]>([]);
  const [flaggedAnswers, setFlaggedAnswers] = useState<FlaggedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFlaggedContent();
  }, [activeTab, currentPage]);

  const fetchFlaggedContent = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        type: activeTab
      });

      const response = await axios.get(`/api/admin/flagged?${params}`);
      
      if (response.data.success) {
        if (activeTab === 'questions') {
          setFlaggedQuestions(response.data.data.flaggedQuestions);
        } else {
          setFlaggedAnswers(response.data.data.flaggedAnswers);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load flagged content');
      console.error('Fetch flagged content error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveFlag = async (contentType: 'question' | 'answer', contentId: string, action: string) => {
    try {
      const response = await axios.post(`/api/admin/flags/${contentType}/${contentId}/resolve`, {
        action,
        reason: `Resolved by admin - ${action}`
      });

      if (response.data.success) {
        toast.success('Flag resolved successfully');
        fetchFlaggedContent();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resolve flag';
      toast.error(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'spam': return 'bg-red-100 text-red-800';
      case 'inappropriate': return 'bg-orange-100 text-orange-800';
      case 'offensive': return 'bg-purple-100 text-purple-800';
      case 'duplicate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flagged Content</h1>
              <p className="mt-1 text-sm text-gray-500">
                Review and resolve flagged questions and answers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('questions');
                  setCurrentPage(1);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Flagged Questions ({flaggedQuestions.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('answers');
                  setCurrentPage(1);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'answers'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Flagged Answers ({flaggedAnswers.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'questions' ? (
                  flaggedQuestions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No flagged questions found.</p>
                    </div>
                  ) : (
                    flaggedQuestions.map((question) => (
                      <div key={question._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {question.title}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {truncateText(question.content)}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>By: {question.author.username}</span>
                              <span>Posted: {formatDate(question.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Flags ({question.flags.length})</h4>
                          <div className="space-y-3">
                            {question.flags.map((flag, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(flag.reason)}`}>
                                        {flag.reason}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        by {flag.user.username}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {formatDate(flag.createdAt)}
                                      </span>
                                    </div>
                                    {flag.description && (
                                      <p className="text-sm text-gray-600">{flag.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleResolveFlag('question', question._id, 'remove')}
                              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Remove Flags
                            </button>
                            <button
                              onClick={() => handleResolveFlag('question', question._id, 'warn')}
                              className="px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                              Warn Author
                            </button>
                            <button
                              onClick={() => handleResolveFlag('question', question._id, 'delete')}
                              className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete Question
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  flaggedAnswers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No flagged answers found.</p>
                    </div>
                  ) : (
                    flaggedAnswers.map((answer) => (
                      <div key={answer._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Answer to: {answer.question.title}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {truncateText(answer.content)}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>By: {answer.author.username}</span>
                              <span>Posted: {formatDate(answer.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Flags ({answer.flags.length})</h4>
                          <div className="space-y-3">
                            {answer.flags.map((flag, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(flag.reason)}`}>
                                        {flag.reason}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        by {flag.user.username}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {formatDate(flag.createdAt)}
                                      </span>
                                    </div>
                                    {flag.description && (
                                      <p className="text-sm text-gray-600">{flag.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleResolveFlag('answer', answer._id, 'remove')}
                              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Remove Flags
                            </button>
                            <button
                              onClick={() => handleResolveFlag('answer', answer._id, 'warn')}
                              className="px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                              Warn Author
                            </button>
                            <button
                              onClick={() => handleResolveFlag('answer', answer._id, 'delete')}
                              className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete Answer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFlagged; 