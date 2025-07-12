import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState([]);
  const [tags, setTags] = useState([]);
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingValue, setNewSettingValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, tagsRes] = await Promise.all([
        axios.get('/api/admin/settings'),
        axios.get('/api/admin/tags')
      ]);
      setSettings(settingsRes.data.data.settings);
      setTags(tagsRes.data.data.tags);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSettingKey.trim() || !newSettingValue.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await axios.post('/api/admin/settings', {
        key: newSettingKey,
        value: newSettingValue
      });
      toast.success('Setting added');
      setNewSettingKey('');
      setNewSettingValue('');
      fetchData();
    } catch (error) {
      toast.error('Failed to add setting');
    }
  };

  const handleDeleteTag = async (tag: string) => {
    if (!confirm(`Remove tag "${tag}" from all questions?`)) return;
    
    try {
      await axios.delete(`/api/admin/tags/${tag}`);
      toast.success('Tag removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove tag');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
      
      {/* Site Settings */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Add Setting</h2>
        <form onSubmit={handleAddSetting} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSettingKey}
            onChange={(e) => setNewSettingKey(e.target.value)}
            placeholder="Setting key"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            value={newSettingValue}
            onChange={(e) => setNewSettingValue(e.target.value)}
            placeholder="Setting value"
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Add
          </button>
        </form>

        <div className="space-y-2">
          {settings.map((setting: any) => (
            <div key={setting._id} className="border p-3 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{setting.key}</span>
                  <span className="text-gray-600 ml-2">= {setting.value}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(setting.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag Management */}
      <div>
        <h2 className="text-xl font-bold mb-4">Tag Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {tags.map((tag: any) => (
            <div key={tag._id} className="border p-2 rounded flex justify-between items-center">
              <span className="text-sm">{tag._id}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">({tag.count})</span>
                <button
                  onClick={() => handleDeleteTag(tag._id)}
                  className="text-red-500 text-xs hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 