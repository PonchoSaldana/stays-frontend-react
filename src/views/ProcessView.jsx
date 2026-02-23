import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Download, FileText, Loader, ShieldCheck, PenTool, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AvatarPath from '../components/AvatarPath';
import FileUploader from '../components/FileUploader';
import confetti from 'canvas-confetti';
import Modal from '../components/Modal';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';

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

const FINAL_DOCS = [
    "Carta de Liberación", "Constancia de Término de Estadía", "Certificado de Competencias"
];

export default function ProcessView({ userMatricula, stageName }) {
    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();
    // Estado local para simulacion de persistencia
    const [uploads1, setUploads1] = useState(() => JSON.parse(sessionStorage.getItem('up1') || '{}'));
    const [uploads2, setUploads2] = useState(() => JSON.parse(sessionStorage.getItem('up2') || '{}'));

    const [checkStatus, setCheckStatus] = useState({});

    // Estados para edición y previsualización de documentos
    const [editingDoc, setEditingDoc] = useState(null);
    const [modalMode, setModalMode] = useState('preview'); // 'preview' | 'edit'
    const [docData, setDocData] = useState({
        studentName: 'Alumno Ficticio',
        matricula: userMatricula,
        companyName: 'Empresa Ejemplo S.A.',
        projectTitle: 'Sistema de Gestión',
        advisor: 'Ing. Supervisor'
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Calcula el progreso visual basado en la etapa actual
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

    // Simula auto-guardado en sessionStorage
    useEffect(() => {
        sessionStorage.setItem('up1', JSON.stringify(uploads1));
        sessionStorage.setItem('up2', JSON.stringify(uploads2));
    }, [uploads1, uploads2]);

    // Efectos para transiciones automáticas y animaciones
    useEffect(() => {
        if (stageName === 'check_1') {
            // Simulate simple checking process
            let delay = 0;
            INITIAL_DOCS.forEach(doc => {
                delay += 200;
                setTimeout(() => {
                    setCheckStatus(prev => ({ ...prev, [doc]: 'ok' }));
                }, delay);
            });
            setTimeout(() => navigate('/estadia/generacion-documentos'), 3000);
        }
        if (stageName === 'check_2') {
            let delay = 0;
            GENERATED_DOCS.forEach(doc => {
                delay += 200;
                setTimeout(() => {
                    setCheckStatus(prev => ({ ...prev, [doc]: 'ok' }));
                }, delay);
            });
            setTimeout(() => navigate('/estadia/finalizado'), 2500);
        }

        if (stageName === 'finish') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#009B4D', '#FF7900', '#ffffff']
            });
        }
    }, [stageName, navigate]);

    // Manejador de subida de documentos iniciales
    const handleUpload1 = (docLabel, file) => {
        setUploads1(prev => ({ ...prev, [docLabel]: 'uploading' }));
        setTimeout(() => {
            setUploads1(prev => ({ ...prev, [docLabel]: 'success' }));
        }, 800);
    };

    const handleValidation1 = () => {
        navigate('/estadia/revision-inicial');
    };

    // Avanza a la pantalla de descarga de formatos
    const handleGenerate = () => {
        navigate('/estadia/documentos-finales');
    };

    const handleUpload2 = (docLabel, file) => {
        setUploads2(prev => ({ ...prev, [docLabel]: 'uploading' }));
        setTimeout(() => {
            setUploads2(prev => ({ ...prev, [docLabel]: 'success' }));
        }, 800);
    };

    const handleValidation2 = () => {
        navigate('/estadia/revision-final');
    };

    const handleOpenPreview = (docName) => {
        setEditingDoc(docName);
        setModalMode('preview');
        setIsEditModalOpen(true);
    };

    const handleSwitchToEdit = () => {
        setModalMode('edit');
    };

    const handleSaveEdit = () => {
        setModalMode('preview');
    };

    const handleApproveAndDownload = () => {
        // Aquí iría la lógica real de generación usando docData + docxtemplater
        console.log("Generando documento", editingDoc, "con datos:", docData);
        setIsEditModalOpen(false);
        // Simular descarga
        const link = document.createElement('a');
        link.href = '#';
        link.setAttribute('download', `${editingDoc}.pdf`);
        document.body.appendChild(link);
        // link.click(); // Comentado visualmente
        document.body.removeChild(link);

        // Simular tiempo de generación
        setTimeout(() => {
            showToast({
                type: 'success',
                title: 'Documento generado',
                message: `El documento "${editingDoc}" fue aprobado y descargado correctamente.`,
            });
        }, 500);
    };

    return (
        <div className="process-container">
            <div className="text-center mb-6">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Gestión de Estadías</h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Alumno: <span style={{ color: 'var(--ut-green)', fontWeight: 600, fontFamily: 'monospace' }}>{userMatricula}</span></p>
            </div>

            <AvatarPath progress={progress} currentStage={
                stageName === 'upload_1' ? 'Cargando Documentos' :
                    stageName.includes('check') ? 'Validando' :
                        stageName === 'generate_1' ? 'Generando' :
                            stageName === 'finish' ? '¡Felicidades!' : 'Procesando'
            } />

            <AnimatePresence mode="wait">
                <motion.div
                    key={stageName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="process-card"
                >
                    {/* STAGE 1: INITIAL UPLOAD */}
                    {stageName === 'upload_1' && (
                        <div>
                            <div className="flex-between stage-header mb-6">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText color="var(--ut-orange)" />
                                    1. Documentación de Inicio de Estadía
                                </h3>
                                <span className="tag">
                                    {Object.keys(uploads1).length} / {INITIAL_DOCS.length}
                                </span>
                            </div>
                            <div className="grid-2">
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
                            <div className="flex-end" style={{ marginTop: '2rem' }}>
                                <button
                                    onClick={handleValidation1}
                                    disabled={Object.keys(uploads1).length < INITIAL_DOCS.length}
                                    className="btn btn-primary"
                                >
                                    Enviar a Validación
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CHECKING SCREENS */}
                    {(stageName === 'check_1' || stageName === 'check_2') && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', textAlign: 'center' }}>
                            <div className="mb-4">
                                <Loader className="animate-spin" style={{ color: 'var(--ut-green)', width: 64, height: 64 }} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Validando Documentos...</h3>
                            <p style={{ color: '#6b7280', maxWidth: 400 }}>
                                El departamento de estadías está verificando tu información.
                            </p>
                            <div style={{ marginTop: '2rem', width: '100%', maxWidth: 400 }}>
                                {(stageName === 'check_1' ? INITIAL_DOCS : GENERATED_DOCS).map(doc => (
                                    <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderBottom: '1px solid #f3f4f6', padding: '0.5rem 0' }}>
                                        <span>{doc}</span>
                                        {checkStatus[doc] === 'ok' ? (
                                            <CheckCheck color="var(--ut-green)" size={16} />
                                        ) : (
                                            <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #e5e7eb' }}></span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STAGE 3: GENERATE DOCS */}
                    {stageName === 'generate_1' && (
                        <div className="text-center" style={{ padding: '1rem 0' }}>
                            <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--ut-green)' }}>
                                <CheckCheck size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>¡Documentación Autorizada!</h3>
                            <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2.5rem auto', fontSize: '1rem' }}>
                                Verifica que los datos sean correctos y edita el contenido si es necesario antes de descargar los formatos.
                            </p>

                            <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
                                {GENERATED_DOCS.map(doc => (
                                    <div key={doc} style={{
                                        background: 'white',
                                        padding: '2rem',
                                        borderRadius: '1rem',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        border: '1px solid #f3f4f6'
                                    }}>
                                        <div style={{
                                            width: 56, height: 56,
                                            background: '#F97316',
                                            borderRadius: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            marginBottom: '1rem'
                                        }}>
                                            <FileText size={28} />
                                        </div>
                                        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                                            {doc}
                                        </h4>
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

                            <button onClick={handleGenerate} className="btn btn-primary" style={{ maxWidth: '400px' }}>
                                Continuar (Subir Reportes)
                                <Download size={18} />
                            </button>
                        </div>
                    )}

                    {/* STAGE 4: RE-UPLOAD */}
                    {stageName === 'upload_2' && (
                        <div>
                            <div className="flex-between stage-header mb-6">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText color="var(--ut-orange)" />
                                    2. Carga de Documentos Finales
                                </h3>
                                <span className="tag">
                                    {Object.keys(uploads2).length} / {GENERATED_DOCS.length}
                                </span>
                            </div>
                            <p style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                Sube los documentos generados debidamente requisitados y firmados.
                            </p>
                            <div style={{ maxWidth: 600, margin: '0 auto', display: 'grid', gap: '1rem' }}>
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
                            <div className="flex-end" style={{ marginTop: '2rem' }}>
                                <button
                                    onClick={handleValidation2}
                                    disabled={Object.keys(uploads2).length < GENERATED_DOCS.length}
                                    className="btn btn-primary"
                                >
                                    Validar Documentos
                                </button>
                            </div>
                        </div>
                    )}



                    {/* STAGE 7: FINISH */}
                    {stageName === 'finish' && (
                        <div className="text-center" style={{ padding: '2rem 0' }}>
                            <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '50%', background: '#dcfce7', color: 'var(--ut-green)', marginBottom: '1.5rem' }}>
                                <CheckCheck size={48} />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--ut-green)', lineHeight: 1.2 }}>¡Entrega de documentos concluida!</h2>
                            <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '2.5rem' }}>
                                Has finalizado exitosamente el proceso de estadías.
                            </p>

                            <div style={{
                                background: 'white',
                                borderRadius: '1.5rem',
                                padding: '2rem',
                                maxWidth: '600px',
                                margin: '0 auto 3rem auto',
                                border: '2px solid #FED7AA',
                                boxShadow: '0 10px 30px -10px rgba(251, 146, 60, 0.2)'
                            }}>
                                <h3 style={{ color: '#C2410C', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <AlertTriangle size={24} />
                                    Siguiente paso
                                </h3>
                                <p style={{ color: '#9A3412', fontSize: '1rem', lineHeight: '1.6' }}>
                                    Por favor acude a la Dirección de Carrera o al Departamento de Estadías para <strong>entregar tu expediente físico</strong> completo para su resguardo final.
                                </p>
                            </div>



                            <button onClick={() => { sessionStorage.clear(); window.location.href = '/login'; }} className="btn" style={{ color: '#6b7280' }}>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modal de Previsualización y Edición */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={modalMode === 'preview' ? `Vista Previa: ${editingDoc}` : `Editar Datos: ${editingDoc}`}
                footer={
                    modalMode === 'preview' ? (
                        <>
                            <button onClick={handleSwitchToEdit} className="btn" style={{ background: '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Edit size={16} /> Editar
                            </button>
                            <button onClick={handleApproveAndDownload} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={16} /> Aprobar y Descargar
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setModalMode('preview')} className="btn" style={{ background: '#f3f4f6' }}>Cancelar Edición</button>
                            <button onClick={handleSaveEdit} className="btn btn-primary">Guardar Cambios</button>
                        </>
                    )
                }
            >
                {modalMode === 'preview' ? (
                    <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                        <div style={{ marginBottom: '1rem', borderBottom: '1px dashed #d1d5db', paddingBottom: '0.5rem', fontWeight: 600, color: '#374151', textAlign: 'center' }}>
                            DOCUMENTO PRELIMINAR
                        </div>
                        <div className="grid-2" style={{ gap: '1rem', fontSize: '0.9rem' }}>
                            <div style={{ fontWeight: 600, color: '#6b7280' }}>Alumno:</div>
                            <div style={{ fontWeight: 500 }}>{docData.studentName}</div>

                            <div style={{ fontWeight: 600, color: '#6b7280' }}>Matrícula:</div>
                            <div style={{ fontWeight: 500 }}>{docData.matricula}</div>

                            <div style={{ fontWeight: 600, color: '#6b7280' }}>Empresa:</div>
                            <div style={{ fontWeight: 500 }}>{docData.companyName}</div>

                            <div style={{ fontWeight: 600, color: '#6b7280' }}>Proyecto:</div>
                            <div style={{ fontWeight: 500 }}>{docData.projectTitle}</div>

                            <div style={{ fontWeight: 600, color: '#6b7280' }}>Asesor:</div>
                            <div style={{ fontWeight: 500 }}>{docData.advisor}</div>
                        </div>
                        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
                            * Este es un visor de datos preliminar. El formato final .pdf tendrá el diseño oficial de la universidad.
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                            Corrige los datos necesarios. Estos cambios se reflejarán en el documento generado.
                        </p>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Nombre del Alumno</label>
                                <input type="text" className="input" value={docData.studentName} onChange={e => setDocData({ ...docData, studentName: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Matrícula</label>
                                <input type="text" className="input" value={docData.matricula} disabled style={{ background: '#f3f4f6' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Empresa</label>
                                <input type="text" className="input" value={docData.companyName} onChange={e => setDocData({ ...docData, companyName: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Proyecto</label>
                                <input type="text" className="input" value={docData.projectTitle} onChange={e => setDocData({ ...docData, projectTitle: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Asesor Empresarial</label>
                                <input type="text" className="input" value={docData.advisor} onChange={e => setDocData({ ...docData, advisor: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div >
    );
}
