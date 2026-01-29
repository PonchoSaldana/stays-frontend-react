import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Download, FileText, Loader, ShieldCheck, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AvatarPath from '../components/AvatarPath';
import FileUploader from '../components/FileUploader';
import confetti from 'canvas-confetti';

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
    // Estado local para simulacion de persistencia
    const [uploads1, setUploads1] = useState(() => JSON.parse(localStorage.getItem('up1') || '{}'));
    const [uploads2, setUploads2] = useState(() => JSON.parse(localStorage.getItem('up2') || '{}'));

    const [checkStatus, setCheckStatus] = useState({});
    const [adminSigning, setAdminSigning] = useState(false);

    // Calcula el progreso visual basado en la etapa actual
    const getProgress = (st) => {
        switch (st) {
            case 'upload_1': return (Object.keys(uploads1).length / INITIAL_DOCS.length) * 30;
            case 'check_1': return 35;
            case 'generate_1': return 50;
            case 'upload_2': return 50 + (Object.keys(uploads2).length / GENERATED_DOCS.length) * 20;
            case 'check_2': return 75;
            case 'sign': return 90;
            case 'finish': return 100;
            default: return 0;
        }
    };

    const progress = getProgress(stageName);

    // Simula auto-guardado en localStorage
    useEffect(() => {
        localStorage.setItem('up1', JSON.stringify(uploads1));
        localStorage.setItem('up2', JSON.stringify(uploads2));
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
            setTimeout(() => navigate('/estadia/firma-digital'), 2500);
        }
        if (stageName === 'sign') {
            setTimeout(() => setAdminSigning(true), 500);
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

    // Simula la firma electrónica por parte del administrador
    const handleAdminSign = () => {
        setAdminSigning(true);
        setTimeout(() => {
            navigate('/estadia/finalizado');
        }, 3000);
    };

    return (
        <div className="process-container">
            <div className="text-center mb-6">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>Gestión de Estadías</h2>
                <p style={{ color: '#6b7280' }}>Alumno: <span style={{ color: 'var(--ut-green)', fontWeight: 600, fontFamily: 'monospace' }}>{userMatricula}</span></p>
            </div>

            <AvatarPath progress={progress} currentStage={
                stageName === 'upload_1' ? 'Cargando Documentos' :
                    stageName.includes('check') ? 'Validando' :
                        stageName === 'generate_1' ? 'Generando' :
                            stageName === 'sign' ? 'Firmando' :
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
                            <div className="flex-between mb-6">
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
                        <div className="text-center" style={{ padding: '2.5rem 0' }}>
                            <div style={{ width: 80, height: 80, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--ut-green)' }}>
                                <CheckCheck size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>¡Estadía Autorizada!</h3>
                            <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem auto' }}>
                                Ahora puedes descargar los formatos de los documentos requeridos.
                            </p>

                            <div className="grid-3" style={{ marginBottom: '2rem', gap: '2rem' }}>
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
                                            width: 64, height: 64,
                                            background: '#F97316', // Orange
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            marginBottom: '1rem'
                                        }}>
                                            <FileText size={32} strokeWidth={2} />
                                        </div>
                                        <h4 style={{
                                            fontSize: '1.125rem',
                                            fontWeight: 700,
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {doc}
                                        </h4>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: '#16A34A', // Green
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            cursor: 'pointer'
                                        }}>
                                            Descargar PDF <Download size={14} />
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleGenerate} className="btn btn-primary">
                                Continuar (Subir Reportes)
                                <Download size={18} />
                            </button>
                        </div>
                    )}

                    {/* STAGE 4: RE-UPLOAD */}
                    {stageName === 'upload_2' && (
                        <div>
                            <div className="flex-between mb-6">
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

                    {/* STAGE 6: ADMIN SIGN */}
                    {stageName === 'sign' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', textAlign: 'center' }}>
                            {!adminSigning ? (
                                <>
                                    <div style={{ width: 80, height: 80, background: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--ut-orange)' }}>
                                        <ShieldCheck size={40} />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>En espera de Liberación</h3>
                                    <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem auto' }}>
                                        Tus reportes han sido aprobados. El Director de Carrera está revisando tu expediente para la liberación final.
                                    </p>
                                    <button onClick={handleAdminSign} className="btn btn-primary">
                                        Firmar Liberación (Admin)
                                        <PenTool size={18} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                        <div style={{ width: 96, height: 96, background: 'white', borderRadius: '50%', border: '4px solid var(--ut-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ut-green)', zIndex: 10, position: 'relative' }}>
                                            <PenTool size={40} />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Firmando Documentos...</h3>
                                    <p style={{ color: '#6b7280' }}>Aplicando firma electrónica avanzada...</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* STAGE 7: FINISH */}
                    {stageName === 'finish' && (
                        <div className="text-center" style={{ padding: '2rem 0' }}>
                            <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '50%', background: '#dcfce7', color: 'var(--ut-green)', marginBottom: '1.5rem' }}>
                                <CheckCheck size={48} />
                            </div>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--ut-green)' }}>¡Entrega de documentos concluida!</h2>
                            <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '2.5rem' }}>
                                Has finalizado exitosamente el proceso de estadías.
                            </p>

                            <div style={{
                                background: '#FFF7ED',
                                borderRadius: '1rem',
                                padding: '2rem',
                                maxWidth: '600px',
                                margin: '0 auto 3rem auto',
                                border: '1px solid #FED7AA'
                            }}>
                                <h3 style={{ color: '#C2410C', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                                    Siguiente paso:
                                </h3>
                                <p style={{ color: '#9A3412', fontSize: '1rem', lineHeight: '1.5' }}>
                                    Por favor acude a la Dirección de Carrera o al Departamento de Estadías para <strong>entregar tu expediente físico</strong> completo para su resguardo final.
                                </p>
                            </div>

                            <div className="grid-3" style={{ marginBottom: '3rem', gap: '2rem' }}>
                                {FINAL_DOCS.map(doc => (
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
                                            width: 64, height: 64,
                                            background: '#F97316',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            marginBottom: '1rem'
                                        }}>
                                            <FileText size={32} strokeWidth={2} />
                                        </div>
                                        <h4 style={{
                                            fontSize: '1.125rem',
                                            fontWeight: 700,
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {doc}
                                        </h4>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: '#16A34A',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            cursor: 'pointer'
                                        }}>
                                            Descargar PDF <Download size={14} />
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="btn" style={{ color: '#6b7280' }}>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
