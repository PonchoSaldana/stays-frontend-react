import { LogOut, GraduationCap, LayoutDashboard, FileText, CheckSquare, FileCheck, PenTool, Flag, Building, Search, AlertCircle, User as UserIcon, Menu, X } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logoUt from '../assets/logo-ut.png';
import Modal from './Modal';
import { useState } from 'react';

export default function Layout({ children, onLogout, user, isAdmin }) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/estadia/catalogo-empresas', icon: Building, label: 'Catálogo Empresas' },
    { path: '/estadia/seleccion-empresa', icon: Search, label: 'Selección Plaza' },
    { path: '/estadia/documentos-iniciales', icon: FileText, label: '1. Doc. Iniciales' },
    { path: '/estadia/revision-inicial', icon: CheckSquare, label: '2. Revisión 1' },
    { path: '/estadia/generacion-documentos', icon: FileCheck, label: '3. Generación' },
    { path: '/estadia/documentos-finales', icon: FileText, label: '4. Doc. Finales' },
    { path: '/estadia/revision-final', icon: CheckSquare, label: '5. Revisión 2' },
    { path: '/estadia/finalizado', icon: Flag, label: '7. Finalizado' },
  ];

  const showHeader = location.pathname !== '/login' && (!isAdmin || location.pathname.startsWith('/estadia'));
  const showSidebar = (user || location.pathname.startsWith('/estadia')) &&
    (!isAdmin || location.pathname.startsWith('/estadia')) &&
    location.pathname !== '/login';

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout-container">
      {/* Sidebar overlay (móvil) */}
      {showSidebar && (
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={closeSidebar}
        />
      )}

      {/* Header */}
      {showHeader && (
        <header className="main-header">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Hamburger – only show if there is a sidebar */}
              {showSidebar && (
                <button
                  className="hamburger-btn"
                  onClick={() => setIsSidebarOpen(prev => !prev)}
                  aria-label="Abrir menú"
                >
                  {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}
              <div className="brand">
                <img src={logoUt} alt="UT Tecamachalco" style={{ height: '46px' }} />
                <div className="brand-text">
                  <p style={{ marginLeft: '10px' }}>Sistema de Gestión de Estadías</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user && (
                <>
                  <button
                    onClick={() => navigate('/mi-perfil')}
                    className="btn"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', color: '#4b5563', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <UserIcon size={18} />
                    <span className="desktop-label"> Mi Perfil</span>
                  </button>
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
              {/* Decorative dot */}
              <div style={{ width: 8, height: 8, background: 'var(--ut-orange)', borderRadius: '50%', flexShrink: 0 }}></div>
            </div>
          </div>
        </header>
      )}

      {/* Body Container (Sidebar + Content) */}
      <div className="body-container">
        {showSidebar && (
          <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            {/* Close button inside sidebar on mobile */}
            <button
              className="hamburger-btn"
              onClick={closeSidebar}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>

            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="main-footer">
        <div>
          <p>© {new Date().getFullYear()} Universidad Tecnológica de Tecamachalco</p>
          <p>Innovación y Excelencia Tecnológica</p>
        </div>
      </footer>

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
