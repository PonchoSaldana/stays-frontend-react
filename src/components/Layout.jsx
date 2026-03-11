import { LogOut, User as UserIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoUt from '../assets/logo-ut.png';
import Modal from './Modal';
import { useState } from 'react';

// layout principal que envuelve todas las vistas de alumnos
// maneja el header, el footer y el modal de confirmación de cierre de sesión
export default function Layout({ children, onLogout, user, isAdmin, activeProcess }) {
  // controla la visibilidad del modal de logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // el header no se muestra en la pantalla de login ni en el panel de admin
  const showHeader = location.pathname !== '/login' && (!isAdmin || location.pathname.startsWith('/estadia'));

  // determina si el usuario está en el área de alumnos (no admin, no login)
  const isStudentArea = !isAdmin && location.pathname.startsWith('/estadia') && location.pathname !== '/login';

  // nombres legibles de cada proceso para mostrar en el badge del header
  const PROCESS_LABELS = {
    1: 'Catálogo de Empresas',
    2: 'Selección de Empresa',
    3: 'Entrega de Documentos',
  };

  return (
    <div className="layout-container">
      {/* header superior: visible para alumnos en todas sus vistas */}
      {showHeader && (
        <header className="main-header">
          <div className="header-content">
            {/* logo y nombre del sistema */}
            <div className="brand">
              <img src={logoUt} alt="UT Tecamachalco" style={{ height: '46px' }} />
              <div className="brand-text">
                <p style={{ marginLeft: '10px' }}>Sistema de Gestión de Estadías</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* badge que muestra el proceso activo en el header del alumno */}
              {isStudentArea && activeProcess && (
                <span className="process-badge" style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  borderRadius: '2rem',
                  padding: '0.3rem 0.9rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  {/* punto pulsante para indicar que el proceso está activo */}
                  <span style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  {PROCESS_LABELS[activeProcess]}
                </span>
              )}

              {user && (
                <>
                  {/* botón de perfil del alumno */}
                  <button
                    onClick={() => navigate('/mi-perfil')}
                    className="btn"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', color: '#4b5563', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <UserIcon size={18} />
                    <span className="desktop-label"> Mi Perfil</span>
                  </button>
                  {/* botón de cerrar sesión (abre el modal de confirmación) */}
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="btn"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', color: '#6b7280', background: '#f3f4f6' }}
                  >
                    <LogOut size={16} />
                    <span className="desktop-label"> Salir</span>
                  </button>
                </>
              )}
              {/* punto decorativo con el color naranja institucional */}
              <div style={{ width: 8, height: 8, background: 'var(--ut-orange)', borderRadius: '50%', flexShrink: 0 }}></div>
            </div>
          </div>
        </header>
      )}

      {/* contenido principal: sin sidebar lateral para alumnos */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* pie de página institucional */}
      <footer className="main-footer">
        <div>
          <p>© {new Date().getFullYear()} Universidad Tecnológica de Tecamachalco</p>
          <p>Innovación y Excelencia Tecnológica</p>
        </div>
      </footer>

      {/* modal de confirmación antes de cerrar sesión */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Cerrar Sesión"
        type="danger"
        footer={
          <>
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="btn"
              style={{ background: '#f3f4f6', color: '#374151' }}
            >
              Cancelar
            </button>
            <button
              onClick={() => { setIsLogoutModalOpen(false); onLogout(); }}
              className="btn"
              style={{ background: '#EF4444', color: 'white', border: '1px solid #DC2626' }}
            >
              Cerrar Sesión
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', padding: '1rem 0' }}>
          <div style={{ padding: '1rem', background: '#FEF2F2', borderRadius: '50%', color: '#DC2626' }}>
            <LogOut size={32} />
          </div>
          <p>¿Estás seguro que deseas cerrar tu sesión?</p>
        </div>
      </Modal>
    </div>
  );
}
