import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import './App.css';

// "App" now handles the routing for our application.
function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Default Route: Redirect to Login */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
