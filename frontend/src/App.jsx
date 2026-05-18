import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CandidateForm from './pages/CandidateForm';
import TemplateBuilder from './pages/TemplateBuilder';
import GenerateOffer from './pages/GenerateOffer';
import OfferStatus from './pages/OfferStatus';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Navbar />
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/candidates/new" element={
          <PrivateRoute>
            <Navbar />
            <CandidateForm />
          </PrivateRoute>
        } />
        <Route path="/templates" element={
          <PrivateRoute>
            <Navbar />
            <TemplateBuilder />
          </PrivateRoute>
        } />
        <Route path="/offers/new" element={
          <PrivateRoute>
            <Navbar />
            <GenerateOffer />
          </PrivateRoute>
        } />
        <Route path="/offers/status" element={
          <PrivateRoute>
            <Navbar />
            <OfferStatus />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;