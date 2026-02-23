import React, { useState } from 'react';
import { User, Lock, Upload, Save, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { API_URL } from '../config';
import { authFetch } from '../auth';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function StudentProfileView({ userMatricula }) {
    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, type: 'info' });
    const [studentData, setStudentData] = useState(null);

    // Cargar datos del alumno al montar
    React.useEffect(() => {
        if (userMatricula) {
            const targetMat = String(userMatricula).trim().toLowerCase();
            authFetch(`/students/${targetMat}`)
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
            showToast({ type: 'warning', title: 'Contraseña corta', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
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
                showToast({ type: 'success', title: 'Contraseña Actualizada', message: 'Tu contraseña ha sido actualizada correctamente.' });
                setPasswordData({ current: '', new: '', confirm: '' });
            }
        } catch {
            showToast({ type: 'error', title: 'Error de conexión', message: 'Intenta de nuevo más tarde.' });
        }
        setLoading(false);
    };

    const handleCvUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCvFile(file);
        }
    };

    const handleSaveCv = () => {
        if (!cvFile) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showToast({ type: 'success', title: 'CV Actualizado', message: 'Tu Curriculum Vitae se ha guardado correctamente.' });
        }, 1500);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={() => navigate(-1)}
                className="btn"
                style={{ background: 'none', color: '#6b7280', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
            >
                <ArrowLeft size={20} /> Volver
            </button>

            <div className="text-center mb-6">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>Mi Perfil</h2>
                <p style={{ color: '#6b7280' }}>Gestión de datos personales y seguridad</p>
            </div>

            <div className="process-card mb-6">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                    <User color="var(--ut-orange)" size={24} />
                    Información del Alumno
                </h3>

                <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* Columna Izquierda: Avatar y Matrícula */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--ut-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1rem ease' }}>
                            {studentData?.name ? studentData.name.charAt(0) : (userMatricula ? userMatricula.slice(-2) : 'AL')}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matrícula</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>{userMatricula || '-----------'}</p>
                    </div>

                    {/* Columna Derecha: Datos Académicos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Nombre Completo</label>
                            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
                                {studentData?.name || 'Nombre no registrado'}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Carrera</label>
                            <div style={{ fontWeight: 500 }}>
                                {studentData?.careerName || studentData?.careerAsync || 'No asignada'}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Grado y Grupo</label>
                            <div style={{ fontWeight: 500 }}>
                                {studentData?.grade || '--'} {studentData?.group ? `"${studentData.group}"` : ''}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Turno</label>
                            <div style={{ fontWeight: 500 }}>
                                {studentData?.shift || '--'}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Generación</label>
                            <div style={{ fontWeight: 500 }}>
                                {studentData?.generation || '--'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Cambio de Contraseña */}
                <div className="process-card" style={{ marginTop: 0 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={20} color="#6b7280" />
                        Seguridad
                    </h3>
                    <form onSubmit={handlePasswordChange}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Contraseña Actual</label>
                            <input
                                type="password"
                                className="input"
                                value={passwordData.current}
                                onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nueva Contraseña</label>
                            <input
                                type="password"
                                className="input"
                                value={passwordData.new}
                                onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Confirmar Nuevamente</label>
                            <input
                                type="password"
                                className="input"
                                value={passwordData.confirm}
                                onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            />
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

                {/* Carga de CV */}
                <div className="process-card" style={{ marginTop: 0 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} color="#6b7280" />
                        Curriculum Vitae
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                        Sube tu CV para que las empresas puedan conocer tu perfil profesional.
                    </p>

                    <div style={{ border: '2px dashed #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleCvUpload}
                            style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, opacity: 0, cursor: 'pointer' }}
                        />
                        <div style={{ marginBottom: '1rem' }}>
                            {cvFile ? <CheckCircle size={40} color="var(--ut-green)" style={{ margin: '0 auto' }} /> : <Upload size={40} color="#d1d5db" style={{ margin: '0 auto' }} />}
                        </div>
                        <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                            {cvFile ? cvFile.name : 'Haz clic o arrastra tu archivo aquí'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Formatos PDF (Max. 5MB)</p>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <button
                            onClick={handleSaveCv}
                            disabled={!cvFile || loading}
                            className="btn"
                            style={{ width: '100%', background: cvFile ? 'var(--ut-green)' : '#f3f4f6', color: cvFile ? 'white' : '#9ca3af', cursor: cvFile ? 'pointer' : 'not-allowed' }}
                        >
                            {loading ? 'Subiendo...' : (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Save size={16} /> Guardar CV
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                type={modalConfig.type}
                footer={modalConfig.footer}
            >
                {modalConfig.content}
            </Modal>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
