import React, { useState, useEffect } from 'react';
import { Building, Search, MapPin, Phone, Mail, FileText, CheckCircle, Filter } from 'lucide-react';
import Modal from '../components/Modal';

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

export default function StudentCompanyView({ mode = 'catalog', onSelect, userMatricula }) {
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCareerId, setSelectedCareerId] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);

    // Modal States
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, footer: null, type: 'info' });

    useEffect(() => {
        const storedCompanies = JSON.parse(localStorage.getItem('ut_companies_db') || '[]');
        // Load mocks if empty, similar to AdminDashboard logic, ensuring data presence
        if (storedCompanies.length === 0) {
            const mockCompanies = [
                { id: 1, name: 'Volkswagen de México', address: 'Autopista México-Puebla Km 116', contact: 'Lic. Juan Pérez', email: 'rh@vw.com.mx', fileName: 'convenio_vw_2024.pdf', careerId: 'ing-man' },
                { id: 2, name: 'Audi México', address: 'San José Chiapa', contact: 'Ing. María González', email: 'practicas@audi.mx', fileName: 'carta_aceptacion.docx', careerId: 'ing-mec' },
                { id: 3, name: 'Softtek', address: 'Parque Tecnológico', contact: 'Lic. Ana Ruiz', email: 'talento@softtek.com', fileName: 'convenio_softtek.pdf', careerId: 'ing-soft' }
            ];
            setCompanies(mockCompanies);
        } else {
            setCompanies(storedCompanies);
        }

        // Cargar selección guardada del usuario
        if (userMatricula && mode === 'selection') {
            const savedSelection = localStorage.getItem(`ut_selection_${userMatricula}`);
            if (savedSelection) {
                try {
                    const parsed = JSON.parse(savedSelection);
                    setSelectedCompanyId(parsed.id);
                } catch (e) {
                    console.error("Error cargando selección", e);
                }
            }
        }
    }, [userMatricula, mode]);

    const filteredCompanies = companies.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCareer = selectedCareerId ? (c.careerId === selectedCareerId || !c.careerId) : true;

        return matchesSearch && matchesCareer;
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
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Ya tienes una empresa asignada.</p>
                        <p style={{ color: '#6b7280' }}>
                            Por reglamento, solo puedes realizar tu estadía en una sola empresa.
                            Si cometiste un error, contacta a Dirección de Carrera.
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

    const confirmSelection = (company) => {
        setSelectedCompanyId(company.id);

        // Guardar persistencia por usuario
        if (userMatricula) {
            localStorage.setItem(`ut_selection_${userMatricula}`, JSON.stringify(company));
        }

        if (onSelect) onSelect(company);

        // Show Success Modal
        setModalConfig({
            isOpen: true,
            title: '¡Empresa Seleccionada!',
            type: 'success',
            content: (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: '#DCFCE7', borderRadius: '50%', color: '#166534', marginBottom: '1rem' }}>
                        <CheckCircle size={48} />
                    </div>
                    <p style={{ fontSize: '1.125rem' }}>Has registrado correctamente a <strong>{company.name}</strong>.</p>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                        <span>⚠️ Selecciona tu carrera para ver las empresas recomendadas.</span>
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
        </div>
    );
}
