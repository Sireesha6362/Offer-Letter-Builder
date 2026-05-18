import { useState, useEffect } from 'react';
import API from '../api';

function OfferStatus() {
  const [offers, setOffers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOffers = async () => {
    try {
      const res = await API.get('/offers');
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleStatusChange = async (id, currentStatus, newStatus, remark) => {
    setMessage('');
    setError('');
    try {
      await API.patch(`/offers/${id}/status`, { status: newStatus, remark });
      setMessage(`Status updated to "${newStatus}" successfully!`);
      fetchOffers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const getNextStatuses = (current) => {
    const transitions = {
      Draft: ['Sent'],
      Sent: ['Accepted', 'Rejected'],
      Accepted: [],
      Rejected: [],
    };
    return transitions[current] || [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      case 'Sent': return 'bg-blue-100 text-blue-600';
      default: return 'bg-yellow-100 text-yellow-600';
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Manage Offer Status</h1>

        {message && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

        {offers.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-gray-400">
            No offers found.
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow p-6 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-lg">{offer.full_name}</p>
                  <p className="text-sm text-gray-400">{offer.candidate_email}</p>
                  <p className="text-sm text-gray-400">Template: {offer.template_name}</p>
                  <p className="text-sm text-gray-400">
                    Salary: ₹{offer.salary} | Joining: {new Date(offer.joining_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(offer.status)}`}>
                  {offer.status}
                </span>
              </div>

              {/* Status Buttons */}
              <div className="flex gap-2 flex-wrap">
                {getNextStatuses(offer.status).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusChange(offer.id, offer.status, nextStatus, '')}
                    className={`px-4 py-2 rounded text-sm font-semibold
                      ${nextStatus === 'Accepted' ? 'bg-green-500 text-white hover:bg-green-600' :
                        nextStatus === 'Rejected' ? 'bg-red-500 text-white hover:bg-red-600' :
                        'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Mark as {nextStatus}
                  </button>
                ))}
                {getNextStatuses(offer.status).length === 0 && (
                  <p className="text-sm text-gray-400 italic">No further status changes allowed.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OfferStatus;