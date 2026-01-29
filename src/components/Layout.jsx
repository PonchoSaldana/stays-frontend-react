import { LogOut, GraduationCap, LayoutDashboard, FileText, CheckSquare, FileCheck, PenTool, Flag, Building, Search, AlertCircle } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import logoUt from '../assets/logo-ut.png';
import Modal from './Modal';
import { useState } from 'react';

export default function Layout({ children, onLogout, user, isAdmin }) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const menuItems = [
    { path: '/estadia/catalogo-empresas', icon: Building, label: 'Catálogo Empresas' },
    { path: '/estadia/seleccion-empresa', icon: Search, label: 'Selección Plaza' },
    { path: '/estadia/documentos-iniciales', icon: FileText, label: '1. Doc. Iniciales' },
    { path: '/estadia/revision-inicial', icon: CheckSquare, label: '2. Revisión 1' },
    { path: '/estadia/generacion-documentos', icon: FileCheck, label: '3. Generación' },
    { path: '/estadia/documentos-finales', icon: FileText, label: '4. Doc. Finales' },
    { path: '/estadia/revision-final', icon: CheckSquare, label: '5. Revisión 2' },
    { path: '/estadia/firma-digital', icon: PenTool, label: '6. Firma Admin' },
    { path: '/estadia/finalizado', icon: Flag, label: '7. Finalizado' },
  ];

  return (
    <div className="layout-container">
      {/* Header - Show if not on login page AND (not admin OR user is in estadia path) */}
      {location.pathname !== '/login' && (!isAdmin || location.pathname.startsWith('/estadia')) && (
        <header className="main-header">
          <div className="header-content">
            <div className="brand">
              <img src={logoUt} alt="UT Tecamachalco" style={{ height: '50px' }} />
              <div className="brand-text">
                <p style={{ marginLeft: '10px' }}>Sistema de Gestión de Estadías</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user && (
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="btn"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', color: '#6b7280', background: '#f3f4f6' }}
                >
                  <LogOut size={16} /> Salir
                </button>
              )}
              {/* Decorative dot */}
              <div style={{ width: 8, height: 8, background: 'var(--ut-orange)', borderRadius: '50%' }}></div>
            </div>
          </div>
        </header>
      )}

      {/* Body Container (Sidebar + Content) */}
      <div className="body-container">
        {(user || location.pathname.startsWith('/estadia')) && (!isAdmin || location.pathname.startsWith('/estadia')) && location.pathname !== '/login' && (
          <aside className="sidebar">

            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
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
