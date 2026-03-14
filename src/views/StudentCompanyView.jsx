import React, { useState, useEffect } from 'react';
import { Building, Search, MapPin, Phone, Mail, FileText, CheckCircle, Filter, Users, Code, Factory, Briefcase, Calculator, Leaf, FlaskConical } from 'lucide-react';
import Modal from '../components/Modal';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { authFetch } from '../auth';

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

const getCareerIcon = (careerText) => {
    if (!careerText) return Building;
    const text = String(careerText).toLowerCase();
    
    // TI / Software / Redes
    if (text.includes('soft') || text.includes('redes') || text.includes('ti ') || text.includes('ciber')) return Code;
    // Química / Tecnología Ambiental
    if (text.includes('quí') || text.includes('qui') || text.includes('amb')) return FlaskConical;
    // Bio / Agricultura / Alimentarios
    if (text.includes('bio') || text.includes('agr') || text.includes('ali')) return Leaf;
    // Contaduría / Finanzas
    if (text.includes('con') || text.includes('fin') || text.includes('fisc')) return Calculator;
    // Negocios / Administración / Proyectos / Mercadotecnia / Capital
    if (text.includes('neg') || text.includes('adm') || text.includes('cap') || text.includes('proy') || text.includes('merca')) return Briefcase;
    // Industrial / Manufactura / Mecatrónica / Procesos / Mantenimiento
    if (text.includes('ind') || text.includes('man') || text.includes('mec') || text.includes('auto') || text.includes('proc')) return Factory;

    return Building;
};

const getMockCompanies = () => [
    { id: 1, name: 'Volkswagen de México', address: 'Autopista México-Puebla Km 116', contact: 'Lic. Juan Pérez', email: 'rh@vw.com.mx', careerId: 'ing-man', spots: 5, hasFinancialSupport: true },
    { id: 2, name: 'Audi México', address: 'San José Chiapa, Puebla', contact: 'Ing. María González', email: 'practicas@audi.mx', careerId: 'ing-mec', spots: 3, hasFinancialSupport: true },
    { id: 3, name: 'Softtek', address: 'Parque Tecnológico, Puebla', contact: 'Lic. Ana Ruiz', email: 'talento@softtek.com', careerId: 'ing-soft', spots: 10, hasFinancialSupport: false },
];

export default function StudentCompanyView({ mode = 'catalog', onSelect, userMatricula }) {
    const { toasts, showToast, removeToast } = useToast();
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCareerId, setSelectedCareerId] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null, footer: null, type: 'info' });

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams({ 
                page: 1, 
                limit: 100, 
                search: searchTerm,
                careerId: selectedCareerId 
            });
            authFetch(`/companies?${params}`)
                .then(res => res.ok ? res.json() : { data: [] })
                .then(json => {
                    const data = json.data || [];
                    setCompanies(data.length > 0 ? data : (searchTerm || selectedCareerId ? [] : getMockCompanies()));
                })
                .catch(() => setCompanies(searchTerm ? [] : getMockCompanies()));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedCareerId]);

    useEffect(() => {
        if (userMatricula && mode === 'selection') {
            const mat = String(userMatricula).trim().toLowerCase();
            authFetch(`/students/${mat}`)
                .then(res => res.ok ? res.json() : null)
                .then(student => { if (student?.companyId) setSelectedCompanyId(student.companyId); })
                .catch(() => { });
        }
    }, [userMatricula, mode]);

    const filteredCompanies = companies.filter(c => {
        if (!selectedCareerId) return true;
        
        const careerName = CAREERS.find(car => car.id === selectedCareerId)?.name || '';
        const companyCareer = (c.careerId || '').toLowerCase();
        const targetCareer = selectedCareerId.toLowerCase();
        const targetCareerName = careerName.toLowerCase();

        // Filtro flexible: coincide con el ID interno O con el nombre de la carrera en el Excel
        return companyCareer.includes(targetCareer) || 
               companyCareer.includes(targetCareerName) ||
               targetCareerName.includes(companyCareer);
    });

    const handleSelect = (company) => {
        if (selectedCompanyId && selectedCompanyId !== company.id) {
            setModalConfig({
                isOpen: true, title: 'Acción no permitida', type: 'danger',
                content: (
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}></div>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Ya tienes una empresa asignada.</p>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Solo puedes realizar tu estadía en una empresa. Contacta al encargado si cometiste un error.
                        </p>
                    </div>
                ),
                footer: (
                    <button onClick={() => setModalConfig(m => ({ ...m, isOpen: false }))} className="btn btn-primary" style={{ width: '100%' }}>
                        Entendido
                    </button>
                )
            });
            return;
        }
        if (selectedCompanyId === company.id) return;

        setModalConfig({
            isOpen: true, title: 'Confirmar Selección',
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
                    <button onClick={() => setModalConfig(m => ({ ...m, isOpen: false }))} className="btn" style={{ background: '#f3f4f6', color: '#374151' }}>Cancelar</button>
                    <button onClick={() => confirmSelection(company)} className="btn btn-primary">Confirmar</button>
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
                    showToast({ type: 'error', title: 'Error', message: data.message || 'No se pudo guardar.' });
                    setModalConfig(m => ({ ...m, isOpen: false }));
                    return;
                }
            } catch {
                // silent
            }
        }
        setSelectedCompanyId(company.id);
        if (onSelect) onSelect(company);
        setModalConfig(m => ({ ...m, isOpen: false }));
        showToast({ type: 'success', title: '¡Empresa Seleccionada!', message: `Registraste correctamente a ${company.name}.` });
    };

    return (
        <div className="scv-container">
            {/* Header */}
            <div className="scv-header">
                <h2 className="scv-title">
                    {mode === 'catalog' ? 'Catálogo de Empresas' : 'Selección de Empresa'}
                </h2>
                <p className="scv-subtitle">
                    {mode === 'catalog'
                        ? 'Consulta las empresas con convenio vigente para realizar tu estadía.'
                        : 'Elige la empresa donde realizarás tu estadía profesional.'}
                </p>
            </div>

            {/* Filters */}
            <div className="scv-filters-card">
                <div className="scv-filters-grid">
                    <div style={{ position: 'relative' }}>
                        <Search size={17} className="scv-filter-icon" />
                        <input
                            type="text"
                            className="input"
                            placeholder="Buscar empresa..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Filter size={17} className="scv-filter-icon" />
                        <select
                            className="input"
                            value={selectedCareerId}
                            onChange={e => setSelectedCareerId(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        >
                            <option value="">-- Todas las carreras --</option>
                            {CAREERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                {mode === 'selection' && !selectedCareerId && (
                    <p className="scv-tip">Selecciona tu carrera para ver las empresas recomendadas.</p>
                )}
            </div>

            {/* Results */}
            {filteredCompanies.length === 0 ? (
                <div className="scv-empty">
                    <Building size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                    <p>No se encontraron empresas con los criterios seleccionados.</p>
                </div>
            ) : (
                <div className="scv-grid">
                    {filteredCompanies.map(company => {
                        const isSelected = selectedCompanyId === company.id;
                        const careerText = CAREERS.find(c => c.id === company.careerId)?.name || company.careerId;
                        const CareerIcon = getCareerIcon(careerText);
                        
                        return (
                            <div
                                key={company.id}
                                className={`scv-card ${isSelected ? 'scv-card--selected' : ''}`}
                            >
                                {/* Card Top */}
                                <div className="scv-card-top">
                                    <div className={`scv-card-icon ${isSelected ? 'scv-card-icon--active' : ''}`}>
                                        <CareerIcon size={22} />
                                    </div>
                                    {mode === 'selection' && (
                                        <button
                                            onClick={() => handleSelect(company)}
                                            className={`btn ${isSelected ? 'btn-primary' : 'scv-select-btn'}`}
                                        >
                                            {isSelected ? ' Seleccionada' : 'Elegir'}
                                        </button>
                                    )}
                                </div>

                                {/* Card Body */}
                                <h3 className="scv-card-name">{company.name}</h3>
                                <span className="scv-career-tag">
                                    {CAREERS.find(c => c.id === company.careerId)?.name || company.careerId || 'General'}
                                </span>

                                <div className="scv-card-info">
                                    <div className="scv-info-row">
                                        <MapPin size={15} className="scv-info-icon" />
                                        <span>{company.address || 'Sin dirección'}</span>
                                    </div>
                                    <div className="scv-info-row">
                                        <Phone size={15} className="scv-info-icon" />
                                        <span>{company.contact || 'Sin contacto'}</span>
                                    </div>
                                    <div className="scv-info-row">
                                        <Mail size={15} className="scv-info-icon" />
                                        <span className="scv-email">{company.email || 'Sin correo'}</span>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                {mode === 'selection' && (
                                    <div className="scv-card-footer">
                                        <div className="scv-footer-item">
                                            <Users size={14} />
                                            <span>Vacantes: <strong>{company.spots ?? 0}</strong></span>
                                        </div>
                                        <span className={`scv-apoyo-tag ${company.hasFinancialSupport ? 'scv-apoyo-tag--si' : 'scv-apoyo-tag--no'}`}>
                                            Apoyo: {company.hasFinancialSupport ? 'Sí' : 'No'}
                                        </span>
                                    </div>
                                )}

                                {company.fileName && (
                                    <div className="scv-convenio">
                                        <FileText size={13} />
                                        Convenio vigente
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(m => ({ ...m, isOpen: false }))}
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
