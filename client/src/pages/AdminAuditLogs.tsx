import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`/api/admin/audit-logs?page=${page}&limit=50`);
      setLogs(response.data.data.logs);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return 'text-red-600';
    if (action.includes('edit')) return 'text-yellow-600';
    if (action.includes('ban')) return 'text-red-600';
    if (action.includes('login')) return 'text-green-600';
    return 'text-blue-600';
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      
      <div className="space-y-2">
        {logs.map((log: any) => (
          <div key={log._id} className="border p-3 rounded text-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className={`font-medium ${getActionColor(log.action)}`}>
                  {log.action.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className="text-gray-600 ml-2">by {log.actor?.username}</span>
                {log.details && (
                  <div className="text-gray-500 mt-1">
                    {Object.entries(log.details).map(([key, value]: [string, any]) => (
                      <span key={key} className="mr-4">
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-gray-500 text-xs">
                {new Date(log.createdAt).toLocaleString()}
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

export default AdminAuditLogs; 