import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './layouts/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import UploadPaper from './pages/UploadPaper';
import PapersTable from './pages/PapersTable';
import { AuthProvider } from './contexts/AuthContext';

import Login from './pages/Login';
import Settings from './pages/Settings';

// Stub components for remaining pages
const Unauthorized403 = () => <div className="p-8">403 Unauthorized</div>;

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized403 />} />
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<ProtectedRoute allowedRoles={['Professor', 'Administrator', 'Exam Centre']} />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Professor']} />}>
          <Route path="/upload" element={<UploadPaper />} />
          <Route path="/my-papers" element={<PapersTable />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
          <Route path="/approvals" element={<PapersTable />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Exam Centre']} />}>
          <Route path="/downloads" element={<PapersTable />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
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
