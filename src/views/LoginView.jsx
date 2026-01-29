import React, { useState } from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import logoUt from '../assets/logo-ut.png';


export default function LoginView({ onLogin, onAdminLogin }) {
    const [matricula, setMatricula] = useState('');
    const [loading, setLoading] = useState(false);

    // Lógica para el modo administrador
    const [adminMode, setAdminMode] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');

    // Activa el modo admin al hacer clic 5 veces en el título
    const handleTitleClick = () => {
        setClickCount(prev => prev + 1);
        if (clickCount + 1 === 5) { // 5 clics para activar
            setAdminMode(true);
            setClickCount(0);
        }
    };

    // Maneja el inicio de sesión del alumno
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!matricula) return;
        setLoading(true);
        setTimeout(() => {
            onLogin(matricula);
        }, 1500);
    };

    // Maneja el inicio de sesión del administrador
    const handleAdminSubmit = (e) => {
        e.preventDefault();
        if (!adminUser || !adminPass) return;
        setLoading(true);
        setTimeout(() => {
            // Validación básica aquí o pasar al padre
            onAdminLogin(adminUser, adminPass);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="login-card">
            {/* Left Side - Form */}
            <div className="login-form-section">
                <div className="mb-6">
                    <img src={logoUt} alt="Logo UT Tecamachalco" style={{ height: '80px', marginBottom: '1.5rem', display: 'block' }} />
                    <h2
                        onClick={handleTitleClick}
                        style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem', cursor: 'default', userSelect: 'none' }}
                    >
                        {adminMode ? "Panel Administrativo" : "Bienvenido"}
                    </h2>
                    <p style={{ color: '#6b7280' }}>
                        {adminMode ? "Ingresa tus credenciales de administrador." : "Ingresa tu matrícula para acceder."}
                    </p>
                </div>

                {!adminMode ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Matrícula</label>
                            <input
                                type="text"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                className="input"
                                style={{ fontSize: '1.125rem' }}
                                placeholder="Ej. 20230001"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!matricula || loading}
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '1.125rem' }}
                        >
                            {loading ? (
                                <span>Verificando...</span>
                            ) : (
                                <>
                                    Ingresar
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAdminSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Usuario</label>
                            <input
                                type="text"
                                value={adminUser}
                                onChange={(e) => setAdminUser(e.target.value)}
                                className="input"
                                placeholder="Admin User"
                                autoFocus
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Contraseña</label>
                            <input
                                type="password"
                                value={adminPass}
                                onChange={(e) => setAdminPass(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!adminUser || !adminPass || loading}
                            className="btn"
                            style={{ width: '100%', fontSize: '1.125rem', background: '#374151', color: 'white' }}
                        >
                            {loading ? <span>Accediendo...</span> : <span>Entrar como Admin</span>}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setAdminMode(false); setAdminUser(''); setAdminPass(''); }}
                            style={{ width: '100%', marginTop: '1rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Volver al acceso de alumnos
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>
                        Universidad Tecnológica de Tecamachalco
                    </p>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="login-visual-section" style={{ justifyContent: 'flex-start', gap: '2rem' }}>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tu camino profesional</h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)' }}>Gestiona tu proceso de estadía profesional de manera ágil.</p>
                </div>

                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3].map((step, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.75rem',
                            backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', background: 'var(--ut-orange)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>{step}</div>
                                <p style={{ fontWeight: 500 }}>
                                    {i === 0 ? "Carga tu documentación" : i === 1 ? "Espera aprobación" : "Entrega tu expediente físico"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
