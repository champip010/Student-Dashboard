import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import ClassForm from './pages/ClassForm';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import AssignmentForm from './pages/AssignmentForm';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import TestForm from './pages/TestForm';
import Analytics from './pages/Analytics';
import ResearchTracker from './pages/ResearchTracker';
import CustomDashboard from './pages/CustomDashboard';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="classes" element={<Classes />} />
        <Route path="classes/new" element={<ClassForm />} />
        <Route path="classes/:id" element={<ClassDetail />} />
        <Route path="classes/:id/edit" element={<ClassForm />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="assignments/new" element={<AssignmentForm />} />
        <Route path="assignments/:id" element={<AssignmentDetail />} />
        <Route path="assignments/:id/edit" element={<AssignmentForm />} />
        <Route path="tests" element={<Tests />} />
        <Route path="tests/new" element={<TestForm />} />
        <Route path="tests/:id" element={<TestDetail />} />
        <Route path="tests/:id/edit" element={<TestForm />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="research" element={<ResearchTracker />} />
        <Route path="custom-dashboard" element={<CustomDashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;