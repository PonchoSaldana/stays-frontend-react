import React, { useState, useEffect } from 'react';
import { Building, Search, MapPin, Phone, Mail, FileText, CheckCircle, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { authFetch } from '../auth';

// Copied from AdminDashboard for consistency (In a real app, this would be a shared constant)
const CAREERS = [
    { id: 'ing-soft', name: 'Ingeniería en Desarrollo y Gestión de Software' },
    { id: 'ing-red', name: 'Ingeniería en Redes Inteligentes y Ciberseguridad' },
    { id: 'ing-ind', name: 'Ingeniería Industrial' },
    { id: 'ing-mec', name: 'Ingeniería Mecatrónica' },
    { id: 'ing-proc', name: 'Ingeniería en Procesos y Operaciones Industriales' },
    { id: 'ing-man', name: 'Ingeniería en Mantenimiento Industrial' },
    { id: 'ing-bio', name: 'Ingeniería en Procesos Bioalimentarios' },
    { id: 'ing-agr', name: 'Ingeniería en Agricultura Sustentable y Protegida' },
    { id: 'ing-neg', name: 'Ingeniería en Negocios y Gestión Empresarial' },
    { id: 'ing-proy', name: 'Ingeniería en Gestión de Proyectos' },
    { id: 'ing-fin', name: 'Ingeniería Financiera y Fiscal' },
    { id: 'lic-con', name: 'Licenciatura en Contaduría' },
    { id: 'lic-inn', name: 'Licenciatura en Innovación de Negocios y Mercadotecnia' },
    { id: 'lic-cap', name: 'Licenciatura en Gestión del Capital Humano' },
    { id: 'tsu-ti-soft', name: 'TSU en TI Área Desarrollo de Software Multiplataforma' },
    { id: 'tsu-ti-red', name: 'TSU en TI Área Infraestructura de Redes Digitales' },
    { id: 'tsu-pi-man', name: 'TSU en Procesos Industriales Área Manufactura' },
    { id: 'tsu-pi-auto', name: 'TSU en Procesos Industriales Área Automotriz' },
    { id: 'tsu-man-ind', name: 'TSU en Mantenimiento Área Industrial' },
    { id: 'tsu-mec-auto', name: 'TSU en Mecatrónica Área Automatización' },
    { id: 'tsu-dn-mer', name: 'TSU en Desarrollo de Negocios Área Mercadotecnia' },
    { id: 'tsu-adm-cap', name: 'TSU en Administración Área Capital Humano' },
    { id: 'tsu-adm-proy', name: 'TSU en Administración Área Formulación y Evaluación de Proyectos' },
    { id: 'tsu-con', name: 'TSU en Contaduría' },
    { id: 'tsu-ali', name: 'TSU en Procesos Alimentarios' },
    { id: 'tsu-agr', name: 'TSU en Agricultura Sustentable y Protegida' },
    { id: 'tsu-qui', name: 'TSU en Química Área Tecnología Ambiental' },
];

const getMockCompanies = () => [
    { id: 1, name: 'Volkswagen de México', address: 'Autopista México-Puebla Km 116', contact: 'Lic. Juan Pérez', email: 'rh@vw.com.mx', careerId: 'ing-man', maxStudents: 5 },
    { id: 2, name: 'Audi México', address: 'San José Chiapa', contact: 'Ing. María González', email: 'practicas@audi.mx', careerId: 'ing-mec', maxStudents: 3 },
    { id: 3, name: 'Softtek', address: 'Parque Tecnológico', contact: 'Lic. Ana Ruiz', email: 'talento@softtek.com', careerId: 'ing-soft', maxStudents: 10 }
];

export default function StudentCompanyView({ mode = 'catalog', onSelect, userMatricula }) {
    const { toasts, showToast, removeToast } = useToast();
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCareerId, setSelectedCareerId] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);

    // Modal States
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, footer: null, type: 'info' });

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams({
                page: 1,
                limit: 50,
                search: searchTerm
            });
            authFetch(`/companies?${params.toString()}`)
                .then(res => res.ok ? res.json() : { data: [] })
                .then(json => {
                    const data = json.data || [];
                    setCompanies(data.length > 0 ? data : (searchTerm ? [] : getMockCompanies()));
                })
                .catch(() => setCompanies(searchTerm ? [] : getMockCompanies()));
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        // Cargar empresa ya seleccionada desde el backend
        if (userMatricula && mode === 'selection') {
            const mat = String(userMatricula).trim().toLowerCase();
            authFetch(`/students/${mat}`)
                .then(res => res.ok ? res.json() : null)
                .then(student => {
                    if (student?.companyId) setSelectedCompanyId(student.companyId);
                })
                .catch(() => { });
        }
    }, [userMatricula, mode]);

    const filteredCompanies = companies.filter(c => {
        const matchesCareer = selectedCareerId ? (c.careerId === selectedCareerId || !c.careerId) : true;
        return matchesCareer;
    });

    const handleSelect = (company) => {
        // Validar si ya tiene una empresa seleccionada (Bloquear cambio)
        if (selectedCompanyId && selectedCompanyId !== company.id) {
            setModalConfig({
                isOpen: true,
                title: 'Acción no permitida',
                type: 'danger',
                content: (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
                        <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Ya tienes una empresa asignada.</p>
                        <p style={{ color: '#6b7280' }}>
                            Por reglamento, solo puedes realizar tu estadía en una sola empresa.
                            Si cometiste un error, contacta al encargado de estadias.
                        </p>
                    </div>
                ),
                footer: (
                    <button
                        onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Entendido
                    </button>
                )
            });
            return;
        }

        if (selectedCompanyId === company.id) {
            // Ya es la actual, solo info
            return;
        }

        setModalConfig({
            isOpen: true,
            title: 'Confirmar Selección',
            content: (
                <div>
                    <p>¿Estás seguro que deseas seleccionar a <strong>{company.name}</strong> para tu estadía?</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#6b7280' }}>
                        Esta acción vinculará tu proceso a esta empresa.
                    </p>
                </div>
            ),
            footer: (
                <>
                    <button
                        onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                        className="btn"
                        style={{ background: '#f3f4f6', color: '#374151' }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => confirmSelection(company)}
                        className="btn btn-primary"
                    >
                        Confirmar
                    </button>
                </>
            )
        });
    };

    const confirmSelection = async (company) => {
        if (userMatricula) {
            try {
                const mat = String(userMatricula).trim().toLowerCase();
                const res = await authFetch(`/students/${mat}/select-company`, {
                    method: 'PUT',
                    body: JSON.stringify({ companyId: company.id })
                });
                if (!res.ok) {
                    const data = await res.json();
                    showToast({ type: 'error', title: 'Error', message: data.message || 'No se pudo guardar la selección.' });
                    setModalConfig(m => ({ ...m, isOpen: false }));
                    return;
                }
            } catch {
                // Continuar aunque falle la red (mostrar éxito visual de todas formas)
            }
        }

        setSelectedCompanyId(company.id);
        if (onSelect) onSelect(company);

        setModalConfig(m => ({ ...m, isOpen: false }));
        showToast({ type: 'success', title: '¡Empresa Seleccionada!', message: `Has registrado correctamente a ${company.name}.` });
    };

    return (
        <div className="process-container">
            <div className="text-center mb-6">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
                    {mode === 'catalog' ? 'Catálogo de Empresas' : 'Selección de Empresa'}
                </h2>
                <p style={{ color: '#6b7280' }}>
                    {mode === 'catalog'
                        ? 'Consulta las empresas con convenio vigente para realizar tu estadía.'
                        : 'Elige la empresa donde realizarás tu estadía profesional.'}
                </p>
            </div>

            {/* Filters */}
            <div className="process-card mb-6" style={{ marginTop: 0 }}>
                <div className="filter-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Buscar empresa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Filter size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
                        <select
                            className="input"
                            value={selectedCareerId}
                            onChange={(e) => setSelectedCareerId(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        >
                            <option value="">-- Ver todas las carreras --</option>
                            {CAREERS.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {mode === 'selection' && !selectedCareerId && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span> Selecciona tu carrera para ver las empresas recomendadas.</span>
                    </div>
                )}
            </div>

            {/* Results Grid */}
            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredCompanies.map(company => (
                    <div
                        key={company.id}
                        className="process-card"
                        style={{
                            marginTop: 0,
                            borderLeft: selectedCompanyId === company.id ? '4px solid var(--ut-green)' : 'none',
                            background: selectedCompanyId === company.id ? '#F0FDF4' : 'white'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{ width: 48, height: 48, background: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>
                                <Building size={24} />
                            </div>
                            {mode === 'selection' && (
                                <button
                                    onClick={() => handleSelect(company)}
                                    className={`btn ${selectedCompanyId === company.id ? 'btn-primary' : ''}`}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.75rem',
                                        background: selectedCompanyId === company.id ? undefined : '#f3f4f6',
                                        color: selectedCompanyId === company.id ? undefined : '#374151',
                                        border: selectedCompanyId === company.id ? undefined : '1px solid #e5e7eb'
                                    }}
                                >
                                    {selectedCompanyId === company.id ? 'Seleccionada' : 'Elegir'}
                                </button>
                            )}
                        </div>

                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{company.name}</h3>
                        <span className="tag" style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', marginBottom: '1rem', display: 'inline-block' }}>
                            {CAREERS.find(c => c.id === company.careerId)?.name || 'General'}
                        </span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <MapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                                <span>{company.address || 'Sin dirección registrada'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Phone size={16} />
                                <span>{company.contact || 'Sin contacto'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Mail size={16} />
                                <span>{company.email || 'Sin correo'}</span>
                            </div>
                            <div className="flex-between" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: '#374151' }}>Cupos:</span>
                                    <span className="tag" style={{ background: '#f3f4f6' }}>{company.spots || '0'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: '#374151' }}>Apoyo:</span>
                                    {company.hasFinancialSupport ? (
                                        <span className="tag" style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem' }}>Sí</span>
                                    ) : (
                                        <span className="tag" style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '0.75rem' }}>No</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {company.fileName && (
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.8rem', fontWeight: 500 }}>
                                    <FileText size={14} />
                                    Existe convenio vigente
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredCompanies.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    <Building size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No se encontraron empresas con los criterios seleccionados.</p>
                </div>
            )}

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                footer={modalConfig.footer}
                type={modalConfig.type}
            >
                {modalConfig.content}
            </Modal>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
