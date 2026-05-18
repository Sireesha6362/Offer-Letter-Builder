import { useState, useEffect } from 'react';
import API from '../api';

function TemplateBuilder() {
  const [form, setForm] = useState({ name: '', body_html: '' });
  const [templates, setTemplates] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await API.get('/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await API.post('/templates', form);
      setMessage('Template created successfully!');
      setForm({ name: '', body_html: '' });
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create template.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const insertPlaceholder = (placeholder) => {
    setForm({ ...form, body_html: form.body_html + placeholder });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* Create Template */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">Template Builder</h1>

          {message && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{message}</div>}
          {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Template Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Software Engineer Offer"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Placeholder Buttons */}
          <div className="mb-3">
            <p className="text-sm font-medium mb-2">Insert Placeholder:</p>
            <div className="flex flex-wrap gap-2">
              {['{{name}}', '{{designation}}', '{{department}}', '{{salary}}', '{{doj}}', '{{email}}', '{{phone}}'].map((p) => (
                <button
                  key={p}
                  onClick={() => insertPlaceholder(p)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Template Body (HTML)</label>
            <textarea
              value={form.body_html}
              onChange={(e) => setForm({ ...form, body_html: e.target.value })}
              rows={8}
              placeholder="<h1>Offer Letter</h1><p>Dear {{name}},</p>..."
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
            />
          </div>

          {/* Preview */}
          {form.body_html && (
            <div className="mb-4 border rounded p-4 bg-gray-50">
              <p className="text-sm font-medium mb-2 text-gray-500">Preview:</p>
              <div dangerouslySetInnerHTML={{ __html: form.body_html }} />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 font-semibold"
          >
            {loading ? 'Saving...' : 'Save Template'}
          </button>
        </div>

        {/* Template List */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Saved Templates</h2>
          {templates.length === 0 ? (
            <p className="text-gray-400">No templates yet.</p>
          ) : (
            templates.map((t) => (
              <div key={t.id} className="border rounded p-4 mb-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-400">Version {t.version}</p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-sm"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default TemplateBuilder;