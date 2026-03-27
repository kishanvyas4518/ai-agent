import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BotSetup from './pages/BotSetup';
import Tester from './pages/Tester';
import Home from './pages/Home';
import OpenAPI from './pages/OpenAPI';
import AiAssistant from './pages/AiAssistant';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen w-screen overflow-hidden bg-[#09090b] text-slate-200 selection:bg-[#10b981] selection:text-white relative">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#10b981]/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 w-full h-full overflow-hidden">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            <Route
              path="/home"
              element={<ProtectedRoute><Home /></ProtectedRoute>}
            />
            <Route
              path="/openapi"
              element={<ProtectedRoute><OpenAPI /></ProtectedRoute>}
            />
            <Route
              path="/ai-assistant"
              element={<ProtectedRoute><AiAssistant /></ProtectedRoute>}
            />
            <Route
              path="/knowledge/:agentId"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/setup"
              element={<ProtectedRoute><BotSetup /></ProtectedRoute>}
            />
            <Route
              path="/tester"
              element={<ProtectedRoute><Tester /></ProtectedRoute>}
            />
            <Route path="/" element={<Navigate to="/home" />} />
          </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
