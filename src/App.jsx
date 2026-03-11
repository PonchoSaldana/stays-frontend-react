import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './views/AdminDashboard';
import LoginView from './views/LoginView';
import ProcessView from './views/ProcessView';
import StudentCompanyView from './views/StudentCompanyView';
import StudentProfileView from './views/StudentProfileView';
import { API_URL } from './config';

function App() {
  // matrícula del alumno logueado (guardada en sessionStorage para sobrevivir recargas)
  const [userMatricula, setUserMatricula] = useState(sessionStorage.getItem('ut_user') || null);
  // datos del admin logueado; null si no hay sesión de admin activa
  const [adminUser, setAdminUser] = useState(JSON.parse(sessionStorage.getItem('ut_admin_session') || 'null'));
  // proceso activo configurado por root: null | 1 | 2 | 3
  const [activeProcess, setActiveProcess] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // consulta el proceso activo desde el backend (endpoint público, sin token)
  const fetchActiveProcess = async () => {
    try {
      const res = await fetch(`${API_URL}/config/process`);
      if (res.ok) {
        const data = await res.json();
        setActiveProcess(data.activeProcess);
      }
    } catch {
      // si no hay conexión, mantener null (no bloquea la app)
    }
  };

  useEffect(() => {
    fetchActiveProcess();
    // refresca cada 30 segundos para que los alumnos vean cambios sin recargar manualmente
    const interval = setInterval(fetchActiveProcess, 30000);
    return () => clearInterval(interval);
  }, []);

  // guarda la sesión del alumno en state y sessionStorage tras el login
  const handleLogin = (matricula, userData) => {
    setUserMatricula(matricula);
    sessionStorage.setItem('ut_user', matricula);
    if (userData) sessionStorage.setItem('ut_user_data', JSON.stringify(userData));
    navigate('/estadia/inicio');
  };

  // guarda la sesión del administrador tras el login
  const handleAdminLogin = (username, password, token, userData) => {
    const session = userData || { username, role: 'ADMIN' };
    setAdminUser(session);
    sessionStorage.setItem('ut_admin_session', JSON.stringify(session));
    if (token) sessionStorage.setItem('ut_token', token);
    navigate('/admin/dashboard');
  };

  // limpia toda la sesión y redirige al login
  const handleLogout = () => {
    setUserMatricula(null);
    setAdminUser(null);
    sessionStorage.removeItem('ut_user');
    sessionStorage.removeItem('ut_user_data');
    sessionStorage.removeItem('ut_admin_session');
    sessionStorage.removeItem('ut_token');
    navigate('/login');
  };

  // guarda protegida: redirige al login si el alumno no está autenticado
  const Protected = ({ children }) => {
    if (!userMatricula) return <Navigate to="/login" replace />;
    return children;
  };

  // guarda protegida para rutas de admin
  const ProtectedAdmin = ({ children }) => {
    if (!adminUser) return <Navigate to="/login" replace />;
    return children;
  };

  // guarda protegida que verifica el proceso activo
  // redirige a sin-proceso si el proceso requerido no está activo
  const ProtectedProcess = ({ children, requiredProcess }) => {
    if (!userMatricula) return <Navigate to="/login" replace />;
    if (activeProcess !== requiredProcess) return <Navigate to="/estadia/sin-proceso" replace />;
    return children;
  };

  return (
    <Layout onLogout={handleLogout} user={userMatricula || adminUser} isAdmin={!!adminUser} activeProcess={activeProcess}>
      <Routes>
        {/* pantalla de login (alumnos y admins) */}
        <Route path="/login" element={<LoginView onLogin={handleLogin} onAdminLogin={handleAdminLogin} />} />
        {/* redirige al inicio según el tipo de sesión activa */}
        <Route path="/" element={<Navigate to={userMatricula ? "/estadia/inicio" : (adminUser ? "/admin/dashboard" : "/login")} replace />} />

        {/* panel de administración */}
        <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard onProcessChange={setActiveProcess} /></ProtectedAdmin>} />

        {/* proceso 1: catálogo de empresas */}
        <Route path="/estadia/catalogo-empresas" element={
          <ProtectedProcess requiredProcess={1}>
            <StudentCompanyView mode="catalog" userMatricula={userMatricula} />
          </ProtectedProcess>
        } />

        {/* proceso 2: selección de empresa */}
        <Route path="/estadia/seleccion-empresa" element={
          <ProtectedProcess requiredProcess={2}>
            <StudentCompanyView mode="selection" userMatricula={userMatricula} />
          </ProtectedProcess>
        } />

        {/* proceso 3: entrega de documentos (varias sub-etapas) */}
        <Route path="/estadia/documentos-iniciales" element={
          <ProtectedProcess requiredProcess={3}>
            <ProcessView stageName="upload_1" userMatricula={userMatricula} />
          </ProtectedProcess>
        } />
        <Route path="/estadia/revision-inicial" element={
          <ProtectedProcess requiredProcess={3}>
            <ProcessView stageName="check_1" userMatricula={userMatricula} />
          </ProtectedProcess>
        } />
        <Route path="/estadia/generacion-documentos" element={
          <ProtectedProcess requiredProcess={3}>
            <ProcessView stageName="generate_1" userMatricula={userMatricula} />
          </ProtectedProcess>
        } />
        <Route path="/estadia/documentos-finales" element={
          <ProtectedProcess requiredProcess={3}>
            <ProcessView stageName="upload_2" userMatricula={userMatricula} />
          </ProtectedProcess>
        } />
        <Route path="/estadia/revision-final" element={
          <ProtectedProcess requiredProcess={3}>
            <ProcessView stageName="check_2" userMatricula={userMatricula} />
          </ProtectedProcess>
        } />
        <Route path="/estadia/finalizado" element={
          <ProtectedProcess requiredProcess={3}>
            <ProcessView stageName="finish" userMatricula={userMatricula} />
          </ProtectedProcess>
        } />

        {/* redirección inteligente según el proceso activo al entrar al área de alumnos */}
        <Route path="/estadia/inicio" element={
          <Protected>
            {activeProcess === 1 ? <Navigate to="/estadia/catalogo-empresas" replace /> :
              activeProcess === 2 ? <Navigate to="/estadia/seleccion-empresa" replace /> :
                activeProcess === 3 ? <Navigate to="/estadia/documentos-iniciales" replace /> :
                  <NoProcessView />}
          </Protected>
        } />

        {/* vista de espera cuando no hay proceso activo o el alumno intenta acceder a uno diferente */}
        <Route path="/estadia/sin-proceso" element={
          <Protected>
            <NoProcessView />
          </Protected>
        } />

        {/* perfil del alumno */}
        <Route path="/mi-perfil" element={<Protected><StudentProfileView userMatricula={userMatricula} /></Protected>} />
      </Routes>
    </Layout>
  );
}

// vista de espera cuando root no ha activado ningún proceso todavía
function NoProcessView() {
  return (
    <div className="no-process-view">
      <div className="no-process-emoji">⏳</div>
      <h2 className="no-process-title">Sin proceso activo</h2>
      <p className="no-process-body">
        Actualmente no hay ningún proceso de estadía habilitado.
        El departamento de estadías te notificará cuando se abra el siguiente proceso.
      </p>
    </div>
  );
}

export default App;
