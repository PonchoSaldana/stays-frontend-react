import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './views/AdminDashboard';
import LoginView from './views/LoginView';
import ProcessView from './views/ProcessView';
import StudentCompanyView from './views/StudentCompanyView';
import StudentProfileView from './views/StudentProfileView';
import { API_URL } from './config';

// ── ProtectedProcess: reevalúa el proceso activo en cada render ──
// si el admin cambia el proceso, el alumno es redirigido automáticamente
// al proceso correcto (a través de /estadia/inicio).
function ProtectedProcess({ children, requiredProcess, userMatricula, activeProcess, processLoaded }) {
  // sin sesión → login
  if (!userMatricula) return <Navigate to="/login" replace />;
  // esperar a que el backend confirme el proceso antes de decidir
  if (!processLoaded) return null;
  // proceso correcto → mostrar contenido
  if (Number(activeProcess) === Number(requiredProcess)) return children;
  
  // cualquier otro caso (proceso incorrecto, o no hay proceso activo) → redirigir al inicio 
  // (el inicio re-evaluará de forma inteligente a dónde mandarnos)
  return <Navigate to="/estadia/inicio" replace />;
}

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
      const res = await fetch(`${API_URL}/config/process`);
      if (res.ok) {
        const data = await res.json();
        setActiveProcess(data.activeProcess);
        setProcessLoaded(true);
      }
    } catch {
      // si falla la conexión, desbloquear igualmente para no quedar en pantalla vacía
      setProcessLoaded(true);
    }
  };

  useEffect(() => {
    fetchActiveProcess();
    // refresca cada 5 segundos para reflejar cambios de proceso casi en tiempo real
    const interval = setInterval(fetchActiveProcess, 5000);
    return () => clearInterval(interval);
  }, []);

  // guarda la sesión del alumno tras el login y redirige al área de estadías
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

  // guarda simple: requiree alumno autenticado
  const Protected = ({ children }) => {
    if (!userMatricula) return <Navigate to="/login" replace />;
    return children;
  };

  // guarda simple: requiere admin autenticado
  const ProtectedAdmin = ({ children }) => {
    if (!adminUser) return <Navigate to="/login" replace />;
    return children;
  };

  // helper para reducir verbosidad en el JSX de rutas con ProtectedProcess
  const PP = ({ rp, children }) => (
    <ProtectedProcess
      requiredProcess={rp}
      userMatricula={userMatricula}
      activeProcess={activeProcess}
      processLoaded={processLoaded}
    >
      {children}
    </ProtectedProcess>
  );

  return (
    <Layout onLogout={handleLogout} user={userMatricula || adminUser} isAdmin={!!adminUser} activeProcess={activeProcess}>
      <Routes>
        {/* pantalla de login compartida para alumnos y admins */}
        <Route path="/login" element={<LoginView onLogin={handleLogin} onAdminLogin={handleAdminLogin} />} />
        {/* redirección raíz según tipo de sesión */}
        <Route path="/" element={<Navigate to={userMatricula ? "/estadia/inicio" : (adminUser ? "/admin/dashboard" : "/login")} replace />} />

        {/* panel de administración */}
        <Route path="/admin/dashboard" element={<ProtectedAdmin><AdminDashboard onProcessChange={setActiveProcess} /></ProtectedAdmin>} />

        {/* proceso 1: catálogo de empresas */}
        <Route path="/estadia/catalogo-empresas" element={<PP rp={1}><StudentCompanyView mode="catalog" userMatricula={userMatricula} /></PP>} />

        {/* proceso 2: selección de empresa */}
        <Route path="/estadia/seleccion-empresa" element={<PP rp={2}><StudentCompanyView mode="selection" userMatricula={userMatricula} /></PP>} />

        {/* proceso 3: entrega de documentos — múltiples sub-etapas */}
        <Route path="/estadia/documentos-iniciales" element={<PP rp={3}><ProcessView stageName="upload_1" userMatricula={userMatricula} /></PP>} />
        <Route path="/estadia/revision-inicial" element={<PP rp={3}><ProcessView stageName="check_1" userMatricula={userMatricula} /></PP>} />
        <Route path="/estadia/generacion-documentos" element={<PP rp={3}><ProcessView stageName="generate_1" userMatricula={userMatricula} /></PP>} />
        <Route path="/estadia/documentos-finales" element={<PP rp={3}><ProcessView stageName="upload_2" userMatricula={userMatricula} /></PP>} />
        <Route path="/estadia/revision-final" element={<PP rp={3}><ProcessView stageName="check_2" userMatricula={userMatricula} /></PP>} />
        <Route path="/estadia/finalizado" element={<PP rp={3}><ProcessView stageName="finish" userMatricula={userMatricula} /></PP>} />

        {/* redirección inteligente al entrar al área de alumnos según el proceso activo */}
        <Route path="/estadia/inicio" element={
          <Protected>
            {!processLoaded ? null :
              Number(activeProcess) === 1 ? <Navigate to="/estadia/catalogo-empresas" replace /> :
                Number(activeProcess) === 2 ? <Navigate to="/estadia/seleccion-empresa" replace /> :
                  Number(activeProcess) === 3 ? <Navigate to="/estadia/documentos-iniciales" replace /> :
                    <NoProcessView />}
          </Protected>
        } />

        {/* ruta legacy de espera, redirige a inicio para centralizar la lógica de procesos */}
        <Route path="/estadia/sin-proceso" element={
          <Protected><Navigate to="/estadia/inicio" replace /></Protected>
        } />

        {/* perfil del alumno */}
        <Route path="/mi-perfil" element={<Protected><StudentProfileView userMatricula={userMatricula} /></Protected>} />
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
