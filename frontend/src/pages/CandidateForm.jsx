import { useState } from 'react';
import API from '../api';

function CandidateForm() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    designation: '', department: '', source: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await API.post('/candidates', form);
      setMessage('Candidate added successfully!');
      setForm({ full_name: '', email: '', phone: '', designation: '', department: '', source: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add candidate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Add New Candidate</h1>

        {message && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

        {[
          { label: 'Full Name', name: 'full_name', type: 'text', placeholder: 'John Doe' },
          { label: 'Email', name: 'email', type: 'email', placeholder: 'john@example.com' },
          { label: 'Phone', name: 'phone', type: 'text', placeholder: '9876543210' },
          { label: 'Designation', name: 'designation', type: 'text', placeholder: 'Software Engineer' },
          { label: 'Department', name: 'department', type: 'text', placeholder: 'Engineering' },
          { label: 'Source', name: 'source', type: 'text', placeholder: 'LinkedIn' },
        ].map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 font-semibold"
        >
          {loading ? 'Adding...' : 'Add Candidate'}
        </button>
      </div>
    </div>
  );
}

export default CandidateForm;