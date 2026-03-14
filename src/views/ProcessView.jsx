import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Download, FileText, Loader, AlertTriangle, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AvatarPath from '../components/AvatarPath';
import FileUploader from '../components/FileUploader';
import confetti from 'canvas-confetti';
import Modal from '../components/Modal';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { authFetch } from '../auth';

// LISTA DE DOCUMENTOS PARA ESTADÍAS
const INITIAL_DOCS = [
    "Solicitud de Estadía", "Carta de Presentación", "Carta de Aceptación",
    "Cronograma de Actividades", "Seguro Facultativo", "Vigencia de Derechos IMSS",
    "Comprobante de Domicilio", "Identificación Oficial (INE)",
    "Constancia de Situación Fiscal", "Historial Académico"
];

const GENERATED_DOCS = [
    "Documento 1", "Documento 2", "Documento 3"
];

export default function ProcessView({ userMatricula, stageName }) {
    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();
    const [uploads1, setUploads1] = useState({});
    const [uploads2, setUploads2] = useState({});
    const [checkStatus, setCheckStatus] = useState({});
    const [loading, setLoading] = useState(true);

    const [editingDoc, setEditingDoc] = useState(null);
    const [modalMode, setModalMode] = useState('preview');
    const [docData, setDocData] = useState({
        studentName: 'Alumno Ficticio',
        matricula: userMatricula,
        companyName: 'Empresa Ejemplo S.A.',
        projectTitle: 'Sistema de Gestión',
        advisor: 'Ing. Supervisor'
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const getProgress = (st) => {
        switch (st) {
            case 'upload_1': return (Object.keys(uploads1).length / INITIAL_DOCS.length) * 30;
            case 'check_1': return 35;
            case 'generate_1': return 50;
            case 'upload_2': return 50 + (Object.keys(uploads2).length / GENERATED_DOCS.length) * 20;
            case 'check_2': return 85;
            case 'finish': return 100;
            default: return 0;
        }
    };
    const progress = getProgress(stageName);

    useEffect(() => {
        const fetchExistingDocs = async () => {
            try {
                const res = await authFetch(`/documents/student/${userMatricula}`);
                if (res.ok) {
                    const docs = await res.json();
                    const up1 = {};
                    const up2 = {};
                    docs.forEach(d => {
                        if (d.stage === 'upload_1') up1[d.documentName] = 'success';
                        if (d.stage === 'upload_2') up2[d.documentName] = 'success';
                    });
                    setUploads1(up1);
                    setUploads2(up2);
                }
            } catch (err) {
                console.error('Error fetching docs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExistingDocs();
    }, [userMatricula]);

    useEffect(() => {
        if (stageName === 'check_1') {
            let delay = 0;
            INITIAL_DOCS.forEach(doc => {
                delay += 200;
                setTimeout(() => setCheckStatus(prev => ({ ...prev, [doc]: 'ok' })), delay);
            });
            setTimeout(() => navigate('/estadia/generacion-documentos'), 3000);
        }
        if (stageName === 'check_2') {
            let delay = 0;
            GENERATED_DOCS.forEach(doc => {
                delay += 200;
                setTimeout(() => setCheckStatus(prev => ({ ...prev, [doc]: 'ok' })), delay);
            });
            setTimeout(() => navigate('/estadia/finalizado'), 2500);
        }
        if (stageName === 'finish') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#009B4D', '#FF7900', '#ffffff'] });
        }
    }, [stageName, navigate]);

    const handleUpload = async (docLabel, file, stage, setUploads) => {
        setUploads(prev => ({ ...prev, [docLabel]: 'uploading' }));

        const formData = new FormData();
        formData.append('matricula', userMatricula);
        formData.append('stage', stage);
        formData.append('documentName', docLabel);
        formData.append('file', file);

        try {
            const res = await authFetch('/documents/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setUploads(prev => ({ ...prev, [docLabel]: 'success' }));
                showToast({ type: 'success', title: 'Archivo guardado', message: `"${docLabel}" se ha subido correctamente.` });
            } else {
                const err = await res.json();
                setUploads(prev => ({ ...prev, [docLabel]: 'error' }));
                showToast({ type: 'error', title: 'Error al subir', message: err.message || 'No se pudo guardar el archivo.' });
            }
        } catch {
            setUploads(prev => ({ ...prev, [docLabel]: 'error' }));
            showToast({ type: 'error', title: 'Error de red', message: 'No se pudo conectar con el servidor.' });
        }
    };

    const handleUpload1 = (docLabel, file) => handleUpload(docLabel, file, 'upload_1', setUploads1);
    const handleUpload2 = (docLabel, file) => handleUpload(docLabel, file, 'upload_2', setUploads2);

    const handleOpenPreview = (docName) => {
        setEditingDoc(docName);
        setModalMode('preview');
        setIsEditModalOpen(true);
    };

    const handleApproveAndDownload = () => {
        setIsEditModalOpen(false);
        setTimeout(() => {
            showToast({ type: 'success', title: 'Documento generado', message: `"${editingDoc}" fue aprobado correctamente.` });
        }, 500);
    };

    const uploadedCount1 = Object.keys(uploads1).length;
    const uploadedCount2 = Object.keys(uploads2).length;

    return (
        <div className="pv-container">
            {/* Header */}
            <div className="pv-header">
                <h2 className="pv-title">Gestión de Estadías</h2>
                <p className="pv-subtitle">
                    Matrícula: <span className="pv-subtitle-bold">{userMatricula}</span>
                </p>
            </div>

            {/* Avatar Progress */}
            <AvatarPath progress={progress} currentStage={stageName} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={stageName}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3 }}
                    className="pv-card"
                >
                    {/* ── ETAPA 1: SUBIR DOCUMENTOS INICIALES ── */}
                    {stageName === 'upload_1' && (
                        <div>
                            <div className="pv-stage-header">
                                <div className="pv-stage-title-row">
                                    <div className="pv-stage-icon" style={{ background: '#FFF7ED', color: 'var(--ut-orange)' }}>
                                        <FileText size={22} />
                                    </div>
                                    <div>
                                        <p className="pv-stage-label">Etapa 1</p>
                                        <h3 className="pv-stage-title">Documentación Inicial</h3>
                                    </div>
                                </div>
                                <span className="pv-badge">
                                    {uploadedCount1} / {INITIAL_DOCS.length}
                                </span>
                            </div>

                            {/* Progress mini bar */}
                            <div className="pv-mini-bar">
                                <div
                                    className="pv-mini-bar-fill"
                                    style={{ width: `${(uploadedCount1 / INITIAL_DOCS.length) * 100}%` }}
                                />
                            </div>

                            <div className="pv-docs-grid">
                                {INITIAL_DOCS.map(doc => (
                                    <FileUploader
                                        key={doc}
                                        id={doc}
                                        label={doc}
                                        status={uploads1[doc]}
                                        onUpload={handleUpload1}
                                    />
                                ))}
                            </div>

                            <div className="pv-action-row">
                                <p className="pv-hint">
                                    {uploadedCount1 < INITIAL_DOCS.length
                                        ? `Faltan ${INITIAL_DOCS.length - uploadedCount1} documento(s)`
                                        : '¡Todos los documentos cargados! Puedes continuar.'}
                                </p>
                                <button
                                    onClick={() => navigate('/estadia/revision-inicial')}
                                    disabled={uploadedCount1 < INITIAL_DOCS.length}
                                    className="btn btn-primary pv-submit-btn"
                                >
                                    Enviar a Validación
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── REVISIÓN ── */}
                    {(stageName === 'check_1' || stageName === 'check_2') && (
                        <div className="pv-check-screen">
                            <div className="pv-check-spinner">
                                <Loader className="animate-spin" size={48} style={{ color: 'var(--ut-green)' }} />
                            </div>
                            <h3 className="pv-check-title">Validando Documentos...</h3>
                            <p className="pv-check-sub">
                                El departamento de estadías está verificando tu información.
                            </p>
                            <div className="pv-check-list">
                                {(stageName === 'check_1' ? INITIAL_DOCS : GENERATED_DOCS).map(doc => (
                                    <div key={doc} className="pv-check-item">
                                        <span className="pv-check-item-name">{doc}</span>
                                        {checkStatus[doc] === 'ok'
                                            ? <CheckCheck size={16} style={{ color: 'var(--ut-green)', flexShrink: 0 }} />
                                            : <span className="pv-check-dot" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── ETAPA 3: DOCUMENTOS GENERADOS ── */}
                    {stageName === 'generate_1' && (
                        <div className="pv-generate-screen">
                            <div className="pv-success-icon">
                                <CheckCheck size={32} />
                            </div>
                            <h3 className="pv-generate-title">¡Documentación Autorizada!</h3>
                            <p className="pv-generate-sub">
                                Verifica que los datos sean correctos y edita el contenido si es necesario antes de descargar.
                            </p>

                            <div className="pv-gen-docs-grid">
                                {GENERATED_DOCS.map(doc => (
                                    <div key={doc} className="pv-gen-doc-card">
                                        <div className="pv-gen-doc-icon">
                                            <FileText size={28} />
                                        </div>
                                        <h4 className="pv-gen-doc-name">{doc}</h4>
                                        <button
                                            onClick={() => handleOpenPreview(doc)}
                                            className="btn btn-primary"
                                            style={{ width: '100%', fontSize: '0.875rem' }}
                                        >
                                            <Eye size={16} /> Ver Documento
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/estadia/documentos-finales')}
                                className="btn btn-primary pv-continue-btn"
                            >
                                Continuar <Download size={18} />
                            </button>
                        </div>
                    )}

                    {/* ── ETAPA 4: SUBIR DOCUMENTOS FINALES ── */}
                    {stageName === 'upload_2' && (
                        <div>
                            <div className="pv-stage-header">
                                <div className="pv-stage-title-row">
                                    <div className="pv-stage-icon" style={{ background: '#FFF7ED', color: 'var(--ut-orange)' }}>
                                        <FileText size={22} />
                                    </div>
                                    <div>
                                        <p className="pv-stage-label">Etapa 4</p>
                                        <h3 className="pv-stage-title">Documentos Finales</h3>
                                    </div>
                                </div>
                                <span className="pv-badge">
                                    {uploadedCount2} / {GENERATED_DOCS.length}
                                </span>
                            </div>

                            <p className="pv-hint" style={{ marginBottom: '1.25rem' }}>
                                Sube los documentos debidamente requisitados y firmados.
                            </p>

                            <div className="pv-mini-bar">
                                <div
                                    className="pv-mini-bar-fill"
                                    style={{ width: `${(uploadedCount2 / GENERATED_DOCS.length) * 100}%` }}
                                />
                            </div>

                            <div className="pv-docs-grid" style={{ marginTop: '1rem' }}>
                                {GENERATED_DOCS.map(doc => (
                                    <FileUploader
                                        key={doc}
                                        id={doc}
                                        label={doc}
                                        status={uploads2[doc]}
                                        onUpload={handleUpload2}
                                    />
                                ))}
                            </div>

                            <div className="pv-action-row">
                                <p className="pv-hint">
                                    {uploadedCount2 < GENERATED_DOCS.length
                                        ? `Faltan ${GENERATED_DOCS.length - uploadedCount2} documento(s)`
                                        : '¡Listo para validar!'}
                                </p>
                                <button
                                    onClick={() => navigate('/estadia/revision-final')}
                                    disabled={uploadedCount2 < GENERATED_DOCS.length}
                                    className="btn btn-primary pv-submit-btn"
                                >
                                    Validar Documentos
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── FINALIZADO ── */}
                    {stageName === 'finish' && (
                        <div className="pv-finish-screen">
                            <div className="pv-finish-icon">
                                <CheckCheck size={48} />
                            </div>
                            <h2 className="pv-finish-title">¡Entrega de documentos concluida!</h2>
                            <p className="pv-finish-sub">
                                Has finalizado exitosamente el proceso de estadías.
                            </p>

                            <div className="pv-finish-alert">
                                <div className="pv-finish-alert-icon">
                                    <AlertTriangle size={22} />
                                </div>
                                <div>
                                    <p className="pv-finish-alert-title">Siguiente paso</p>
                                    <p className="pv-finish-alert-body">
                                        Acude a la Dirección de Carrera o al Departamento de Estadías para
                                        <strong> entregar tu expediente físico</strong> completo para su resguardo final.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => { sessionStorage.clear(); window.location.href = '/login'; }}
                                className="btn"
                                style={{ color: '#6b7280', marginTop: '0.5rem' }}
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modal de Previsualización */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={modalMode === 'preview' ? `Vista Previa: ${editingDoc}` : `Editar: ${editingDoc}`}
                footer={
                    modalMode === 'preview' ? (
                        <>
                            <button onClick={() => setModalMode('edit')} className="btn" style={{ background: '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Edit size={16} /> Editar
                            </button>
                            <button onClick={handleApproveAndDownload} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={16} /> Aprobar y Descargar
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setModalMode('preview')} className="btn" style={{ background: '#f3f4f6' }}>Cancelar</button>
                            <button onClick={() => setModalMode('preview')} className="btn btn-primary">Guardar Cambios</button>
                        </>
                    )
                }
            >
                {modalMode === 'preview' ? (
                    <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                        <p style={{ fontWeight: 600, textAlign: 'center', marginBottom: '0.75rem', color: '#374151' }}>DOCUMENTO PRELIMINAR</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem', fontSize: '0.875rem' }}>
                            {[
                                ['Alumno', docData.studentName],
                                ['Matrícula', docData.matricula],
                                ['Empresa', docData.companyName],
                                ['Proyecto', docData.projectTitle],
                                ['Asesor', docData.advisor],
                            ].map(([label, value]) => (
                                <React.Fragment key={label}>
                                    <div style={{ fontWeight: 600, color: '#6b7280' }}>{label}:</div>
                                    <div style={{ fontWeight: 500 }}>{value}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {[
                            { label: 'Nombre del Alumno', key: 'studentName', disabled: false },
                            { label: 'Matrícula', key: 'matricula', disabled: true },
                            { label: 'Empresa', key: 'companyName', disabled: false },
                            { label: 'Proyecto', key: 'projectTitle', disabled: false },
                            { label: 'Asesor Empresarial', key: 'advisor', disabled: false },
                        ].map(field => (
                            <div key={field.key}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{field.label}</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={docData[field.key]}
                                    disabled={field.disabled}
                                    style={field.disabled ? { background: '#f3f4f6' } : {}}
                                    onChange={e => setDocData({ ...docData, [field.key]: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
