import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './views/AdminDashboard';
import LoginView from './views/LoginView';
import ProcessView from './views/ProcessView';
import StudentCompanyView from './views/StudentCompanyView';
import StudentProfileView from './views/StudentProfileView';

function App() {
  const [userMatricula, setUserMatricula] = useState(localStorage.getItem('ut_user') || null);
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem('ut_admin_session') || 'null'));

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (matricula, userData) => {
    setUserMatricula(matricula);
    localStorage.setItem('ut_user', matricula);
    if (userData) localStorage.setItem('ut_user_data', JSON.stringify(userData));
    navigate('/estadia/catalogo-empresas');
  };

  const handleAdminLogin = (username, password, token, userData) => {
    const session = userData || { username, role: 'ADMIN' };
    setAdminUser(session);
    localStorage.setItem('ut_admin_session', JSON.stringify(session));
    if (token) localStorage.setItem('ut_token', token);
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    setUserMatricula(null);
    setAdminUser(null);
    localStorage.removeItem('ut_user');
    localStorage.removeItem('ut_user_data');
    localStorage.removeItem('ut_admin_session');
    localStorage.removeItem('ut_token');
    navigate('/login');
  };

  // Protected Routes
  const Protected = ({ children }) => {
    if (!userMatricula) return <Navigate to="/login" replace />;
    return children;
  };

  const ProtectedAdmin = ({ children }) => {
    if (!adminUser) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Layout onLogout={handleLogout} user={userMatricula || adminUser} isAdmin={!!adminUser}>
      <Routes>
        <Route path="/login" element={<LoginView onLogin={handleLogin} onAdminLogin={handleAdminLogin} />} />
        <Route path="/" element={<Navigate to={userMatricula ? "/estadia/catalogo-empresas" : (adminUser ? "/admin/dashboard" : "/login")} replace />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />

        {/* Estada Routes - Maps to stages */}
        <Route path="/estadia/catalogo-empresas" element={<Protected><StudentCompanyView mode="catalog" userMatricula={userMatricula} /></Protected>} />
        <Route path="/estadia/seleccion-empresa" element={<Protected><StudentCompanyView mode="selection" userMatricula={userMatricula} /></Protected>} />

        <Route path="/estadia/documentos-iniciales" element={<Protected><ProcessView stageName="upload_1" userMatricula={userMatricula} /></Protected>} />
        <Route path="/estadia/revision-inicial" element={<Protected><ProcessView stageName="check_1" userMatricula={userMatricula} /></Protected>} />
        <Route path="/estadia/generacion-documentos" element={<Protected><ProcessView stageName="generate_1" userMatricula={userMatricula} /></Protected>} />
        <Route path="/estadia/documentos-finales" element={<Protected><ProcessView stageName="upload_2" userMatricula={userMatricula} /></Protected>} />
        <Route path="/estadia/revision-final" element={<Protected><ProcessView stageName="check_2" userMatricula={userMatricula} /></Protected>} />
        <Route path="/estadia/finalizado" element={<Protected><ProcessView stageName="finish" userMatricula={userMatricula} /></Protected>} />
        <Route path="/mi-perfil" element={<Protected><StudentProfileView userMatricula={userMatricula} /></Protected>} />
      </Routes>
    </Layout>
  );
}

export default App;
