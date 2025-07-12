import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import Navbar from '../components/Navbar';

const AskQuestion: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.content.replace(/<[^>]*>/g, '').trim().length < 20) {
      toast.error('Question content must be at least 20 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/questions', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags
      });

      if (response.data.success) {
        toast.success('Question posted successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to post question';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ask a Question</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="What's your question? Be specific."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Question Details *
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Provide all the information someone would need to answer your question..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 20 characters. Use the editor to format your question.
                </p>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags *
                </label>
                <TagInput
                  value={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="Add up to 5 tags (e.g., javascript, react, nodejs)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add 1-5 tags to help others find your question
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !formData.title.trim() || !formData.content.trim() || formData.tags.length === 0}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {loading ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AskQuestion; 