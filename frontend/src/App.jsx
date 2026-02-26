import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Pop-up notifications
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HirerDashboard from './pages/dashboard/HirerDashboard';
import WorkerDashboard from './pages/dashboard/WorkerDashboard';
import './App.css';

// "App" now handles the routing for our application.
function App() {
  return (
    <Router>
      {/* Toaster is placed here so it can show messages anywhere in the app */}
      <Toaster position="top-right" />

      <div className="app-container">
        <Routes>
          {/* Default Route: Redirect to Login */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard Routes - Protected by logic in Login/Register for now */}
          <Route path="/hirer/dashboard" element={<HirerDashboard />} />
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
