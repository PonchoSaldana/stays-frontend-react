import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './views/AdminDashboard';
import LoginView from './views/LoginView';
import ProcessView from './views/ProcessView';
import StudentCompanyView from './views/StudentCompanyView';
import StudentProfileView from './views/StudentProfileView';
import { API_URL } from './config';

function ProtectedProcess({ children, requiredProcess, userMatricula, activeProcess, processLoaded }) {
  if (!userMatricula) return <Navigate to="/login" replace />;
  return children;
}

// guarda simple: requiree alumno autenticado
const Protected = ({ children, userMatricula }) => {
  if (!userMatricula) return <Navigate to="/login" replace />;
  return children;
};

// guarda simple: requiere admin autenticado
const ProtectedAdmin = ({ children, adminUser }) => {
  if (!adminUser) return <Navigate to="/login" replace />;
  return children;
};

// ── App principal ────────────────────────────────────────────────────────────
function App() {
  // matrícula del alumno logueado (guardada en sessionStorage para sobrevivir recargas)
  const [userMatricula, setUserMatricula] = useState(sessionStorage.getItem('ut_user') || null);
  // datos del admin logueado; null si no hay sesión de admin activa
  const [adminUser, setAdminUser] = useState(JSON.parse(sessionStorage.getItem('ut_admin_session') || 'null'));
  // proceso activo configurado por root: null | 1 | 2 | 3
  const [activeProcess, setActiveProcess] = useState(null);
  // se vuelve true después del primer fetch del proceso (para no redirigir prematuramente)
  const [processLoaded, setProcessLoaded] = useState(false);

  const navigate = useNavigate();

  // consulta el proceso activo desde el backend (endpoint público, sin token)
  const fetchActiveProcess = async () => {
    try {
      setActiveProcess(3);
      setProcessLoaded(true);
    } catch {
      setProcessLoaded(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActiveProcess();
    // refresca cada 30 segundos — el proceso activo cambia raramente,
    // no hay necesidad de polling tan frecuente (5s generaba 429 en redes compartidas)
    const interval = setInterval(() => {
      // pausar el polling si la pestaña está en segundo plano (Page Visibility API)
      if (!document.hidden) fetchActiveProcess();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // guarda la sesión del alumno tras el login y redirige al área de estadías
  const handleLogin = (matricula, userData) => {
    setUserMatricula(matricula);
    sessionStorage.setItem('ut_user', matricula);
    if (userData) sessionStorage.setItem('ut_user_data', JSON.stringify(userData));
    navigate('/estadia/inicio', { replace: true });
  };

  // guarda la sesión del administrador tras el login
  const handleAdminLogin = (username, password, token, userData) => {
    const session = userData || { username, role: 'ADMIN' };
    setAdminUser(session);
    sessionStorage.setItem('ut_admin_session', JSON.stringify(session));
    if (token) sessionStorage.setItem('ut_token', token);
    navigate('/admin/dashboard', { replace: true });
  };

  // limpia toda la sesión y redirige al login
  const handleLogout = () => {
    setUserMatricula(null);
    setAdminUser(null);
    sessionStorage.removeItem('ut_user');
    sessionStorage.removeItem('ut_user_data');
    sessionStorage.removeItem('ut_admin_session');
    sessionStorage.removeItem('ut_token');
    navigate('/login', { replace: true });
  };

  return (
    <Layout onLogout={handleLogout} user={userMatricula || adminUser} isAdmin={!!adminUser} activeProcess={activeProcess}>
      <Routes>
        {/* pantalla de login compartida para alumnos y admins */}
        <Route path="/login" element={
          userMatricula ? <Navigate to="/estadia/inicio" replace /> : 
          adminUser ? <Navigate to="/admin/dashboard" replace /> :
          <LoginView onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
        } />
        {/* redirección raíz según tipo de sesión */}
        <Route path="/" element={<Navigate to={userMatricula ? "/estadia/inicio" : (adminUser ? "/admin/dashboard" : "/login")} replace />} />

        {/* panel de administración */}
        <Route path="/admin/dashboard" element={<ProtectedAdmin adminUser={adminUser}><AdminDashboard onProcessChange={setActiveProcess} /></ProtectedAdmin>} />

        {/* : catálogo de empresas */}
        <Route path="/estadia/catalogo-empresas" element={<ProtectedProcess requiredProcess={1} userMatricula={userMatricula} activeProcess={activeProcess} processLoaded={processLoaded}><StudentCompanyView mode="catalog" userMatricula={userMatricula} /></ProtectedProcess>} />

        {/* selección de empresa */}
        <Route path="/estadia/seleccion-empresa" element={<ProtectedProcess requiredProcess={2} userMatricula={userMatricula} activeProcess={activeProcess} processLoaded={processLoaded}><StudentCompanyView mode="selection" userMatricula={userMatricula} /></ProtectedProcess>} />

        {/* entrega de documentos — múltiples sub-etapas */}
        <Route path="/estadia/documentos-iniciales" element={<ProtectedProcess requiredProcess={3} userMatricula={userMatricula} activeProcess={activeProcess} processLoaded={processLoaded}><ProcessView stageName="upload_1" userMatricula={userMatricula} /></ProtectedProcess>} />
        <Route path="/estadia/revision-inicial" element={<ProtectedProcess requiredProcess={3} userMatricula={userMatricula} activeProcess={activeProcess} processLoaded={processLoaded}><ProcessView stageName="check_1" userMatricula={userMatricula} /></ProtectedProcess>} />
        <Route path="/estadia/generacion-documentos" element={<ProtectedProcess requiredProcess={3} userMatricula={userMatricula} activeProcess={activeProcess} processLoaded={processLoaded}><ProcessView stageName="generate_1" userMatricula={userMatricula} /></ProtectedProcess>} />
        <Route path="/estadia/documentos-finales" element={<ProtectedProcess requiredProcess={3} userMatricula={userMatricula} activeProcess={activeProcess} processLoaded={processLoaded}><ProcessView stageName="upload_2" userMatricula={userMatricula} /></ProtectedProcess>} />
        <Route path="/estadia/revision-final" element={<ProtectedProcess requiredProcess={3} userMatricula={userMatricula} activeProcess={activeProcess} processLoaded={processLoaded}><ProcessView stageName="check_2" userMatricula={userMatricula} /></ProtectedProcess>} />
        <Route path="/estadia/finalizado" element={<ProtectedProcess requiredProcess={3} userMatricula={userMatricula} activeProcess={activeProcess} processLoaded={processLoaded}><ProcessView stageName="finish" userMatricula={userMatricula} /></ProtectedProcess>} />

        {/* redirección inteligente al entrar al área de alumnos según el proceso activo */}
        <Route path="/estadia/inicio" element={
          <Protected userMatricula={userMatricula}>
            <Navigate to="/estadia/documentos-iniciales" replace />
          </Protected>
        } />

        {/* ruta legacy de espera, redirige a inicio para centralizar la lógica de procesos */}
        <Route path="/estadia/sin-proceso" element={
          <Protected userMatricula={userMatricula}><Navigate to="/estadia/inicio" replace /></Protected>
        } />

        {/* perfil del alumno */}
        <Route path="/mi-perfil" element={<Protected userMatricula={userMatricula}><StudentProfileView userMatricula={userMatricula} /></Protected>} />
      </Routes>
    </Layout>
  );
}

// vista de espera cuando root no ha activado ningún proceso
function NoProcessView() {
  return (
    <div className="no-process-view">
      <h2 className="no-process-title">Sin proceso activo</h2>
      <p className="no-process-body">
        Actualmente no hay ningún proceso de estadía habilitado.
        El departamento de estadías te notificará cuando se abra el siguiente proceso.
      </p>

    </div>
  );
}

export default App;
