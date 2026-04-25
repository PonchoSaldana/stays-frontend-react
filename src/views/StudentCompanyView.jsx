import React, { useState, useEffect } from 'react';
import { Building, Search, MapPin, Phone, Mail, FileText, CheckCircle, Filter, Users, User, Code, Factory, Briefcase, Calculator, Leaf, FlaskConical, Wifi, Apple } from 'lucide-react';
import Modal from '../components/Modal';
import ToastContainer from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { authFetch } from '../auth';
import { API_URL } from '../config';

// Careers se cargarán dinámicamente

// Custom Icon for Food Science (Matraz + Manzana)
const FoodScienceIcon = ({ size = 22, className, ...props }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }} className={className}>
        <FlaskConical size={size} style={{ position: 'absolute', left: '-2px' }} {...props} />
        <Apple size={size * 0.6} style={{ position: 'absolute', bottom: '-4px', right: '-4px', fill: 'currentColor' }} {...props} />
    </div>
);

const getCareerIcon = (careerText) => {
    if (!careerText) return Building;
    const text = String(careerText).toLowerCase();
    
    // Redes / Ciberseguridad
    if (text.includes('redes') || text.includes('ciber')) return Wifi;
    // TI / Software
    if (text.includes('soft') || text.includes('ti ')) return Code;
    // Química / Tecnología Ambiental
    if (text.includes('quí') || text.includes('qui') || text.includes('amb')) return FlaskConical;
    // Alimentos (Custom Icon: Matraz + Manzana)
    if (text.includes('ali') || text.includes('alimento')) return FoodScienceIcon;
    // Bio / Agricultura
    if (text.includes('bio') || text.includes('agr')) return Leaf;
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
    const [CAREERS, setCAREERS] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/careers`)
            .then(res => res.json())
            .then(data => setCAREERS(data || []))
            .catch(() => {});
    }, []);

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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ companyId: company.id })
                });
                const data = await res.json();
                if (!res.ok) {
                    showToast({ type: 'error', title: 'Sin vacantes', message: data.message || 'No se pudo guardar.' });
                    setModalConfig(m => ({ ...m, isOpen: false }));
                    return;
                }
            } catch (err) {
                showToast({ type: 'error', title: 'Error de red', message: 'No se pudo conectar con el servidor.' });
                setModalConfig(m => ({ ...m, isOpen: false }));
                return;
            }
        }
        // Actualizar las vacantes localmente restando 1
        setCompanies(prev => prev.map(c =>
            c.id === company.id
                ? { ...c, maxStudents: Math.max(0, (c.maxStudents ?? c.spots ?? 1) - 1) }
                : c
        ));
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
                        const sup = company.economicSupport;
                        const hasSupport = sup === 'Sí' || sup === 'Si' || sup === 'si' || sup === 'SI' || sup === 'sí' || company.hasFinancialSupport === true || (sup && sup !== 'No' && sup !== 'no' && sup !== '' && sup !== '0');
                        
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
                                        <User size={15} className="scv-info-icon" />
                                        <span>{company.contact || 'Sin contacto'}</span>
                                    </div>
                                    <div className="scv-info-row">
                                        <Mail size={15} className="scv-info-icon" />
                                        <span className="scv-email">{company.email || 'Sin correo'}</span>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="scv-card-footer">
                                    <div className="scv-footer-item">
                                        <Users size={14} />
                                        {(() => {
                                            const spots = company.maxStudents ?? company.spots ?? 0;
                                            const noSpots = spots === 0;
                                            return (
                                                <span style={noSpots ? { color: '#ef4444', fontWeight: 600 } : {}}>
                                                    Vacantes: <strong>{spots}</strong>
                                                    {noSpots && ' — Lleno'}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <span className={`scv-apoyo-tag ${hasSupport ? 'scv-apoyo-tag--si' : 'scv-apoyo-tag--no'}`}>
                                        Apoyo: {hasSupport ? 'Sí' : 'No'}
                                    </span>
                                </div>

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
