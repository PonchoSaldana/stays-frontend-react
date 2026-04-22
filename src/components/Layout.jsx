import { LogOut, User as UserIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoUt from '../assets/logo-ut.png';
import Modal from './Modal';
import { useState } from 'react';

// layout principal que envuelve todas las vistas de alumnos
export default function Layout({ children, onLogout, user, isAdmin, activeProcess }) {
  // controla la visibilidad del modal de logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // el header no se muestra en la pantalla de login ni en el panel de admin
  const showHeader = location.pathname !== '/login' && (!isAdmin || location.pathname.startsWith('/estadia'));

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
              {/* punto indicador de proceso activo: verde = proceso activo, naranja = sin proceso */}
              <div
                title={activeProcess ? `Proceso ${activeProcess} activo` : 'Sin proceso activo'}
                style={{
                  width: 10,
                  height: 10,
                  background: activeProcess ? '#22c55e' : 'var(--ut-orange)',
                  borderRadius: '50%',
                  flexShrink: 0,
                  boxShadow: activeProcess ? '0 0 0 0 rgba(34,197,94,0.5)' : 'none',
                  animation: activeProcess ? 'dot-pulse 2s ease-in-out infinite' : 'none',
                  transition: 'background 0.4s ease, box-shadow 0.4s ease',
                }}
              />
            </div>
          </div>
        </header>
      )}

      {/* contenido principal: sin sidebar lateral para alumnos */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showHeader && (
        <div className="demo-nav-bar" style={{ background: 'white', padding: '0.65rem 1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', alignItems: 'center', whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb', boxShadow: 'var(--shadow-sm)', zIndex: 40, position: 'relative', WebkitOverflowScrolling: 'touch' }}>
            <strong style={{ color: 'var(--ut-green)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
              Gestía Demo
            </strong>
            <button onClick={() => navigate('/estadia/catalogo-empresas')} className="nav-item" style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', background: location.pathname.includes('catalogo') ? 'var(--ut-light-green)' : 'white' }}>Catálogo</button>
            <button onClick={() => navigate('/estadia/seleccion-empresa')} className="nav-item" style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', background: location.pathname.includes('seleccion') ? 'var(--ut-light-green)' : 'white' }}>Selección</button>
            <div style={{ width: '1px', height: '24px', background: '#d1d5db', margin: '0 0.25rem' }}></div>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 500, marginRight: '0.25rem' }}>Docs:</span>
            <button onClick={() => navigate('/estadia/documentos-iniciales')} className="nav-item" style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', background: location.pathname.includes('iniciales') ? 'var(--ut-light-green)' : 'white' }}>1. Subir</button>
            <button onClick={() => navigate('/estadia/revision-inicial')} className="nav-item" style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', background: location.pathname === '/estadia/revision-inicial' ? 'var(--ut-light-green)' : 'white' }}>Rev. 1</button>
            <button onClick={() => navigate('/estadia/generacion-documentos')} className="nav-item" style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', background: location.pathname.includes('generacion') ? 'var(--ut-light-green)' : 'white' }}>Generar</button>
            <button onClick={() => navigate('/estadia/documentos-finales')} className="nav-item" style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', background: location.pathname.includes('finales') ? 'var(--ut-light-green)' : 'white' }}>4. Finales</button>
            <button onClick={() => navigate('/estadia/revision-final')} className="nav-item" style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', background: location.pathname === '/estadia/revision-final' ? 'var(--ut-light-green)' : 'white' }}>Rev. 2</button>
            <button onClick={() => navigate('/estadia/finalizado')} className="nav-item" style={{ padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', background: location.pathname.includes('finalizado') ? 'var(--ut-light-green)' : 'white' }}>Fin</button>
        </div>
        )}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* pie de página institucional */}
      <footer className="main-footer">
        <div>
          <p> {new Date().getFullYear()} Universidad Tecnológica de Tecamachalco</p>
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
