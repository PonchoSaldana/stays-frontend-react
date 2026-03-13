import React, { useState } from 'react';
import { ArrowRight, GraduationCap, Mail, Lock, ShieldCheck, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react';
import logoUt from '../assets/logo-ut.png';
import { API_URL } from '../config';

export default function LoginView({ onLogin, onAdminLogin }) {
    const [matricula, setMatricula] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estado administrativo
    const [adminMode, setAdminMode] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');

    // Flujo de onboarding: 'login' | 'onboarding_password' | 'email' | 'verify' | 'password'
    const [flow, setFlow] = useState('login');
    const [studentName, setStudentName] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Live recognition
    const [recognizedName, setRecognizedName] = useState(null);

    React.useEffect(() => {
        if (flow !== 'login' || adminMode) return;
        const inputMat = String(matricula).trim().toLowerCase();
        if (inputMat.length >= 3) {
            fetch(`${API_URL}/auth/hint/${inputMat}`)
                .then(r => r.ok ? r.json() : { name: null })
                .then(d => setRecognizedName(d.name))
                .catch(() => setRecognizedName(null));
        } else {
            setRecognizedName(null);
        }
    }, [matricula, flow, adminMode]);


    // Activa admin con 5 clicks en el título
    const handleTitleClick = () => {
        setClickCount(prev => prev + 1);
        if (clickCount + 1 === 5) {
            setAdminMode(true);
            setClickCount(0);
            setFlow('login');
            setError('');
        }
    };

    // ─── PASO 1: Verificar matrícula ──────────────────────────────────────────
    const handleMatriculaSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const mat = String(matricula).trim();
        if (!mat) return;

        // Limpiar estados previos por seguridad (evita que se "quede" el correo o nombre de otro alumno)
        setStudentName('');
        setEmail('');
        setRecognizedName(null);
        setPassword('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/check-matricula`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula: mat })
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Matrícula no encontrada');
                setLoading(false);
                return;
            }

            setStudentName(data.name);

            if (data.status === 'onboarding') {
                // Primer ingreso → flujo de configuración de cuenta
                if (data.emailAlreadySet && data.email) {
                    setEmail(data.email);
                } else {
                    setEmail(''); // Asegurar que está vacío si el alumno no ha puesto uno
                }
                setFlow('email');
            } else {
                // Ya tiene cuenta → pedir contraseña
                setFlow('onboarding_password');
            }

        } catch (err) {
            setError('Error de conexión con el servidor');
        }
        setLoading(false);
    };

    // Función para enmascarar correo (j***e@gmail.com)
    const maskEmail = (str) => {
        if (!str || !str.includes('@')) return str;
        const [user, domain] = str.split('@');
        if (user.length <= 2) return `*@${domain}`;
        return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
    };

    // ─── LOGIN normal (ya tiene contraseña) ───────────────────────────────────
    const [isLocked, setIsLocked] = useState(false);   // true = cuenta bloqueada

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLocked(false);
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login/student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula: String(matricula).trim(), password })
            });
            const data = await res.json();

            if (res.status === 423) {
                // Cuenta bloqueada
                setIsLocked(true);
                setError(data.message || 'Cuenta temporalmente bloqueada.');
                setLoading(false);
                return;
            }

            if (!res.ok) {
                setIsLocked(false);
                setError(data.message || 'Credenciales incorrectas');
                setLoading(false);
                return;
            }

            // Guardar token y datos de sesión
            sessionStorage.setItem('ut_token', data.token);
            onLogin(data.user.matricula, data.user);

        } catch (err) {
            setError('Error de conexión con el servidor');
        }
        setLoading(false);
    };

    // ─── RECUPERACIÓN DE CONTRASEÑA ───────────────────────────────────────────
    const handleForgotPassword = async () => {
        setError('');
        if (!matricula) {
            setError('Por favor ingresa tu matrícula primero para recuperar la contraseña.');
            setFlow('login');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula: String(matricula).trim() })
            });
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.message || 'No se pudo iniciar la recuperación.');
                setLoading(false);
                return;
            }

            // Si se envió el código con éxito, pasamos al flujo de verificación
            setEmail(data.email || 'tu correo registrado'); // Guardamos el email (enmascarado usualmente) para mostrarlo
            setFlow('verify');
        } catch {
            setError('Error de conexión al solicitar recuperación.');
        }
        setLoading(false);
    };

    // ─── ONBOARDING PASO 2: Enviar código al correo ───────────────────────────
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula: String(matricula).trim(), email })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); setLoading(false); return; }
            setFlow('verify');
        } catch {
            setError('Error al enviar el código');
        }
        setLoading(false);
    };

    // ─── ONBOARDING PASO 3: Verificar código ──────────────────────────────────
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!verificationCode) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula: String(matricula).trim(), code: verificationCode })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); setLoading(false); return; }
            setFlow('password');
        } catch {
            setError('Error al verificar el código');
        }
        setLoading(false);
    };

    // ─── ONBOARDING PASO 4: Guardar contraseña ────────────────────────────────
    const handleSetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/set-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula: String(matricula).trim(), password })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); setLoading(false); return; }

            sessionStorage.setItem('ut_token', data.token);
            onLogin(data.user.matricula, data.user);
        } catch {
            setError('Error al guardar la contraseña');
        }
        setLoading(false);
    };

    // ─── LOGIN ADMIN ──────────────────────────────────────────────────────────
    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!adminUser || !adminPass) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login/admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: adminUser, password: adminPass })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Credenciales incorrectas'); setLoading(false); return; }

            sessionStorage.setItem('ut_token', data.token);
            onAdminLogin(adminUser, adminPass, data.token, data.user);
        } catch {
            setError('Error de conexión');
        }
        setLoading(false);
    };

    // ─── Headers dinámicos ────────────────────────────────────────────────────
    const headers = {
        login: { title: 'Bienvenido', subtitle: 'Ingresa tu matrícula para acceder.' },
        onboarding_password: { title: `Hola, ${studentName}`, subtitle: 'Ingresa tu contraseña para continuar.' },
        email: { title: 'Vincula tu cuenta', subtitle: email ? `Confirma o cambia el correo de recuperación.` : 'Ingresa tu correo para recibir un código.' },
        verify: { title: 'Verifica tu correo', subtitle: `Código enviado a ${maskEmail(email)}` },
        password: { title: 'Crea tu contraseña', subtitle: 'Establece una contraseña segura.' },
        admin: { title: 'Panel Administrativo', subtitle: 'Ingresa tus credenciales de administrador.' }
    };

    const hdr = adminMode ? headers.admin : (headers[flow] || headers.login);

    const handleBack = () => {
        setError('');
        if (adminMode) { setAdminMode(false); return; }
        if (flow === 'onboarding_password') {
            setFlow('login');
            setStudentName('');
        }
        else if (flow === 'email') {
            setFlow('login');
            setEmail('');
            setStudentName('');
        }
        else if (flow === 'verify') setFlow('email');
        else if (flow === 'password') setFlow('verify');
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                {/* Left Side - Form */}
                <div className="login-form-section">
                    <div className="mb-6">
                        <img src={logoUt} alt="Logo UT Tecamachalco" style={{ height: '80px', marginBottom: '1.5rem', display: 'block' }} />

                        {(flow !== 'login' || adminMode) && (
                            <button onClick={handleBack} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem',
                                background: 'none', border: 'none', cursor: 'pointer', padding: 0
                            }}>
                                <ArrowLeft size={16} /> Volver
                            </button>
                        )}

                        <h2 onClick={handleTitleClick} style={{
                            fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem',
                            cursor: 'default', userSelect: 'none'
                        }}>
                            {hdr.title}
                        </h2>
                        <p style={{ color: '#6b7280' }}>{hdr.subtitle}</p>
                    </div>

                    {/* Error global */}
                    {error && (
                        <div style={{
                            background: isLocked ? '#fef2f2' : '#fffbeb',
                            border: `1px solid ${isLocked ? '#fca5a5' : '#fcd34d'}`,
                            borderRadius: '0.5rem',
                            padding: '0.75rem 1rem',
                            marginBottom: '1rem',
                            color: isLocked ? '#dc2626' : '#92400e',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1rem' }}>{isLocked ? '' : ''}</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ── MODO ADMIN ── */}
                    {adminMode && (
                        <form onSubmit={handleAdminSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Usuario</label>
                                <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)}
                                    className="input" placeholder="Admin User" autoFocus />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Contraseña</label>
                                <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)}
                                    className="input" placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={!adminUser || !adminPass || loading} className="btn"
                                style={{ width: '100%', fontSize: '1.125rem', background: '#374151', color: 'white' }}>
                                {loading ? 'Accediendo...' : 'Entrar como Admin'}
                            </button>
                        </form>
                    )}

                    {/* ── PASO 1: MATRÍCULA ── */}
                    {!adminMode && flow === 'login' && (
                        <form onSubmit={handleMatriculaSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Matrícula</label>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={matricula} onChange={e => setMatricula(e.target.value.replace(/\D/g, ''))}
                                    className="input" placeholder="Ej. 20230001" autoFocus
                                    autoComplete="off"
                                    style={{ fontSize: '1.125rem', borderColor: recognizedName ? 'var(--ut-green)' : '#9ca3af', borderWidth: recognizedName ? '2px' : '1.5px' }} />
                                {recognizedName && (
                                    <p style={{ color: 'var(--ut-green)', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ut-green)', display: 'inline-block' }} />
                                        Hola, {recognizedName}
                                    </p>
                                )}
                            </div>
                            <button type="submit" disabled={!matricula || loading} className="btn btn-primary"
                                style={{ width: '100%', fontSize: '1.125rem' }}>
                                {loading ? 'Verificando...' : <><span>Continuar</span><ArrowRight size={20} /></>}
                            </button>
                        </form>
                    )}

                    {/* ── PASO LOGIN: CONTRASEÑA NORMAL ── */}
                    {!adminMode && flow === 'onboarding_password' && (
                        <form onSubmit={handlePasswordLogin}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">
                                    Contraseña
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                        className="input" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                        autoComplete="current-password"
                                        placeholder="Tu contraseña" autoFocus />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.65rem' }}>
                                    <button 
                                        type="button" 
                                        onClick={handleForgotPassword}
                                        className="forgot-password-btn-bottom"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={!password || loading} className="btn btn-primary"
                                style={{ width: '100%', fontSize: '1.125rem' }}>
                                {loading ? 'Entrando...' : <><span>Entrar</span><ArrowRight size={20} /></>}
                            </button>
                        </form>
                    )}

                    {/* ── ONBOARDING PASO 2: EMAIL ── */}
                    {!adminMode && flow === 'email' && (
                        <form onSubmit={handleEmailSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Correo Electrónico</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                        className="input" style={{ paddingLeft: '3rem' }}
                                        autoComplete="off"
                                        placeholder="alumno@uttecam.edu.mx" autoFocus />
                                </div>
                            </div>
                            <button type="submit" disabled={!email || loading} className="btn btn-primary"
                                style={{ width: '100%', fontSize: '1.125rem' }}>
                                {loading ? 'Enviando...' : 'Enviar Código'}
                            </button>
                        </form>
                    )}

                    {/* ── ONBOARDING PASO 3: CÓDIGO ── */}
                    {!adminMode && flow === 'verify' && (
                        <form onSubmit={handleVerifySubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Código de Verificación</label>
                                <div style={{ position: 'relative' }}>
                                    <ShieldCheck size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)}
                                        className="input" style={{ paddingLeft: '3rem', letterSpacing: '0.25rem', fontWeight: 'bold' }}
                                        placeholder="123456" maxLength={6} autoFocus />
                                </div>
                            </div>
                            <button type="submit" disabled={!verificationCode || loading} className="btn btn-primary"
                                style={{ width: '100%', fontSize: '1.125rem' }}>
                                {loading ? 'Verificando...' : 'Verificar Código'}
                            </button>
                            <button type="button" onClick={() => { setFlow('email'); setVerificationCode(''); }}
                                className="resend-code-btn"
                                style={{ width: '100%', marginTop: '1rem' }}>
                                ¿No recibiste el código? Reenviar
                            </button>
                        </form>
                    )}

                    {/* ── ONBOARDING PASO 4: CONTRASEÑA NUEVA ── */}
                    {!adminMode && flow === 'password' && (
                        <form onSubmit={handleSetPassword}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Nueva Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                        className="input" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                        placeholder="Mínimo 6 caracteres" autoFocus />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Confirmar Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={20} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        className="input" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                        placeholder="Repite la contraseña" />
                                </div>
                                {password && confirmPassword && password !== confirmPassword && (
                                    <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>Las contraseñas no coinciden</p>
                                )}
                            </div>
                            <button type="submit"
                                disabled={!password || !confirmPassword || password !== confirmPassword || loading}
                                className="btn btn-primary" style={{ width: '100%', fontSize: '1.125rem' }}>
                                {loading ? 'Guardando...' : 'Finalizar Registro'}
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
                        {['Carga tu documentación', 'Espera aprobación', 'Entrega tu expediente físico'].map((step, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.75rem',
                                backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', background: 'var(--ut-orange)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>{i + 1}</div>
                                    <p style={{ fontWeight: 500 }}>{step}</p>
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
                .forgot-password-btn-bottom {
                    background: none;
                    border: none;
                    color: var(--ut-green);
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s ease;
                }
                .forgot-password-btn-bottom:hover {
                    color: #00763a;
                    text-decoration: underline;
                    transform: translateY(-1px);
                }
                .resend-code-btn {
                    background: none;
                    border: none;
                    color: var(--ut-green);
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    padding: 0;
                    transition: all 0.2s ease;
                }
                .resend-code-btn:hover {
                    color: #00763a;
                    text-decoration: underline;
                }
            `}</style>
            </div>
        </div>
    );
}
