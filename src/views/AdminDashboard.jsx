import React, { useState, useEffect } from 'react';
import { Users, Search, FolderOpen, ArrowLeft, FileText, CheckCircle, Clock, Settings, Shield, UserPlus, UserX, UserCheck, LogOut, Database, Upload, XCircle, Send, MessageSquare, Building, File, Trash2, Download, PieChart as PieChartIcon, RefreshCw, Edit, GraduationCap, Briefcase, CloudUpload } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { read, utils, writeFile } from 'xlsx';
import logoUt from '../assets/logo-ut.png';
import Modal from '../components/Modal';

const CAREERS = [
    // --- Ingenierías y Licenciaturas ---
    { id: 'ing-soft', name: 'Ingeniería en Desarrollo y Gestión de Software', type: 'Ingeniería' },
    { id: 'ing-red', name: 'Ingeniería en Redes Inteligentes y Ciberseguridad', type: 'Ingeniería' },
    { id: 'ing-ind', name: 'Ingeniería Industrial', type: 'Ingeniería' },
    { id: 'ing-mec', name: 'Ingeniería Mecatrónica', type: 'Ingeniería' },
    { id: 'ing-proc', name: 'Ingeniería en Procesos y Operaciones Industriales', type: 'Ingeniería' },
    { id: 'ing-man', name: 'Ingeniería en Mantenimiento Industrial', type: 'Ingeniería' },
    { id: 'ing-bio', name: 'Ingeniería en Procesos Bioalimentarios', type: 'Ingeniería' },
    { id: 'ing-agr', name: 'Ingeniería en Agricultura Sustentable y Protegida', type: 'Ingeniería' },
    { id: 'ing-neg', name: 'Ingeniería en Negocios y Gestión Empresarial', type: 'Ingeniería' },
    { id: 'ing-proy', name: 'Ingeniería en Gestión de Proyectos', type: 'Ingeniería' },
    { id: 'ing-fin', name: 'Ingeniería Financiera y Fiscal', type: 'Ingeniería' },
    { id: 'lic-con', name: 'Licenciatura en Contaduría', type: 'Licenciatura' },
    { id: 'lic-inn', name: 'Licenciatura en Innovación de Negocios y Mercadotecnia', type: 'Licenciatura' },
    { id: 'lic-cap', name: 'Licenciatura en Gestión del Capital Humano', type: 'Licenciatura' },

    // --- Técnico Superior Universitario (TSU) ---
    { id: 'tsu-ti-soft', name: 'TSU en TI Área Desarrollo de Software Multiplataforma', type: 'TSU' },
    { id: 'tsu-ti-red', name: 'TSU en TI Área Infraestructura de Redes Digitales', type: 'TSU' },
    { id: 'tsu-pi-man', name: 'TSU en Procesos Industriales Área Manufactura', type: 'TSU' },
    { id: 'tsu-pi-auto', name: 'TSU en Procesos Industriales Área Automotriz', type: 'TSU' },
    { id: 'tsu-man-ind', name: 'TSU en Mantenimiento Área Industrial', type: 'TSU' },
    { id: 'tsu-mec-auto', name: 'TSU en Mecatrónica Área Automatización', type: 'TSU' },
    { id: 'tsu-dn-mer', name: 'TSU en Desarrollo de Negocios Área Mercadotecnia', type: 'TSU' },
    { id: 'tsu-adm-cap', name: 'TSU en Administración Área Capital Humano', type: 'TSU' },
    { id: 'tsu-adm-proy', name: 'TSU en Administración Área Formulación y Evaluación de Proyectos', type: 'TSU' },
    { id: 'tsu-con', name: 'TSU en Contaduría', type: 'TSU' },
    { id: 'tsu-ali', name: 'TSU en Procesos Alimentarios', type: 'TSU' },
    { id: 'tsu-agr', name: 'TSU en Agricultura Sustentable y Protegida', type: 'TSU' },
    { id: 'tsu-qui', name: 'TSU en Química Área Tecnología Ambiental', type: 'TSU' },
    { id: 'tsu-qui', name: 'TSU en Química Área Tecnología Ambiental', type: 'TSU' },
];

const API_URL = 'http://localhost:3001/api';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('supervision');

    // Configuración del Usuario Actual
    const currentUser = JSON.parse(localStorage.getItem('ut_admin_session') || '{}');
    const isRoot = (currentUser.username?.toLowerCase() === 'root' || currentUser.role === 'ROOT');

    // --- Estado para la Base de Datos de Estudiantes ---
    const [localStudents, setLocalStudents] = useState([]);
    const [previewData, setPreviewData] = useState([]); // Arreglo genérico para previsualización
    const [previewType, setPreviewType] = useState(null); // 'students' | 'companies'
    const [uploadError, setUploadError] = useState(null);

    // --- Estado para Supervisión ---
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // State para acciones de Aprobar/Regresar
    const [rejectAction, setRejectAction] = useState({ id: null, comment: '' });

    // Inicialización de datos (Backend API)
    useEffect(() => {
        fetchStudents();
        fetchCompanies();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_URL}/students`);
            if (res.ok) {
                const data = await res.json();
                setLocalStudents(data.map(s => ({
                    ...s,
                    id: s.matricula,
                    status: s.status || 'Pendiente',
                    careerId: CAREERS.find(c => {
                        const cName = c.name.toLowerCase();
                        const sName = (s.careerName || s.carrera || '').toLowerCase(); // Fallback check
                        return cName === sName || sName.includes(cName) || cName.includes(sName);
                    })?.id || 'unknown'
                })));
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const res = await fetch(`${API_URL}/companies`);
            if (res.ok) {
                const data = await res.json();
                setCompanies(data);
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    // Filtra alumnos según la carrera seleccionada y el término de búsqueda
    const filteredStudents = selectedCareer
        ? localStudents.filter(s => s.careerId === selectedCareer.id && (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(s.matricula).includes(searchTerm)))
        : [];

    const getStudentCount = (careerId) => localStudents.filter(s => s.careerId === careerId).length;

    // --- Handlers de Acciones ---

    // Aprueba al estudiante
    const handleApprove = (student) => {
        const updated = localStudents.map(s =>
            s.id === student.id ? { ...s, status: 'Aprobado' } : s
        );
        setLocalStudents(updated);
        // Actualizar LS si estamos usando datos persistentes
        if (localStorage.getItem('ut_students_db')) {
            localStorage.setItem('ut_students_db', JSON.stringify(updated));
        }
    };

    const initReject = (student) => {
        setRejectAction({ id: student.id, comment: '' });
    };

    // Confirma el rechazo y guarda el comentario
    const confirmReject = () => {
        if (!rejectAction.comment.trim()) return;

        const updated = localStudents.map(s =>
            s.id === rejectAction.id ? { ...s, status: 'Corrección Solicitada', comment: rejectAction.comment } : s
        );
        setLocalStudents(updated);
        if (localStorage.getItem('ut_students_db')) {
            localStorage.setItem('ut_students_db', JSON.stringify(updated));
        }
        setRejectAction({ id: null, comment: '' });
    };

    const cancelReject = () => {
        setRejectAction({ id: null, comment: '' });
    };

    // --- State para Gestión de Admins ---
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'ADMIN' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const storedAdmins = JSON.parse(localStorage.getItem('ut_admins_db') || '[]');
        setAdmins(storedAdmins);
    }, []);

    const [companies, setCompanies] = useState([]);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);
    const [newCompany, setNewCompany] = useState({
        name: '',
        address: '',
        contact: '',
        email: '',
        fileName: '',
        careerId: '',
        spots: 0,
        hasFinancialSupport: false
    });

    // --- State para Reasignación (Estadías) ---
    const [reasignSearch, setReasignSearch] = useState('');
    const [testMatricula, setTestMatricula] = useState(''); // Estado para verificador de datos

    // --- State para Asignación de Tareas (Root) ---
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedAdminForAssign, setSelectedAdminForAssign] = useState(null);
    const [tempAssignedCareers, setTempAssignedCareers] = useState([]);

    // --- State para Filtro de Nivel Académico ---
    const [viewLevel, setViewLevel] = useState('TSU'); // 'TSU' | 'ING'
    const [reasignStudent, setReasignStudent] = useState(null);
    const [reasignNewCompanyId, setReasignNewCompanyId] = useState('');

    const handleSearchForReasign = () => {
        if (!reasignSearch.trim()) return;

        // Búsqueda flexible (matricula o nombre)
        const term = reasignSearch.toLowerCase();
        const found = localStudents.find(s =>
            String(s.matricula).includes(term) ||
            s.name.toLowerCase().includes(term)
        );

        if (found) {
            setReasignStudent(found);
            setReasignNewCompanyId('');
        } else {
            setReasignStudent(null);
            setModalConfig({
                isOpen: true,
                title: 'No encontrado',
                type: 'info',
                content: <p>No se encontró ningún estudiante con "<strong>{reasignSearch}</strong>". Intenta con otro nombre o matrícula.</p>,
                footer: <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="btn btn-primary">Aceptar</button>
            });
        }
    };

    const handleReasignSubmit = () => {
        if (!reasignStudent || !reasignNewCompanyId) return;

        // 1. Actualizar estudiante en localStudents
        const updatedStudents = localStudents.map(s =>
            s.id === reasignStudent.id ? { ...s, companyId: reasignNewCompanyId, status: 'Pendiente', comment: 'Reasignación de Estadía realizada por Root.' } : s
        );
        setLocalStudents(updatedStudents);
        localStorage.setItem('ut_students_db', JSON.stringify(updatedStudents));

        // 2. Feedback
        const companyName = companies.find(c => c.id == reasignNewCompanyId)?.name;

        setModalConfig({
            isOpen: true,
            title: 'Reasignación Exitosa',
            type: 'success',
            content: <p>El estudiante <strong>{reasignStudent.name}</strong> ha sido reasignado a la empresa <strong>{companyName}</strong>. Su estatus ha pasado a "Pendiente" para reiniciar el proceso.</p>,
            footer: <button onClick={() => { setModalConfig({ ...modalConfig, isOpen: false }); setReasignStudent(null); setReasignSearch(''); }} className="btn btn-primary">Aceptar</button>
        });
    };

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, footer: null, type: 'info' });



    const handleCreateCompany = (e) => {
        e.preventDefault();
        if (!newCompany.name) return;

        let updated;
        if (isEditingCompany) {
            updated = companies.map(c => c.id === currentCompanyId ? { ...newCompany, id: currentCompanyId } : c);
            setModalConfig({
                isOpen: true,
                title: 'Empresa Actualizada',
                type: 'success',
                content: <p>La empresa <strong>{newCompany.name}</strong> se ha actualizado correctamente.</p>,
                footer: <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="btn btn-primary">Aceptar</button>
            });
        } else {
            updated = [...companies, { ...newCompany, id: Date.now() }];
            setModalConfig({
                isOpen: true,
                title: 'Empresa Registrada',
                type: 'success',
                content: <p>La empresa <strong>{newCompany.name}</strong> se ha registrado correctamente en el catálogo.</p>,
                footer: <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="btn btn-primary">Aceptar</button>
            });
        }

        setCompanies(updated);
        localStorage.setItem('ut_companies_db', JSON.stringify(updated));

        // Reset form
        setNewCompany({ name: '', address: '', contact: '', email: '', fileName: '', careerId: '', spots: 0, hasFinancialSupport: false });
        setIsCreatingCompany(false);
        setIsEditingCompany(false);
        setCurrentCompanyId(null);
    };

    const handleEditCompany = (company) => {
        setNewCompany(company);
        setCurrentCompanyId(company.id);
        setIsEditingCompany(true);
        setIsCreatingCompany(true); // Reusamos el formulario
    };

    const handleCancelCompanyForm = () => {
        setIsCreatingCompany(false);
        setIsEditingCompany(false);
        setCurrentCompanyId(null);
        setNewCompany({ name: '', address: '', contact: '', email: '', fileName: '', careerId: '', spots: 0, hasFinancialSupport: false });
    };

    const handleDeleteCompany = (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta empresa?')) {
            const updated = companies.filter(c => c.id !== id);
            setCompanies(updated);
            localStorage.setItem('ut_companies_db', JSON.stringify(updated));
        }
    };

    // Crea un nuevo administrador
    const handleCreateAdmin = (e) => {
        e.preventDefault();
        if (!newAdmin.username || !newAdmin.password) return;
        const updatedAdmins = [...admins, { ...newAdmin, id: Date.now(), assignedCareers: [] }];
        localStorage.setItem('ut_admins_db', JSON.stringify(updatedAdmins));
        setAdmins(updatedAdmins);
        setNewAdmin({ username: '', password: '', role: 'ADMIN' });
        setIsCreating(false);
    };

    const handleDeleteAdmin = (username) => {
        if (window.confirm(`¿Eliminar administrador ${username}?`)) {
            const updated = admins.filter(a => a.username !== username);
            setAdmins(updated);
            localStorage.setItem('ut_admins_db', JSON.stringify(updated));
        }
    };

    // --- Funciones de Asignación de Tareas ---
    const openAssignModal = (admin) => {
        setSelectedAdminForAssign(admin);
        setTempAssignedCareers(admin.assignedCareers || []);
        setAssignModalOpen(true);
    };

    const toggleCareerAssignment = (careerId) => {
        setTempAssignedCareers(prev =>
            prev.includes(careerId)
                ? prev.filter(id => id !== careerId)
                : [...prev, careerId]
        );
    };

    const saveAssignments = () => {
        const updatedAdmins = admins.map(a =>
            a.username === selectedAdminForAssign.username
                ? { ...a, assignedCareers: tempAssignedCareers }
                : a
        );
        setAdmins(updatedAdmins);
        localStorage.setItem('ut_admins_db', JSON.stringify(updatedAdmins));
        setAssignModalOpen(false);
        setSelectedAdminForAssign(null);
    };

    // Calcular progreso de un admin
    const getAdminProgress = (admin) => {
        if (!admin.assignedCareers || admin.assignedCareers.length === 0) return { total: 0, reviewed: 0, percentage: 0 };

        let totalFiles = 0;
        let reviewedFiles = 0;

        admin.assignedCareers.forEach(careerId => {
            const studentsInCareer = localStudents.filter(s => s.careerId === careerId);
            totalFiles += studentsInCareer.length;
            reviewedFiles += studentsInCareer.filter(s => s.status !== 'Pendiente').length; // Asumiendo 'Pendiente' es no revisado
        });

        return {
            total: totalFiles,
            reviewed: reviewedFiles,
            percentage: totalFiles === 0 ? 0 : Math.round((reviewedFiles / totalFiles) * 100)
        };
    };

    // Dashboard para Admin NO Root (Filtrado)
    const availableCareers = isRoot
        ? CAREERS
        : CAREERS.filter(c => currentUser.assignedCareers?.includes(c.id));

    const myProgress = !isRoot ? getAdminProgress(admins.find(a => a.username === currentUser.username) || {}) : null;

    const handleCompanyFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simulamos la carga guardando solo el nombre
            setNewCompany({ ...newCompany, fileName: file.name });
        }
    };

    // --- Estado para archivo seleccionado ---
    const [selectedFile, setSelectedFile] = useState(null);

    // --- Lógica de Carga de Excel ---
    const handleFileUpload = (e, type) => {
        setUploadError(null);
        setPreviewType(type);
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file); // Guardamos archivo para enviar al backend

        // Preview simple para que el usuario vea qué está por subir
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const wb = read(event.target.result, { type: 'binary' });
                const wsName = wb.SheetNames[0];
                const ws = wb.Sheets[wsName];
                const data = utils.sheet_to_json(ws);

                if (data.length === 0) {
                    setUploadError('El archivo parece estar vacío.');
                    return;
                }

                setPreviewData(data.slice(0, 50)); // Solo primeras 50 filas para preview
            } catch (error) {
                console.error(error);
                setUploadError('Error al leer el archivo Excel.');
            }
        };
        reader.readAsBinaryString(file);
    };

    // Guarda los datos importados en la base de datos (BACKEND API)
    const handleSaveDatabase = async () => {
        if (!selectedFile || !previewType) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        const endpoint = previewType === 'students' ? 'students' : 'companies';

        try {
            const res = await fetch(`${API_URL}/import/${endpoint}`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const result = await res.json();
                alert(`✅ Importación Exitosa: ${result.count} ${previewType === 'students' ? 'alumnos' : 'empresas'} importados.`);

                // Recargar datos desde el servidor
                if (endpoint === 'students') {
                    await fetchStudents();
                } else {
                    await fetchCompanies();
                }

                // Limpiar estado
                setPreviewData([]);
                setPreviewType(null);
                setSelectedFile(null);
            } else {
                const err = await res.json();
                alert(`❌ Error: ${err.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error(error);
            alert("❌ Error de conexión. Asegúrate de que el backend esté corriendo.");
        }
    };

    // Exporta la base de datos a Excel
    const handleExportExcel = () => {
        const ws = utils.json_to_sheet(localStudents);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Base de Datos Completa");
        writeFile(wb, `BD_Alumnos_UT_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // Simula descarga de Documentos (ZIP)
    const handleDownloadDocuments = () => {
        // En un entorno real, esto llamaría a un endpoint del backend que genera un ZIP
        setTimeout(() => {
            setModalConfig({
                isOpen: true,
                title: 'Descarga Iniciada',
                type: 'success',
                content: (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ margin: '0 auto 1rem', width: 48, height: 48, background: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FolderOpen size={24} />
                        </div>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>Generando paquete ZIP...</p>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                            Se ha iniciado la descarga del archivo comprimido con los expedientes de todos los alumnos.
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
                            (Simulación: En producción esto descargará un .zip real)
                        </p>
                    </div>
                ),
                footer: (
                    <button
                        onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                        className="btn"
                        style={{ background: '#10B981', color: 'white', width: '100%', justifyContent: 'center' }}
                    >
                        Entendido
                    </button>
                )
            });
        }, 500);
    };

    // --- State para Perfil ---
    const [newPassword, setNewPassword] = useState('');

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        alert("Contraseña actualizada correctamente (Simulación)");
        setNewPassword('');
    };

    const handleLogoutClick = () => {
        setModalConfig({
            isOpen: true,
            title: 'Cerrar Sesión (Admin)',
            type: 'danger',
            content: <p>¿Seguro que deseas salir del panel administrativo?</p>,
            footer: (
                <>
                    <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="btn" style={{ background: '#f3f4f6' }}>Cancelar</button>
                    <button onClick={handleLogout} className="btn" style={{ background: '#DC2626', color: 'white' }}>Salir</button>
                </>
            )
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('ut_admin_session');
        window.location.reload();
    };

    const renderSupervisionView = () => {
        // Filtrar carreras según el nivel seleccionado y las asignadas
        const displayedCareers = availableCareers.filter(c =>
            viewLevel === 'TSU' ? c.type === 'TSU' : (c.type === 'Ingeniería' || c.type === 'Licenciatura')
        );

        return (
            <div className="layout-fade-in">
                {!isRoot && myProgress && (
                    <div className="process-card mb-6" style={{ background: 'linear-gradient(to right, #f0fdf4, #ffffff)', border: '1px solid #bbf7d0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={24} /> Mi Trabajo Asignado
                        </h3>
                        <div className="flex-between">
                            <p style={{ color: '#15803d', marginBottom: '0.5rem' }}>
                                Has revisado <strong>{myProgress.reviewed}</strong> de <strong>{myProgress.total}</strong> expedientes asignados.
                            </p>
                            <span className="tag" style={{ background: '#dcfce7', color: '#166534' }}>Global</span>
                        </div>
                        <div style={{ height: '1.5rem', width: '100%', background: '#dcfce7', borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#22c55e', width: `${myProgress.percentage}%`, transition: 'width 0.5s ease' }}></div>
                        </div>
                    </div>
                )}

                {!selectedCareer ? (
                    // Vista de Lista de Carreras
                    <div>
                        <div className="section-header mb-6">
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>Supervisión de Alumnos</h2>
                                <p style={{ color: '#6b7280' }}>Selecciona el nivel académico y la carrera a supervisar.</p>
                            </div>
                        </div>

                        {/* Selector de Nivel Académico */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                onClick={() => setViewLevel('TSU')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '2rem',
                                    border: viewLevel === 'TSU' ? '1px solid #86efac' : '1px solid #e5e7eb',
                                    background: viewLevel === 'TSU' ? '#f0fdf4' : 'white',
                                    color: viewLevel === 'TSU' ? '#166534' : '#6b7280',
                                    fontWeight: viewLevel === 'TSU' ? 600 : 500,
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s',
                                    boxShadow: viewLevel === 'TSU' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                                }}
                            >
                                <GraduationCap size={18} />
                                Técnico Superior Universitario
                            </button>
                            <button
                                onClick={() => setViewLevel('ING')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '2rem',
                                    border: viewLevel === 'ING' ? '1px solid #fdba74' : '1px solid #e5e7eb',
                                    background: viewLevel === 'ING' ? '#fff7ed' : 'white',
                                    color: viewLevel === 'ING' ? '#9a3412' : '#6b7280',
                                    fontWeight: viewLevel === 'ING' ? 600 : 500,
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s',
                                    boxShadow: viewLevel === 'ING' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                                }}
                            >
                                <Briefcase size={18} />
                                Ingenierías y Licenciaturas
                            </button>
                        </div>

                        <div className="grid-3">
                            {displayedCareers.map(career => {
                                const count = getStudentCount(career.id);
                                return (
                                    <div
                                        key={career.id}
                                        className="card-hover"
                                        style={{
                                            background: 'white',
                                            padding: '1.5rem',
                                            borderRadius: '0.75rem',
                                            cursor: 'pointer',
                                            border: '1px solid #f3f4f6',
                                            borderLeft: `4px solid ${viewLevel === 'TSU' ? 'var(--ut-green)' : 'var(--ut-orange)'}`
                                        }}
                                        onClick={() => { setSelectedCareer(career); setSearchTerm(''); }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div style={{ width: 48, height: 48, background: viewLevel === 'TSU' ? '#dcfce7' : '#fff7ed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: viewLevel === 'TSU' ? 'var(--ut-green)' : 'var(--ut-orange)' }}>
                                                <FolderOpen size={24} />
                                            </div>
                                            <span className="tag">{career.type}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem', minHeight: '3.5rem' }}>
                                            {career.name}
                                        </h3>
                                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                            {count} Alumnos registrados
                                        </p>
                                    </div>
                                )
                            })}
                            {displayedCareers.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: '#9ca3af', background: 'white', borderRadius: '1rem', border: '2px dashed #e5e7eb' }}>
                                    <FolderOpen size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No hay carreras asignadas</h3>
                                    <p>No tienes asignaciones correspondientes al nivel <strong>{viewLevel === 'TSU' ? 'TSU' : 'Ingeniería/Licenciatura'}</strong>.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div className="flex-between mb-6">
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                    {selectedCareer ? selectedCareer.name : 'Supervisión de Documentos'}
                                </h2>
                                <p style={{ color: '#6b7280' }}>
                                    {selectedCareer ? 'Listado de alumnos y estado de documentación' : 'Selecciona una carrera para ver los expedientes'}
                                </p>
                            </div>
                            {selectedCareer && (
                                <button onClick={() => setSelectedCareer(null)} className="btn" style={{ background: '#e5e7eb', color: '#374151' }}>
                                    <ArrowLeft size={18} /> Volver
                                </button>
                            )}
                        </div>
                        <div className="process-card" style={{ marginTop: 0 }}>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Buscar por nombre o matrícula..."
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--ut-dark)' }}>{filteredStudents.length}</span> resultados
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                                            <th style={{ padding: '1rem', color: '#374151' }}>Matrícula</th>
                                            <th style={{ padding: '1rem', color: '#374151' }}>Estudiante</th>
                                            <th style={{ padding: '1rem', color: '#374151' }}>Estado</th>
                                            <th style={{ padding: '1rem', color: '#374151' }}>Documentos</th>
                                            <th style={{ padding: '1rem', color: '#374151' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map(student => (
                                            <tr key={student.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 500 }}>{student.matricula}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 500 }}>{student.name}</div>
                                                    {student.comment && (
                                                        <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <MessageSquare size={12} /> {student.comment}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className="tag" style={{
                                                        background: student.status === 'Aprobado' ? '#DEF7EC' : student.status === 'Corrección Solicitada' ? '#FEF2F2' : '#FEF3C7',
                                                        color: student.status === 'Aprobado' ? '#03543F' : student.status === 'Corrección Solicitada' ? '#991B1B' : '#92400E',
                                                        display: 'inline-flex', alignItems: 'center', gap: 4
                                                    }}>
                                                        {student.status === 'Aprobado' ? <CheckCircle size={12} /> : student.status === 'Corrección Solicitada' ? <XCircle size={12} /> : <Clock size={12} />}
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                                                        <FileText size={16} />
                                                        <span>{student.docsCount} archivos</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {rejectAction.id === student.id ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <textarea
                                                                className="input"
                                                                placeholder="Describe la corrección..."
                                                                value={rejectAction.comment}
                                                                onChange={e => setRejectAction({ ...rejectAction, comment: e.target.value })}
                                                                style={{ fontSize: '0.8rem', padding: '0.5rem', minHeight: '60px' }}
                                                                autoFocus
                                                            />
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button
                                                                    onClick={confirmReject}
                                                                    className="btn btn-primary"
                                                                    disabled={!rejectAction.comment}
                                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: '#DC2626' }}>
                                                                    Enviar Corrección
                                                                </button>
                                                                <button
                                                                    onClick={cancelReject}
                                                                    className="btn"
                                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#f3f4f6', color: '#374151' }}>
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => handleApprove(student)}
                                                                title="Aprobar"
                                                                className="btn"
                                                                style={{ padding: '0.5rem', background: '#DEF7EC', color: '#03543F', border: '1px solid #BDF4C8' }}
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => initReject(student)}
                                                                title="Regresar / Corregir"
                                                                className="btn"
                                                                style={{ padding: '0.5rem', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                            <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#F3F4F6', color: '#374151' }}>
                                                                Ver Exp.
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredStudents.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                                                    No se encontraron estudiantes con esos criterios.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );

    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row', background: '#f9fafb' }}>
            {/* Sidebar de Admin */}
            <aside style={{ width: '260px', background: 'white', borderRight: '1px solid #e5e7eb', padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100%', left: 0, top: 0, zIndex: 50 }}>
                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
                    <img src={logoUt} alt="Logo" style={{ height: 50, objectFit: 'contain' }} />
                    <div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Gestión Estadías</p>
                    </div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('supervision')}
                        className={`nav-item ${activeTab === 'supervision' ? 'active' : ''}`}
                        style={{ border: 'none', background: activeTab === 'supervision' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                        <FileText size={18} /> Documentos
                    </button>

                    <button
                        onClick={() => setActiveTab('companies')}
                        className={`nav-item ${activeTab === 'companies' ? 'active' : ''}`}
                        style={{ border: 'none', background: activeTab === 'companies' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                        <Building size={18} /> Empresas
                    </button>

                    <button
                        onClick={() => setActiveTab('database')}
                        className={`nav-item ${activeTab === 'database' ? 'active' : ''}`}
                        style={{ border: 'none', background: activeTab === 'database' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                        <Database size={18} /> Base de Datos
                    </button>

                    <button
                        onClick={() => setActiveTab('statistics')}
                        className={`nav-item ${activeTab === 'statistics' ? 'active' : ''}`}
                        style={{ border: 'none', background: activeTab === 'statistics' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                        <PieChartIcon size={18} /> Estadísticas
                    </button>

                    {isRoot && (
                        <>
                            <button
                                onClick={() => setActiveTab('admins')}
                                className={`nav-item ${activeTab === 'admins' ? 'active' : ''}`}
                                style={{ border: 'none', background: activeTab === 'admins' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                            >
                                <Users size={18} /> Administradores
                            </button>

                            <button
                                onClick={() => setActiveTab('reasignment')}
                                className={`nav-item ${activeTab === 'reasignment' ? 'active' : ''}`}
                                style={{ border: 'none', background: activeTab === 'reasignment' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                            >
                                <RefreshCw size={18} /> Reasignar Estadía
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        style={{ border: 'none', background: activeTab === 'profile' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                        <Settings size={18} /> Configuración
                    </button>
                </nav>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ut-orange)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {currentUser.username?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser.username}</p>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{currentUser.role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogoutClick} className="btn" style={{ width: '100%', justifyContent: 'center', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '260px', flex: 1, padding: '2rem' }}>
                {activeTab === 'supervision' && renderSupervisionView()}

                {activeTab === 'database' && (
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div className="flex-between mb-6">
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Base de Datos de Alumnos</h2>
                                <p style={{ color: '#6b7280' }}>Carga masiva de estudiantes mediante un archivo de Excel</p>
                            </div>
                            <div className="tag" style={{ background: '#E6F5EC', color: '#009B4D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Database size={16} />
                                <Database size={16} />
                                {localStudents.length} Registros actuales
                            </div>
                        </div>





                        {/* Nueva Sección de Descarga / Exportación */}
                        <div className="process-card mb-6" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                            <div className="flex-between">
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E40AF' }}>Exportar Información</h3>
                                    <p style={{ color: '#60A5FA', fontSize: '0.875rem' }}>Descarga la base de datos actual o el respaldo de documentos.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={handleExportExcel}
                                        className="btn"
                                        style={{ background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
                                    >
                                        <FileText size={18} />
                                        Descargar Excel
                                    </button>
                                    <button
                                        onClick={handleDownloadDocuments}
                                        className="btn"
                                        style={{ background: '#059669', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}
                                    >
                                        <FolderOpen size={18} />
                                        Descargar Docs (ZIP)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {/* Carga de Alumnos */}
                            <div className="process-card mb-6" style={{ marginTop: 0 }}>
                                <div
                                    style={{
                                        border: '2px dashed #e5e7eb',
                                        borderRadius: '0.75rem',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        background: '#f9fafb',
                                        marginBottom: '1rem',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>Alumnos</h3>

                                    <label
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            border: '2px dashed #93C5FD',
                                            borderRadius: '1rem',
                                            backgroundColor: '#EFF6FF',
                                            marginBottom: '1rem',
                                            transition: 'all 0.3s ease',
                                            height: '100%',
                                            minHeight: '220px'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.backgroundColor = '#DBEAFE'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#93C5FD'; e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ padding: '1rem', borderRadius: '50%', background: 'white', color: previewType === 'students' && selectedFile ? '#10B981' : localStudents.length > 0 ? '#10B981' : '#2563EB', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)' }}>
                                            {previewType === 'students' && selectedFile ? <CheckCircle size={40} strokeWidth={1.5} /> : localStudents.length > 0 ? <Database size={40} strokeWidth={1.5} /> : <CloudUpload size={40} strokeWidth={1.5} />}
                                        </div>

                                        {previewType === 'students' && selectedFile ? (
                                            <>
                                                <span style={{ fontWeight: 600, color: '#059669', fontSize: '1rem', marginBottom: '0.25rem' }}>✓ Archivo Cargado</span>
                                                <span style={{ fontSize: '0.8rem', color: '#10B981', marginBottom: '0.5rem', textAlign: 'center' }}>{selectedFile.name}</span>
                                                <p style={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center', maxWidth: '80%', margin: 0 }}>
                                                    {previewData.length} registros detectados<br />
                                                    <strong style={{ color: '#059669' }}>Listo para guardar ↓</strong>
                                                </p>
                                            </>
                                        ) : localStudents.length > 0 ? (
                                            <>
                                                <span style={{ fontWeight: 600, color: '#059669', fontSize: '1rem', marginBottom: '0.25rem' }}>✓ Base de Datos Activa</span>
                                                <span style={{ fontSize: '0.8rem', color: '#10B981', marginBottom: '0.5rem' }}>{localStudents.length} alumnos registrados</span>
                                                <p style={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center', maxWidth: '80%' }}>
                                                    Haz clic para <strong>actualizar</strong> o <strong>agregar</strong> más alumnos
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontWeight: 600, color: '#1E40AF', fontSize: '1rem', marginBottom: '0.25rem' }}>Subir Base de Datos</span>
                                                <span style={{ fontSize: '0.8rem', color: '#60A5FA', marginBottom: '1rem' }}>Formato Excel (.xlsx)</span>
                                                <p style={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center', maxWidth: '80%' }}>
                                                    Columnas requeridas:<br />
                                                    <strong>Matrícula, Nombre, Carrera...</strong>
                                                </p>
                                            </>
                                        )}

                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={(e) => handleFileUpload(e, 'students')}
                                            style={{ display: 'none' }}
                                        />
                                    </label>

                                    <button
                                        onClick={async () => {
                                            if (window.confirm('⚠️ ¿ESTÁS SEGURO? \n\nEsto borrará TODOS los alumnos registrados en el sistema de forma permanente.\n\n¿Deseas continuar?')) {
                                                try {
                                                    const res = await fetch(`${API_URL}/import/students`, { method: 'DELETE' });
                                                    if (res.ok) {
                                                        setLocalStudents([]);
                                                        alert('✅ Base de datos de alumnos eliminada correctamente.');
                                                    } else {
                                                        alert('❌ Error al eliminar alumnos');
                                                    }
                                                } catch (error) {
                                                    console.error(error);
                                                    alert('❌ Error de conexión al servidor');
                                                }
                                            }
                                        }}
                                        style={{
                                            fontSize: '0.75rem',
                                            color: '#EF4444',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                            width: '100%',
                                            opacity: 0.8
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
                                    >
                                        <Trash2 size={12} />
                                        Limpiar BD Alumnos
                                    </button>
                                </div>
                            </div>

                            {/* Carga de Empresas */}
                            <div className="process-card mb-6" style={{ marginTop: 0 }}>
                                <div
                                    style={{
                                        border: '2px dashed #e5e7eb',
                                        borderRadius: '0.75rem',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        background: '#f9fafb',
                                        marginBottom: '1rem',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>Empresas</h3>

                                    <label
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            border: '2px dashed #FDBA74',
                                            borderRadius: '1rem',
                                            backgroundColor: '#FFF7ED',
                                            marginBottom: '1rem',
                                            transition: 'all 0.3s ease',
                                            height: '100%',
                                            minHeight: '220px'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.backgroundColor = '#FFEDD5'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#FDBA74'; e.currentTarget.style.backgroundColor = '#FFF7ED'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ padding: '1rem', borderRadius: '50%', background: 'white', color: previewType === 'companies' && selectedFile ? '#10B981' : companies.length > 0 ? '#10B981' : '#EA580C', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.1)' }}>
                                            {previewType === 'companies' && selectedFile ? <CheckCircle size={40} strokeWidth={1.5} /> : companies.length > 0 ? <Database size={40} strokeWidth={1.5} /> : <CloudUpload size={40} strokeWidth={1.5} />}
                                        </div>

                                        {previewType === 'companies' && selectedFile ? (
                                            <>
                                                <span style={{ fontWeight: 600, color: '#059669', fontSize: '1rem', marginBottom: '0.25rem' }}>✓ Archivo Cargado</span>
                                                <span style={{ fontSize: '0.8rem', color: '#10B981', marginBottom: '0.5rem', textAlign: 'center' }}>{selectedFile.name}</span>
                                                <p style={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center', maxWidth: '80%', margin: 0 }}>
                                                    {previewData.length} registros detectados<br />
                                                    <strong style={{ color: '#059669' }}>Listo para guardar ↓</strong>
                                                </p>
                                            </>
                                        ) : companies.length > 0 ? (
                                            <>
                                                <span style={{ fontWeight: 600, color: '#059669', fontSize: '1rem', marginBottom: '0.25rem' }}>✓ Base de Datos Activa</span>
                                                <span style={{ fontSize: '0.8rem', color: '#10B981', marginBottom: '0.5rem' }}>{companies.length} empresas registradas</span>
                                                <p style={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center', maxWidth: '80%' }}>
                                                    Haz clic para <strong>actualizar</strong> o <strong>agregar</strong> más empresas
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontWeight: 600, color: '#C2410C', fontSize: '1rem', marginBottom: '0.25rem' }}>Subir Base de Datos</span>
                                                <span style={{ fontSize: '0.8rem', color: '#FB923C', marginBottom: '1rem' }}>Formato Excel (.xlsx)</span>
                                                <p style={{ color: '#6B7280', fontSize: '0.75rem', textAlign: 'center', maxWidth: '80%' }}>
                                                    Columnas requeridas:<br />
                                                    <strong>Empresa, Dirección, Giro...</strong>
                                                </p>
                                            </>
                                        )}

                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={(e) => handleFileUpload(e, 'companies')}
                                            style={{ display: 'none' }}
                                        />
                                    </label>

                                    <button
                                        onClick={async () => {
                                            if (window.confirm('⚠️ ¿ESTÁS SEGURO? \n\nEsto borrará TODAS las empresas del catálogo.\n\n¿Deseas continuar?')) {
                                                try {
                                                    const res = await fetch(`${API_URL}/import/companies`, { method: 'DELETE' });
                                                    if (res.ok) {
                                                        setCompanies([]);
                                                        alert('✅ Base de datos de empresas eliminada correctamente.');
                                                    } else {
                                                        alert('❌ Error al eliminar empresas');
                                                    }
                                                } catch (error) {
                                                    console.error(error);
                                                    alert('❌ Error de conexión al servidor');
                                                }
                                            }
                                        }}
                                        style={{
                                            fontSize: '0.75rem',
                                            color: '#EF4444',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                            width: '100%',
                                            opacity: 0.8
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
                                    >
                                        <Trash2 size={12} />
                                        Limpiar BD Empresas
                                    </button>
                                </div>
                            </div>
                        </div>


                        {uploadError && (
                            <div style={{ padding: '1rem', background: '#FEF2F2', color: '#DC2626', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                {uploadError}
                            </div>
                        )
                        }

                        {
                            previewData.length > 0 && (
                                <div className="process-card">
                                    <div className="flex-between mb-4">
                                        <h4 style={{ fontWeight: 600 }}>
                                            Vista Previa: {previewType === 'students' ? 'Alumnos' : 'Empresas'} ({previewData.length} registros)
                                        </h4>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => { setPreviewData([]); setPreviewType(null); }} className="btn" style={{ background: '#f3f4f6', color: '#374151' }}>Cancelar</button>
                                            <button onClick={handleSaveDatabase} className="btn btn-primary">Importar y Guardar</button>
                                        </div>
                                    </div>
                                    <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#f9fafb' }}>
                                                <tr>
                                                    {/* Encabezados dinámicos según archivo */}
                                                    {Object.keys(previewData[0] || {}).slice(0, 5).map(key => (
                                                        <th key={key} style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', textTransform: 'capitalize' }}>{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.slice(0, 50).map((row, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        {Object.values(row).slice(0, 5).map((val, idx) => (
                                                            <td key={idx} style={{ padding: '0.75rem' }}>{val}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }
                        {/* Verificador de Datos (Para que el usuario compruebe que "jala" la info) */}
                        <div className="process-card mb-6" style={{ borderLeft: '4px solid #8B5CF6' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
                                <Search size={18} style={{ display: 'inline', marginRight: '8px' }} />
                                Verificador de Datos Cargados
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                        Ingresa una matrícula para verificar que el sistema trae todos los datos correctamente del Excel:
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Ej: 20230001"
                                            value={testMatricula}
                                            onChange={(e) => setTestMatricula(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {testMatricula && (
                                <div style={{ marginTop: '1rem', background: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                    {(() => {
                                        const found = localStudents.find(s => String(s.matricula).includes(testMatricula));
                                        if (!found) return <span style={{ color: '#DC2626' }}>No se encontró ningún estudiante con esa matrícula. Asegúrate de haber cargado el Excel.</span>;
                                        return (
                                            <div>
                                                <p style={{ color: '#059669', fontWeight: 600, marginBottom: '0.5rem' }}>✓ Alumno encontrado:</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                                    {Object.entries(found).map(([key, val]) => (
                                                        <div key={key} style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #E5E7EB' }}>
                                                            <strong style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase' }}>{key}</strong>
                                                            <span style={{ wordBreak: 'break-all' }}>{String(val)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                    </div >
                )
                }

                {
                    activeTab === 'reasignment' && isRoot && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div className="flex-between mb-6">
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reasignación de Estadía</h2>
                                    <p style={{ color: '#6b7280' }}>Herramienta de emergencia para cambiar la empresa de un alumno.</p>
                                </div>
                            </div>

                            <div className="process-card" style={{ marginTop: 0 }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Buscar Alumno</h3>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ingrese Matrícula o Nombre..."
                                        value={reasignSearch}
                                        onChange={(e) => setReasignSearch(e.target.value)}
                                    />
                                    <button onClick={handleSearchForReasign} className="btn btn-primary">
                                        <Search size={18} /> Buscar
                                    </button>
                                </div>

                                {reasignStudent && (
                                    <div style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ width: 48, height: 48, background: 'var(--ut-orange)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                                {reasignStudent.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{reasignStudent.name}</h4>
                                                <p style={{ color: '#6b7280' }}>{reasignStudent.matricula} • {reasignStudent.careerName}</p>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Seleccionar Nueva Empresa</label>
                                            <select
                                                className="input"
                                                value={reasignNewCompanyId}
                                                onChange={(e) => setReasignNewCompanyId(e.target.value)}
                                            >
                                                <option value="">-- Seleccionar Empresa del Catálogo --</option>
                                                {companies.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} ({CAREERS.find(k => k.id === c.careerId)?.name || 'General'})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <button onClick={() => setReasignStudent(null)} className="btn" style={{ background: '#f3f4f6' }}>Cancelar</button>
                                            <button
                                                onClick={handleReasignSubmit}
                                                disabled={!reasignNewCompanyId}
                                                className="btn"
                                                style={{ background: '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <RefreshCw size={18} /> Confirmar Cambio
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'statistics' && (
                        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Estadísticas de Procesos</h2>

                            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                                {/* Gráfica de Estatus Global */}
                                <div className="process-card" style={{ marginTop: 0 }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Estatus de Estudiantes</h3>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Aprobado', value: localStudents.filter(s => s.status === 'Aprobado').length },
                                                        { name: 'En Revisión', value: localStudents.filter(s => s.status === 'En Revisión').length },
                                                        { name: 'Pendiente', value: localStudents.filter(s => s.status === 'Pendiente').length },
                                                        { name: 'Corrección', value: localStudents.filter(s => s.status === 'Corrección Solicitada').length },
                                                    ].filter(d => d.value > 0)}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {[
                                                        { name: 'Aprobado', color: '#00C49F' },
                                                        { name: 'En Revisión', color: '#FFBB28' },
                                                        { name: 'Pendiente', color: '#9CA3AF' },
                                                        { name: 'Corrección', color: '#EF4444' },
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfica de Distribución por Carrera (Top 5) */}
                                <div className="process-card" style={{ marginTop: 0 }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>Top Carreras con Estudiantes</h3>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries(localStudents.reduce((acc, curr) => {
                                                        acc[curr.careerName] = (acc[curr.careerName] || 0) + 1;
                                                        return acc;
                                                    }, {}))
                                                        .map(([name, value]) => ({ name, value }))
                                                        .sort((a, b) => b.value - a.value)
                                                        .slice(0, 5)} // Top 5
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {[
                                                        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CDA'
                                                    ].map((color, index) => (
                                                        <Cell key={`cell-${index}`} fill={color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'companies' && (
                        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <div className="flex-between mb-6">
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Catálogo de Empresas</h2>
                                    <p style={{ color: '#6b7280' }}>Gestión de convenios y datos de empresas vinculadas</p>
                                </div>
                                <button onClick={() => setIsCreatingCompany(!isCreatingCompany)} className="btn btn-primary">
                                    <Building size={18} />
                                    {isCreatingCompany ? 'Cancelar' : 'Nueva Empresa'}
                                </button>
                            </div>

                            {isCreatingCompany && (
                                <div className="process-card mb-6" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>
                                        {isEditingCompany ? 'Editar Empresa' : 'Registrar Nueva Empresa'}
                                    </h3>
                                    <form onSubmit={handleCreateCompany}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nombre de la Empresa</label>
                                                <input required type="text" className="input" placeholder="Ej. Volkswagen de México" value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Dirección</label>
                                                <input type="text" className="input" placeholder="Calle, Número, Colonia, Ciudad" value={newCompany.address} onChange={e => setNewCompany({ ...newCompany, address: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nombre del Contacto / RRHH</label>
                                                <input type="text" className="input" placeholder="Lic. Juan Pérez" value={newCompany.contact} onChange={e => setNewCompany({ ...newCompany, contact: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Correo / Teléfono</label>
                                                <input type="text" className="input" placeholder="contacto@empresa.com" value={newCompany.email} onChange={e => setNewCompany({ ...newCompany, email: e.target.value })} />
                                            </div>

                                            {/* Nuevos campos */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Cupos Disponibles</label>
                                                <input type="number" min="0" className="input" placeholder="Ej. 5" value={newCompany.spots} onChange={e => setNewCompany({ ...newCompany, spots: parseInt(e.target.value) || 0 })} />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={newCompany.hasFinancialSupport}
                                                        onChange={e => setNewCompany({ ...newCompany, hasFinancialSupport: e.target.checked })}
                                                        style={{ width: '1.25rem', height: '1.25rem' }}
                                                    />
                                                    Ofrece Apoyo Económico
                                                </label>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem', gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Carrera de Enfoque (Para filtrado)</label>
                                            <select
                                                className="input"
                                                value={newCompany.careerId}
                                                onChange={e => setNewCompany({ ...newCompany, careerId: e.target.value })}
                                            >
                                                <option value="">-- Todas / General --</option>
                                                {CAREERS.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem', gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Documento / Convenio (PDF o Word)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="input"
                                                    style={{ padding: '0.5rem' }}
                                                    onChange={handleCompanyFileChange}
                                                />
                                                {newCompany.fileName && <span style={{ color: 'var(--ut-green)', fontSize: '0.875rem' }}><CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} /> Archivo seleccionado</span>}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button type="button" onClick={handleCancelCompanyForm} className="btn" style={{ background: '#f3f4f6' }}>Cancelar</button>
                                            <button type="submit" className="btn btn-primary">{isEditingCompany ? 'Actualizar' : 'Guardar Empresa'}</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                {companies.map(company => (
                                    <div key={company.id} className="process-card" style={{ marginTop: 0, position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEditCompany(company)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B', padding: '0.25rem' }}
                                                title="Editar Empresa"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCompany(company.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '0.25rem' }}
                                                title="Eliminar Empresa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{ width: 40, height: 40, background: '#EFF6FF', color: '#2563EB', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Building size={20} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>{company.name}</h3>
                                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {company.id}</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 500, minWidth: '70px' }}>Carrera:</span>
                                                <span className="tag" style={{ fontSize: '0.75rem', background: '#f3f4f6' }}>
                                                    {CAREERS.find(c => c.id === company.careerId)?.name || 'General / Todas'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 500, minWidth: '70px' }}>Contacto:</span>
                                                <span>{company.contact || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 500, minWidth: '70px' }}>Datos:</span>
                                                <span>{company.email || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 500, minWidth: '70px' }}>Dirección:</span>
                                                <span style={{ fontSize: '0.8rem' }}>{company.address || 'N/A'}</span>
                                            </div>
                                            <div className="flex-between" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e5e7eb' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: 600 }}>Cupos:</span>
                                                    <span className="tag" style={{ background: '#f3f4f6' }}>{company.spots || '0'}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: 600 }}>Apoyo:</span>
                                                    {company.hasFinancialSupport ? (
                                                        <span className="tag" style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem' }}>Sí</span>
                                                    ) : (
                                                        <span className="tag" style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '0.75rem' }}>No</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FileText size={16} color={company.fileName ? 'var(--ut-green)' : '#9ca3af'} />
                                                <span style={{ fontSize: '0.875rem', color: company.fileName ? '#1f2937' : '#9ca3af' }}>
                                                    {company.fileName || 'Sin documento'}
                                                </span>
                                            </div>
                                            {company.fileName && (
                                                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#f3f4f6', color: '#374151' }}>
                                                    <Download size={14} style={{ marginRight: 4 }} /> Descargar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {companies.length === 0 && !isCreatingCompany && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                                    <Building size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p>No hay empresas registradas aún.</p>
                                </div>
                            )}
                        </div>
                    )
                }

                {
                    activeTab === 'admins' && isRoot && (
                        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <div className="flex-between mb-6">
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Gestión de Administradores</h2>
                                    <p style={{ color: '#6b7280' }}>Control de acceso al panel administrativo</p>
                                </div>
                                <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary">
                                    <UserPlus size={18} />
                                    {isCreating ? 'Cancelar' : 'Nuevo Admin'}
                                </button>
                            </div>

                            {isCreating && (
                                <div className="process-card mb-6" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                                    <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Crear Nuevo Administrador</h3>
                                    <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr auto' }}>
                                        <input type="text" placeholder="Usuario" className="input" value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} />
                                        <input type="password" placeholder="Contraseña" className="input" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                                        <button type="submit" className="btn btn-primary">Guardar</button>
                                    </form>
                                </div>
                            )}

                            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                <div className="process-card" style={{ marginTop: 0, borderLeft: '4px solid var(--ut-orange)' }}>
                                    <div className="flex-between">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={20} color="var(--ut-orange)" />
                                            <h4 style={{ fontWeight: 600 }}>root</h4>
                                        </div>
                                        <span className="tag" style={{ background: '#FEF3C7', color: '#D97706' }}>ROOT</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>Acceso total al sistema.</p>
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', fontSize: '0.75rem', color: '#9ca3af' }}>
                                        Sistema
                                    </div>
                                </div>
                                {admins.map(admin => (
                                    <div key={admin.id} className="process-card" style={{ marginTop: 0, borderLeft: '4px solid #3B82F6' }}>
                                        <div className="flex-between">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={20} color="#3B82F6" />
                                                <h4 style={{ fontWeight: 600 }}>{admin.username}</h4>
                                            </div>
                                            <span className="tag" style={{ background: '#EFF6FF', color: '#2563EB' }}>ADMIN</span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                            {admin.assignedCareers?.length > 0 ? `Asignado a ${admin.assignedCareers.length} carrera(s).` : 'Sin tareas asignadas.'}
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button onClick={() => handleDeleteAdmin(admin.username)} className="btn" style={{ padding: '0.5rem', color: '#EF4444', background: '#FEF2F2' }}>
                                                <Trash2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => openAssignModal(admin)}
                                                className="btn"
                                                title="Asignar Carreras"
                                                style={{ padding: '0.5rem', color: '#3B82F6', background: '#EFF6FF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <FolderOpen size={18} /> Asignar Tarea
                                            </button>
                                        </div>
                                        {/* Barra de Progreso del Admin */}
                                        {(() => {
                                            const progress = getAdminProgress(admin);
                                            return (
                                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                                    <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                                        <span style={{ color: '#6b7280' }}>Progreso de Revisión</span>
                                                        <span style={{ fontWeight: 600 }}>{progress.reviewed} / {progress.total} expedientes</span>
                                                    </div>
                                                    <div style={{ height: '0.5rem', width: '100%', background: '#e5e7eb', borderRadius: '1rem', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', background: '#3B82F6', width: `${progress.percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'profile' && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Configuración del Perfil</h2>
                            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Actualiza tus credenciales de acceso</p>

                            <div className="process-card">
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Shield size={20} color="var(--ut-orange)" />
                                    Seguridad de la cuenta
                                </h3>

                                <form onSubmit={handleUpdateProfile}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Usuario Actual</label>
                                        <input type="text" value={currentUser.username} disabled className="input" style={{ background: '#f3f4f6', cursor: 'not-allowed' }} />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="input"
                                            placeholder="Ingresa nueva contraseña"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>La contraseña debe tener al menos 8 caracteres.</p>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!newPassword}>
                                            Actualizar Contraseña
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </main >

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                footer={modalConfig.footer}
                type={modalConfig.type}
            >
                {modalConfig.content}
            </Modal>
            {/* Modal de Asignación de Tareas */}
            <Modal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                title={`Asignar Carreras a: ${selectedAdminForAssign?.username}`}
                footer={
                    <>
                        <button onClick={() => setAssignModalOpen(false)} className="btn" style={{ background: '#f3f4f6', color: '#374151' }}>Cancelar</button>
                        <button onClick={saveAssignments} className="btn btn-primary">Guardar Asignaciones</button>
                    </>
                }
            >
                <div>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Selecciona las carreras que este administrador debe revisar.</p>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>

                        {/* Sección TSU */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                <GraduationCap size={16} color="var(--ut-green)" />
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ut-green)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Técnico Superior Universitario</h4>
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {CAREERS.filter(c => c.type === 'TSU').map(career => {
                                    const isAssigned = tempAssignedCareers.includes(career.id);
                                    return (
                                        <div
                                            key={career.id}
                                            onClick={() => toggleCareerAssignment(career.id)}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                border: `1px solid ${isAssigned ? 'var(--ut-green)' : '#e5e7eb'}`,
                                                background: isAssigned ? '#f0fdf4' : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: 20, height: 20, borderRadius: 4,
                                                border: `2px solid ${isAssigned ? 'var(--ut-green)' : '#d1d5db'}`,
                                                background: isAssigned ? 'var(--ut-green)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isAssigned && <CheckCircle size={14} color="white" />}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 500, color: isAssigned ? '#14532d' : '#374151', fontSize: '0.9rem' }}>{career.name}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sección Ingenierías */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                <Briefcase size={16} color="var(--ut-orange)" />
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ut-orange)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Ingenierías y Licenciaturas</h4>
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {CAREERS.filter(c => c.type !== 'TSU').map(career => {
                                    const isAssigned = tempAssignedCareers.includes(career.id);
                                    return (
                                        <div
                                            key={career.id}
                                            onClick={() => toggleCareerAssignment(career.id)}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                border: `1px solid ${isAssigned ? 'var(--ut-orange)' : '#e5e7eb'}`,
                                                background: isAssigned ? '#fff7ed' : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: 20, height: 20, borderRadius: 4,
                                                border: `2px solid ${isAssigned ? 'var(--ut-orange)' : '#d1d5db'}`,
                                                background: isAssigned ? 'var(--ut-orange)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isAssigned && <CheckCircle size={14} color="white" />}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 500, color: isAssigned ? '#7c2d12' : '#374151', fontSize: '0.9rem' }}>{career.name}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </Modal>
        </div >
    );
}

