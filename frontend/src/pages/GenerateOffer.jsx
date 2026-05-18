import { useState, useEffect } from 'react';
import API from '../api';

function GenerateOffer() {
  const [candidates, setCandidates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    candidate_id: '', template_id: '', salary: '', joining_date: ''
  });
  const [preview, setPreview] = useState('');
  const [offerId, setOfferId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/candidates').then((res) => setCandidates(res.data));
    API.get('/templates').then((res) => setTemplates(res.data));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await API.post('/offers', {
        ...form,
        candidate_id: Number(form.candidate_id),
        template_id: Number(form.template_id),
        salary: Number(form.salary),
      });
      setPreview(res.data.generatedHtml);
      setOfferId(res.data.offerId);
      setMessage('Offer generated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate offer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await API.get(`/offers/${offerId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `offer_${offerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download PDF.');
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">Generate Offer Letter</h1>

          {message && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{message}</div>}
          {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Candidate</label>
            <select
              value={form.candidate_id}
              onChange={(e) => setForm({ ...form, candidate_id: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Select Candidate --</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Template</label>
            <select
              value={form.template_id}
              onChange={(e) => setForm({ ...form, template_id: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Select Template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Salary (per annum)</label>
            <input
              type="number"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              placeholder="e.g. 50000"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Joining Date</label>
            <input
              type="date"
              value={form.joining_date}
              onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 font-semibold"
          >
            {loading ? 'Generating...' : 'Generate Offer'}
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Offer Preview</h2>
              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              >
                Download PDF
              </button>
            </div>
            <div
              className="border rounded p-6 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerateOffer;