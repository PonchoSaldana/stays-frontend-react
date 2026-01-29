import React, { useState, useEffect } from 'react';
import { Users, Search, FolderOpen, ArrowLeft, FileText, CheckCircle, Clock, Settings, Shield, UserPlus, UserX, UserCheck, LogOut, Database, Upload, XCircle, Send, MessageSquare, Building, File, Trash2, Download } from 'lucide-react';
import { read, utils } from 'xlsx';
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
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('supervision');

    // Configuración del Usuario Actual
    const currentUser = JSON.parse(localStorage.getItem('ut_admin_session') || '{}');
    const isRoot = currentUser.username === 'root';

    // --- Estado para la Base de Datos de Estudiantes ---
    const [localStudents, setLocalStudents] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [uploadError, setUploadError] = useState('');

    // --- Estado para Supervisión ---
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // State para acciones de Aprobar/Regresar
    const [rejectAction, setRejectAction] = useState({ id: null, comment: '' });

    // Inicialización de datos (Mock + DB Local)
    useEffect(() => {
        const dbStored = JSON.parse(localStorage.getItem('ut_students_db') || '[]');

        if (dbStored.length > 0) {
            setLocalStudents(dbStored.map(s => ({
                ...s,
                id: s.matricula, // Asegurar ID
                careerId: CAREERS.find(c => c.name === s.careerName || c.name === s.carrera)?.id || 'unknown',
                status: s.status || 'En Revisión',
                docsCount: s.docsCount || Math.floor(Math.random() * 5) + 1
            })));
        } else {
            // Generar Mock inicial si no hay DB
            const mock = Array.from({ length: 50 }, (_, i) => {
                const career = CAREERS[Math.floor(Math.random() * CAREERS.length)];
                const statusOpts = ['Pendiente', 'En Revisión', 'Aprobado'];
                return {
                    id: i + 1,
                    matricula: `2023${1000 + i}`,
                    name: `Estudiante ${i + 1} Apellido`,
                    careerId: career.id,
                    careerName: career.name,
                    status: statusOpts[Math.floor(Math.random() * statusOpts.length)],
                    docsCount: Math.floor(Math.random() * 5) + 1
                };
            });
            setLocalStudents(mock);
        }
    }, []);

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
    const [newCompany, setNewCompany] = useState({ name: '', address: '', contact: '', email: '', fileName: '', careerId: '' });

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, footer: null, type: 'info' });

    useEffect(() => {
        const storedCompanies = JSON.parse(localStorage.getItem('ut_companies_db') || '[]');
        if (storedCompanies.length === 0) {
            // Mock inicial
            const mockCompanies = [
                { id: 1, name: 'Volkswagen de México', address: 'Autopista México-Puebla Km 116', contact: 'Lic. Juan Pérez', email: 'rh@vw.com.mx', fileName: 'convenio_vw_2024.pdf', careerId: 'ing-man' },
                { id: 2, name: 'Audi México', address: 'San José Chiapa', contact: 'Ing. María González', email: 'practicas@audi.mx', fileName: 'carta_aceptacion.docx', careerId: 'ing-mec' },
                { id: 3, name: 'Softtek', address: 'Parque Tecnológico', contact: 'Lic. Ana Ruiz', email: 'talento@softtek.com', fileName: 'convenio_softtek.pdf', careerId: 'ing-soft' }
            ];
            setCompanies(mockCompanies);
        } else {
            setCompanies(storedCompanies);
        }
    }, []);

    const handleCreateCompany = (e) => {
        e.preventDefault();
        if (!newCompany.name) return;
        const updated = [...companies, { ...newCompany, id: Date.now() }];
        setCompanies(updated);
        localStorage.setItem('ut_companies_db', JSON.stringify(updated));
        setNewCompany({ name: '', address: '', contact: '', email: '', fileName: '', careerId: '' });
        setIsCreatingCompany(false);

        setModalConfig({
            isOpen: true,
            title: 'Empresa Registrada',
            type: 'success',
            content: <p>La empresa <strong>{newCompany.name}</strong> se ha registrado correctamente en el catálogo.</p>,
            footer: <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="btn btn-primary">Aceptar</button>
        });
    };

    const handleDeleteCompany = (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta empresa?')) {
            const updated = companies.filter(c => c.id !== id);
            setCompanies(updated);
            localStorage.setItem('ut_companies_db', JSON.stringify(updated));
        }
    };

    const handleCompanyFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simulamos la carga guardando solo el nombre
            setNewCompany({ ...newCompany, fileName: file.name });
        }
    };

    // Procesa el archivo Excel cargado
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = utils.sheet_to_json(ws);

                // Validate columns
                if (data.length > 0) {
                    // Check for required keys (flexible check)
                    const normalizedData = data.map(row => {
                        // Normalize keys to lowercase for search
                        const newRow = {};
                        Object.keys(row).forEach(key => {
                            newRow[key.toLowerCase()] = row[key];
                        });
                        return {
                            matricula: newRow.matricula ? String(newRow.matricula) : '',
                            name: newRow.nombre || newRow.name || '',
                            careerName: newRow.carrera || newRow.career || '',
                            grade: newRow.grado || newRow.cuatrimestre || ''
                        };
                    }).filter(row => row.matricula && row.name);

                    if (normalizedData.length === 0) {
                        setUploadError('No se encontraron filas válidas. Asegúrate de tener columnas "Matricula", "Nombre" y "Carrera".');
                        setPreviewData([]);
                    } else {
                        setPreviewData(normalizedData);
                        setUploadError('');
                    }
                }
            } catch (err) {
                console.error(err);
                setUploadError('Error al procesar el archivo. Asegúrate de que es un Excel válido.');
            }
        };
        reader.readAsBinaryString(file);
    };

    // Guarda los datos importados en la base de datos local
    const handleSaveDatabase = () => {
        if (previewData.length === 0) return;
        if (previewData.length === 0) return;
        setLocalStudents(previewData.map(s => ({ ...s, id: s.matricula, status: 'En Revisión', docsCount: 0 })));
        localStorage.setItem('ut_students_db', JSON.stringify(previewData));
        setPreviewData([]);
        alert(`Se han importado exitosamente ${previewData.length} alumnos.`);
        setActiveTab('supervision');
    };

    // Crea un nuevo administrador
    const handleCreateAdmin = (e) => {
        e.preventDefault();
        if (!newAdmin.username || !newAdmin.password) return;
        const updatedAdmins = [...admins, { ...newAdmin, id: Date.now() }];
        localStorage.setItem('ut_admins_db', JSON.stringify(updatedAdmins));
        setAdmins(updatedAdmins);
        setNewAdmin({ username: '', password: '', role: 'ADMIN' });
        setIsCreating(false);
    };

    const handleDeleteAdmin = (id) => {
        const updatedAdmins = admins.filter(a => a.id !== id);
        localStorage.setItem('ut_admins_db', JSON.stringify(updatedAdmins));
        setAdmins(updatedAdmins);
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
                        onClick={() => setActiveTab('database')}
                        className={`nav-item ${activeTab === 'database' ? 'active' : ''}`}
                        style={{ border: 'none', background: activeTab === 'database' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                        <Database size={18} /> Base de Datos
                    </button>

                    <button
                        onClick={() => setActiveTab('companies')}
                        className={`nav-item ${activeTab === 'companies' ? 'active' : ''}`}
                        style={{ border: 'none', background: activeTab === 'companies' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                        <Building size={18} /> Empresas
                    </button>

                    {isRoot && (
                        <button
                            onClick={() => setActiveTab('admins')}
                            className={`nav-item ${activeTab === 'admins' ? 'active' : ''}`}
                            style={{ border: 'none', background: activeTab === 'admins' ? undefined : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                        >
                            <Users size={18} /> Administradores
                        </button>
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
                {activeTab === 'supervision' && (
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

                        {!selectedCareer ? (
                            <div style={{ paddingBottom: '3rem' }}>
                                {/* Sección Ingenierías / Licenciaturas */}
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#1f2937' }}>
                                    Ingenierías y Licenciaturas
                                </h3>
                                <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {CAREERS.filter(c => c.type !== 'TSU').map(career => (
                                        <div
                                            key={career.id}
                                            onClick={() => setSelectedCareer(career)}
                                            className="process-card"
                                            style={{
                                                marginTop: 0,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                borderLeft: `4px solid var(--ut-orange)`
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }}
                                        >
                                            <div className="flex-between">
                                                <span className="tag" style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#D97706' }}>{career.type}</span>
                                                <FolderOpen size={20} color="var(--ut-orange)" />
                                            </div>
                                            <h3 style={{ fontSize: '1.125rem', margin: '0.75rem 0', fontWeight: 600 }}>{career.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                                <Users size={16} />
                                                <span>{getStudentCount(career.id)} Estudiantes</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Sección TSU */}
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '3rem 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb', color: '#1f2937' }}>
                                    Técnico Superior Universitario (TSU)
                                </h3>
                                <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {CAREERS.filter(c => c.type === 'TSU').map(career => (
                                        <div
                                            key={career.id}
                                            onClick={() => setSelectedCareer(career)}
                                            className="process-card"
                                            style={{
                                                marginTop: 0,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                borderLeft: `4px solid var(--ut-green)`
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }}
                                        >
                                            <div className="flex-between">
                                                <span className="tag" style={{ fontSize: '0.75rem' }}>{career.type}</span>
                                                <FolderOpen size={20} color="var(--ut-green)" />
                                            </div>
                                            <h3 style={{ fontSize: '1.125rem', margin: '0.75rem 0', fontWeight: 600 }}>{career.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                                <Users size={16} />
                                                <span>{getStudentCount(career.id)} Estudiantes</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>
                )}

                {activeTab === 'database' && (
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div className="flex-between mb-6">
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Base de Datos de Alumnos</h2>
                                <p style={{ color: '#6b7280' }}>Carga masiva de estudiantes mediante Excel</p>
                            </div>
                            <div className="tag" style={{ background: '#E6F5EC', color: '#009B4D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Database size={16} />
                                <Database size={16} />
                                {localStudents.length} Registros actuales
                            </div>
                        </div>

                        <div className="process-card mb-6">
                            <div
                                style={{
                                    border: '2px dashed #e5e7eb',
                                    borderRadius: '0.75rem',
                                    padding: '3rem',
                                    textAlign: 'center',
                                    background: '#f9fafb',
                                    marginBottom: '1.5rem'
                                }}
                            >
                                <Upload size={48} color="#9ca3af" style={{ margin: '0 auto 1rem auto' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cargar archivo Excel (.xlsx)</h3>
                                <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                                    El archivo debe contener las siguientes columnas (cabeceras en la primera fila):
                                    <br />
                                    <strong>Matricula, Nombre, Carrera, Cuatrimestre</strong>
                                </p>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="btn"
                                    style={{ background: 'white', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            {uploadError && (
                                <div style={{ padding: '1rem', background: '#FEF2F2', color: '#DC2626', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                    {uploadError}
                                </div>
                            )}

                            {previewData.length > 0 && (
                                <div>
                                    <div className="flex-between mb-4">
                                        <h4 style={{ fontWeight: 600 }}>Vista Previa ({previewData.length} registros)</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setPreviewData([])} className="btn" style={{ background: '#f3f4f6', color: '#374151' }}>Cancelar</button>
                                            <button onClick={handleSaveDatabase} className="btn btn-primary">Importar y Guardar</button>
                                        </div>
                                    </div>
                                    <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#f9fafb' }}>
                                                <tr>
                                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Matrícula</th>
                                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Nombre</th>
                                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Carrera</th>
                                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Grado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.slice(0, 100).map((row, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '0.75rem' }}>{row.matricula}</td>
                                                        <td style={{ padding: '0.75rem' }}>{row.name}</td>
                                                        <td style={{ padding: '0.75rem' }}>{row.careerName}</td>
                                                        <td style={{ padding: '0.75rem' }}>{row.grade}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {previewData.length > 100 && (
                                            <div style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.75rem', background: '#f9fafb' }}>
                                                ... y {previewData.length - 100} más
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'companies' && (
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
                                <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Registrar Nueva Empresa</h3>
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
                                        <button type="button" onClick={() => setIsCreatingCompany(false)} className="btn" style={{ background: '#f3f4f6' }}>Cancelar</button>
                                        <button type="submit" className="btn btn-primary">Guardar Empresa</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {companies.map(company => (
                                <div key={company.id} className="process-card" style={{ marginTop: 0, position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
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
                )}

                {activeTab === 'admins' && isRoot && (
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

                        <div className="process-card">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                                        <th style={{ padding: '1rem', color: '#374151' }}>Usuario</th>
                                        <th style={{ padding: '1rem', color: '#374151' }}>Rol</th>
                                        <th style={{ padding: '1rem', color: '#374151' }}>Estado</th>
                                        <th style={{ padding: '1rem', color: '#374151' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={16} color="var(--ut-orange)" /><span style={{ fontWeight: 600 }}>root</span></div></td>
                                        <td style={{ padding: '1rem' }}><span className="tag" style={{ background: '#FEF3C7', color: '#D97706' }}>ROOT</span></td>
                                        <td style={{ padding: '1rem' }}><span style={{ color: 'var(--ut-green)', display: 'flex', alignItems: 'center', gap: 4 }}><UserCheck size={14} /> Activo</span></td>
                                        <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>Sistema</td>
                                    </tr>
                                    {admins.map(admin => (
                                        <tr key={admin.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '1rem' }}>{admin.username}</td>
                                            <td style={{ padding: '1rem' }}><span className="tag">ADMIN</span></td>
                                            <td style={{ padding: '1rem' }}><span style={{ color: 'var(--ut-green)', display: 'flex', alignItems: 'center', gap: 4 }}><UserCheck size={14} /> Activo</span></td>
                                            <td style={{ padding: '1rem' }}>
                                                <button onClick={() => handleDeleteAdmin(admin.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <UserX size={16} /> Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
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
                )}
            </main>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                footer={modalConfig.footer}
                type={modalConfig.type}
            >
                {modalConfig.content}
            </Modal>
        </div>
    );
}
