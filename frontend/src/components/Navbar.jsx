import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">📄 Offer Letter Builder</div>
      <div className="flex gap-6">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/candidates/new" className="hover:underline">Add Candidate</Link>
        <Link to="/templates" className="hover:underline">Templates</Link>
        <Link to="/offers/new" className="hover:underline">Generate Offer</Link>
        <Link to="/offers/status" className="hover:underline">Manage Status</Link>
        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;