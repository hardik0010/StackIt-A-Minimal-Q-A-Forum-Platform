import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAnnouncements: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/admin/announcements');
      setAnnouncements(response.data.data.announcements);
    } catch (error) {
      toast.error('Failed to load announcements');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/admin/announcements', { title, message });
      toast.success('Announcement sent to all users!');
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Send Announcement</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Announcement title"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Announcement message"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send to All Users'}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
        <div className="space-y-4">
          {announcements.map((announcement: any) => (
            <div key={announcement._id} className="border p-4 rounded">
              <h3 className="font-semibold">{announcement.title}</h3>
              <p className="text-gray-600 mt-1">{announcement.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Sent by {announcement.createdBy?.username} on {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements; 