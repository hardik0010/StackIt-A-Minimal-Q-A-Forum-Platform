import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuestions();
  }, [page, search]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (search) params.append('search', search);
      
      const response = await axios.get(`/api/admin/questions?${params}`);
      setQuestions(response.data.data.questions);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await axios.delete(`/api/admin/questions/${id}`);
      toast.success('Question deleted');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Manage Questions</h1>
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-4">
        {questions.map((question: any) => (
          <div key={question._id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{question.title}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  by {question.author?.username} • {new Date(question.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mt-2 line-clamp-2">{question.content}</p>
              </div>
              <div className="ml-4 space-x-2">
                <button
                  onClick={() => handleDelete(question._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions; 