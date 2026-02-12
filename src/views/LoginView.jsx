import React, { useState } from 'react';
import { ArrowRight, GraduationCap, Mail, Lock, ShieldCheck, ArrowLeft, Key } from 'lucide-react';
import logoUt from '../assets/logo-ut.png';

export default function LoginView({ onLogin, onAdminLogin }) {
    const [matricula, setMatricula] = useState('');
    const [loading, setLoading] = useState(false);

    // Estado administrativo
    const [adminMode, setAdminMode] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');

    // Estados para el flujo de onboarding (Primer ingreso)
    // 'login' | 'email' | 'verify' | 'password'
    const [onboardingStep, setOnboardingStep] = useState('login');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Activa el modo admin con trucos
    const handleTitleClick = () => {
        setClickCount(prev => prev + 1);
        if (clickCount + 1 === 5) {
            setAdminMode(true);
            setClickCount(0);
            setOnboardingStep('login'); // Reset flow if going to admin
        }
    };

    // Reconocimiento de usuario en tiempo real
    const [recognizedName, setRecognizedName] = useState(null);

    React.useEffect(() => {
        const inputMat = String(matricula).trim().toLowerCase();

        if (inputMat.length >= 3) {
            // Fetch desde API
            fetch(`http://localhost:3001/api/students/${inputMat}`)
                .then(res => res.ok ? res.json() : null)
                .then(student => {
                    if (student) {
                        setRecognizedName(student.name);
                    } else {
                        setRecognizedName(null);
                    }
                })
                .catch(() => setRecognizedName(null));
        } else {
            setRecognizedName(null);
        }
    }, [matricula]);

    // Paso 1: Ingreso de Matrícula (Login normal o inicio de registro)
    const handleMatriculaSubmit = async (e) => {
        e.preventDefault();
        const inputMat = String(matricula).trim();
        if (!inputMat) return;
        setLoading(true);

        try {
            // Verificar en la API del backend
            const res = await fetch(`http://localhost:3001/api/students/${inputMat.toLowerCase()}`);

            if (res.ok) {
                const student = await res.json();
                // Usuario encontrado en la BD -> Acceso directo
                setLoading(false);
                onLogin(inputMat);
            } else {
                // Estudiante no encontrado
                setLoading(false);
                alert('❌ Matrícula no encontrada en la base de datos. Contacta al administrador.');
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert('❌ Error de conexión con el servidor. Asegúrate de que el backend esté corriendo.');
        }
    };

    // Paso 2: Vincular Correo
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        // Simular envío de código
        setTimeout(() => {
            setLoading(false);
            setOnboardingStep('verify');
        }, 1000);
    };

    // Paso 3: Código de Verificación
    const handleVerifySubmit = (e) => {
        e.preventDefault();
        if (!verificationCode) return;
        setLoading(true);
        // Simular verificación
        setTimeout(() => {
            setLoading(false);
            setOnboardingStep('password');
        }, 1000);
    };

    // Paso 4: Crear Contraseña
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!password || password !== confirmPassword) return;
        setLoading(true);
        // Simular guardado final
        setTimeout(() => {
            setLoading(false);
            // Aquí ya loguearíamos al usuario o lo mandaríamos al login
            onLogin(matricula);
        }, 1500);
    };

    // Maneja el inicio de sesión del administrador
    const handleAdminSubmit = (e) => {
        e.preventDefault();
        if (!adminUser || !adminPass) return;
        setLoading(true);
        setTimeout(() => {
            onAdminLogin(adminUser, adminPass);
            setLoading(false);
        }, 1500);
    };

    const renderHeader = () => {
        if (adminMode) {
            return {
                title: "Panel Administrativo",
                subtitle: "Ingresa tus credenciales de administrador."
            };
        }

        switch (onboardingStep) {
            case 'email':
                return {
                    title: "Vincula tu cuenta",
                    subtitle: "Ingresa tu correo para recibir un código de verificación."
                };
            case 'verify':
                return {
                    title: "Verifica tu correo",
                    subtitle: `Hemos enviado un código a ${email}`
                };
            case 'password':
                return {
                    title: "Crea tu contraseña",
                    subtitle: "Establece una contraseña segura para tu cuenta."
                };
            case 'login':
            default:
                return {
                    title: "Bienvenido",
                    subtitle: "Ingresa tu matrícula para acceder."
                };
        }
    };

    const headerContent = renderHeader();

    return (
        <div className="login-card">
            {/* Left Side - Form */}
            <div className="login-form-section">
                <div className="mb-6">
                    <img src={logoUt} alt="Logo UT Tecamachalco" style={{ height: '80px', marginBottom: '1.5rem', display: 'block' }} />

                    {/* Botón Volver (solo visible si estamos en pasos de onboarding o admin) */}
                    {(onboardingStep !== 'login' || adminMode) && (
                        <button
                            onClick={() => {
                                if (adminMode) setAdminMode(false);
                                else if (onboardingStep === 'email') setOnboardingStep('login');
                                else if (onboardingStep === 'verify') setOnboardingStep('email');
                                else if (onboardingStep === 'password') setOnboardingStep('verify');
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem',
                                background: 'none', border: 'none', cursor: 'pointer', padding: 0
                            }}
                        >
                            <ArrowLeft size={16} /> Volver
                        </button>
                    )}

                    <h2
                        onClick={handleTitleClick}
                        style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem', cursor: 'default', userSelect: 'none' }}
                    >
                        {headerContent.title}
                    </h2>
                    <p style={{ color: '#6b7280' }}>
                        {headerContent.subtitle}
                    </p>
                </div>

                {/* --- RENDERIZADO CONDICIONAL DE FORMULARIOS --- */}

                {/* MODO ADMIN */}
                {adminMode && (
                    <form onSubmit={handleAdminSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Usuario</label>
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
                            <label className="form-label">Contraseña</label>
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
                    </form>
                )}

                {/* MODO ALUMNO - PASO 1: MATRÍCULA (DEFAULT) */}
                {!adminMode && onboardingStep === 'login' && (
                    <form onSubmit={handleMatriculaSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Matrícula</label>
                            <input
                                type="text"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                className="input"
                                style={{ fontSize: '1.125rem', borderColor: recognizedName ? 'var(--ut-green)' : '#e5e7eb' }}
                                placeholder="Ej. 20230001"
                                autoFocus
                            />
                            {recognizedName && (
                                <p style={{ color: 'var(--ut-green)', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ut-green)', display: 'inline-block' }}></span>
                                    Hola, {recognizedName}
                                </p>
                            )}
                            {!recognizedName && matricula.length > 3 && (
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                                    Ingresa la matrícula tal cual aparece en el Excel cargado.
                                </p>
                            )}
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
                                    Continuar
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* MODO DOS: EMAIL BIND */}
                {!adminMode && onboardingStep === 'email' && (
                    <form onSubmit={handleEmailSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Correo Electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="alumno@uttecam.edu.mx"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!email || loading}
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '1.125rem' }}
                        >
                            {loading ? <span>Enviando...</span> : <span>Enviar Código</span>}
                        </button>
                    </form>
                )}

                {/* MODO TRES: VERIFICAR CÓDIGO */}
                {!adminMode && onboardingStep === 'verify' && (
                    <form onSubmit={handleVerifySubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Código de Verificación</label>
                            <div style={{ position: 'relative' }}>
                                <ShieldCheck size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="input"
                                    style={{ paddingLeft: '3rem', letterSpacing: '0.25rem', fontWeight: 'bold' }}
                                    placeholder="123456"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!verificationCode || loading}
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '1.125rem' }}
                        >
                            {loading ? <span>Verificando...</span> : <span>Verificar Código</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
                            style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            ¿No recibiste el código? Reenviar
                        </button>
                    </form>
                )}

                {/* MODO CUATRO: CREAR PASSWORD */}
                {!adminMode && onboardingStep === 'password' && (
                    <form onSubmit={handlePasswordSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Nueva Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="Ingrese contraseña"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Confirmar Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Key size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="Repita contraseña"
                                />
                            </div>
                            {password && confirmPassword && password !== confirmPassword && (
                                <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>Las contraseñas no coinciden</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!password || !confirmPassword || password !== confirmPassword || loading}
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '1.125rem' }}
                        >
                            {loading ? <span>Guardando...</span> : <span>Finalizar Registro</span>}
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

            <style>{`
                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
}
