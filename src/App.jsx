// App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import HabitCircles from './pages/HabitCircles';
import CircleChat from './pages/CircleChat';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Chatbot from './pages/ChatBot';

function App() {
  console.log('App.jsx: Rendering Routes');
  const location = useLocation();

  // hide chatbot on login & signup pages
const hideChatbot = ["/", "/login", "/signup", "/LandingPage"].includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes with Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/circles" element={<HabitCircles />} />
        </Route>

        <Route path="/circles/:id/chat" element={<CircleChat />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ✅ Only show chatbot if not on login/signup */}
      {!hideChatbot && <Chatbot />}
    </>
  );
}

export default App;
