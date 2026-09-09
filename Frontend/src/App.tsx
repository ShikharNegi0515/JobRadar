import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import SavedJobs from './pages/SavedJobs';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import Login from './pages/Login';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/ai-insights" element={
          <ProtectedRoute>
            <Layout>
              <SkillGapAnalysis />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/applications" element={
          <ProtectedRoute>
            <Layout>
              <Applications />
            </Layout>
          </ProtectedRoute>
        } />

        
        <Route path="/saved" element={
          <ProtectedRoute>
            <Layout>
              <SavedJobs />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
