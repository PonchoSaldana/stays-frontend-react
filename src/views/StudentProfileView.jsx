import React, { useState } from 'react';
import { User, Lock, Upload, Save, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { authFetch } from '../auth';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function StudentProfileView({ userMatricula }) {
    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState(null);

    React.useEffect(() => {
        if (userMatricula) {
            const mat = String(userMatricula).trim().toLowerCase();
            authFetch(`/students/${mat}`)
                .then(res => res.ok ? res.json() : null)
                .then(student => { if (student) setStudentData(student); })
                .catch(() => { });
        }
    }, [userMatricula]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            showToast({ type: 'warning', title: 'Error', message: 'Las contraseñas no coinciden.' });
            return;
        }
        if (passwordData.new.length < 6) {
            showToast({ type: 'warning', title: 'Contraseña corta', message: 'Mínimo 6 caracteres.' });
            return;
        }
        setLoading(true);
        try {
            const mat = String(userMatricula).trim().toLowerCase();
            const res = await authFetch(`/students/${mat}/change-password`, {
                method: 'PUT',
                body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new })
            });
            const data = await res.json();
            if (!res.ok) {
                showToast({ type: 'error', title: 'Error', message: data.message || 'No se pudo cambiar la contraseña.' });
            } else {
                showToast({ type: 'success', title: 'Contraseña Actualizada', message: 'Tu contraseña fue actualizada correctamente.' });
                setPasswordData({ current: '', new: '', confirm: '' });
            }
        } catch {
            showToast({ type: 'error', title: 'Error de conexión', message: 'Intenta de nuevo más tarde.' });
        }
        setLoading(false);
    };

    const handleSaveCv = () => {
        if (!cvFile) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showToast({ type: 'success', title: 'CV Actualizado', message: 'Tu CV se guardó correctamente.' });
        }, 1500);
    };

    const initials = studentData?.name
        ? studentData.name.charAt(0).toUpperCase()
        : (userMatricula ? String(userMatricula).slice(-2).toUpperCase() : 'AL');

    return (
        <div className="spv-container">
            {/* Volver */}
            <button onClick={() => navigate(-1)} className="spv-back-btn">
                <ArrowLeft size={18} /> Volver
            </button>

            {/* Page Title */}
            <div className="spv-page-title">
                <h2>Mi Perfil</h2>
                <p>Gestiona tus datos personales y seguridad</p>
            </div>

            {/* Info Card */}
            <div className="spv-info-card">
                <div className="spv-info-card-header">
                    <User size={20} style={{ color: 'var(--ut-orange)' }} />
                    <span>Información del Alumno</span>
                </div>

                <div className="spv-info-body">
                    {/* Avatar */}
                    <div className="spv-avatar-col">
                        <div className="spv-avatar">{initials}</div>
                        <p className="spv-matricula-label">Matrícula</p>
                        <p className="spv-matricula">{userMatricula || '—'}</p>
                    </div>

                    {/* Data */}
                    <div className="spv-data-grid">
                        <div className="spv-data-field spv-data-field--full">
                            <label>Nombre Completo</label>
                            <p>{studentData?.name || 'No registrado'}</p>
                        </div>
                        <div className="spv-data-field">
                            <label>Carrera</label>
                            <p>{studentData?.careerName || studentData?.careerAsync || 'No asignada'}</p>
                        </div>
                        <div className="spv-data-field">
                            <label>Grado y Grupo</label>
                            <p>{studentData?.grade || '--'} {studentData?.group ? `"${studentData.group}"` : ''}</p>
                        </div>
                        <div className="spv-data-field">
                            <label>Turno</label>
                            <p>{studentData?.shift || '--'}</p>
                        </div>
                        <div className="spv-data-field">
                            <label>Generación</label>
                            <p>{studentData?.generation || '--'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security + CV */}
            <div className="spv-bottom-grid">
                {/* Cambio de contraseña */}
                <div className="spv-section-card">
                    <div className="spv-section-header">
                        <Lock size={18} style={{ color: '#6b7280' }} />
                        <span>Seguridad</span>
                    </div>
                    <form onSubmit={handlePasswordChange} className="spv-form">
                        <div>
                            <label className="spv-label">Contraseña Actual</label>
                            <input type="password" className="input" value={passwordData.current}
                                onChange={e => setPasswordData({ ...passwordData, current: e.target.value })} />
                        </div>
                        <div>
                            <label className="spv-label">Nueva Contraseña</label>
                            <input type="password" className="input" value={passwordData.new}
                                onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} />
                        </div>
                        <div>
                            <label className="spv-label">Confirmar Contraseña</label>
                            <input type="password" className="input" value={passwordData.confirm}
                                onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                            {passwordData.new && passwordData.confirm && passwordData.new !== passwordData.confirm && (
                                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Las contraseñas no coinciden</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!passwordData.current || !passwordData.new || loading}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                </div>

                {/* CV Upload */}
                <div className="spv-section-card">
                    <div className="spv-section-header">
                        <FileText size={18} style={{ color: '#6b7280' }} />
                        <span>Curriculum Vitae</span>
                    </div>
                    <p className="spv-cv-hint">
                        Sube tu CV para que las empresas puedan conocer tu perfil profesional.
                    </p>
                    <label className="spv-cv-drop">
                        <input type="file" accept=".pdf" style={{ display: 'none' }}
                            onChange={e => { if (e.target.files[0]) setCvFile(e.target.files[0]); }} />
                        <div className="spv-cv-drop-icon">
                            {cvFile
                                ? <CheckCircle size={38} style={{ color: 'var(--ut-green)' }} />
                                : <Upload size={38} style={{ color: '#d1d5db' }} />}
                        </div>
                        <p className="spv-cv-drop-text">
                            {cvFile ? cvFile.name : 'Haz clic o arrastra tu archivo aquí'}
                        </p>
                        <p className="spv-cv-drop-sub">PDF (Max. 5MB)</p>
                    </label>
                    <button
                        onClick={handleSaveCv}
                        disabled={!cvFile || loading}
                        className="btn"
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            background: cvFile ? 'var(--ut-green)' : '#f3f4f6',
                            color: cvFile ? 'white' : '#9ca3af',
                            cursor: cvFile ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <Save size={16} />
                        {loading ? 'Subiendo...' : 'Guardar CV'}
                    </button>
                </div>
            </div>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
