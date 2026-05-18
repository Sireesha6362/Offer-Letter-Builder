import { useEffect, useState } from 'react';
import API from '../api';

function Dashboard() {
  const [counts, setCounts] = useState({ drafts: 0, sent: 0, accepted: 0, rejected: 0 });
  const [recent, setRecent] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    API.get('/offers/dashboard')
      .then((res) => {
        setCounts(res.data.counts);
        setRecent(res.data.recentActivity);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user.name}! 👋</h1>
      <p className="text-gray-500 mb-6">Here's your offer letter overview</p>

      {/* Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-100 p-4 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-yellow-600">{counts.drafts || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Drafts</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-blue-600">{counts.sent || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Sent</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-green-600">{counts.accepted || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Accepted</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-red-600">{counts.rejected || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Rejected</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="text-gray-400">No recent activity yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Candidate</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{item.full_name}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${item.status === 'Accepted' ? 'bg-green-100 text-green-600' :
                        item.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                        item.status === 'Sent' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2">{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;