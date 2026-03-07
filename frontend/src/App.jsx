import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HirerLayout from './layouts/HirerLayout';
import HirerDashboard from './pages/dashboard/HirerDashboard';
import PostJob from './pages/dashboard/PostJob';
import ManageJobs from './pages/dashboard/ManageJobs';
import MyWorkers from './pages/dashboard/MyWorkers';
import PaymentHistory from './pages/dashboard/PaymentHistory';
import FreelancerLayout from './layouts/FreelancerLayout';
import FreelancerDashboard from './pages/freelancerDashboard/FreelancerDashboard';
import FindWork from './pages/freelancerDashboard/FindWork';
import MyApplications from './pages/freelancerDashboard/MyApplications';
import ActiveTasks from './pages/freelancerDashboard/ActiveTasks';
import Earnings from './pages/freelancerDashboard/Earnings';
import FreelancerProfile from './pages/freelancerDashboard/FreelancerProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* redirect to register */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* auth routes */}
        <Route path="/login" element={<div className="app-container"><Login /></div>} />
        <Route path="/register" element={<div className="app-container"><Register /></div>} />

        {/* hirer routes with sidebar layout */}
        <Route path="/hirer" element={<HirerLayout />}>
          <Route path="dashboard" element={<HirerDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="workers" element={<MyWorkers />} />
          <Route path="payments" element={<PaymentHistory />} />
        </Route>

        {/* freelancer/worker routes with sidebar layout */}
        <Route path="/worker" element={<FreelancerLayout />}>
          <Route path="dashboard" element={<FreelancerDashboard />} />
          <Route path="find-work" element={<FindWork />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="active-tasks" element={<ActiveTasks />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="profile" element={<FreelancerProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
