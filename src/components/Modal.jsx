import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// componente modal reutilizable con soporte para tres partes: header, body y footer
// el prop `type` cambia el color del header a rojo cuando es 'danger'
export default function Modal({ isOpen, onClose, title, children, footer, type = 'info' }) {
    // cierra el modal al presionar la tecla escape
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        // limpia el listener al desmontar el componente
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // no renderiza nada si el modal está cerrado
    if (!isOpen) return null;

    return (
        // fondo oscuro semitransparente; click en el fondo cierra el modal
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            {/* contenedor del modal; stopPropagation evita que cierre al hacer click dentro */}
            <div
                style={{
                    backgroundColor: 'white', borderRadius: '0.75rem', width: '90%', maxWidth: '500px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    overflow: 'hidden', animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* header con título y botón de cerrar */}
                <div style={{
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: type === 'danger' ? '#FEF2F2' : 'white'
                }}>
                    <h3 style={{
                        fontSize: '1.25rem', fontWeight: 600,
                        color: type === 'danger' ? '#991B1B' : '#111827'
                    }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* body: contenido dinámico pasado como children */}
                <div style={{ padding: '1.5rem', color: '#4b5563', fontSize: '1rem', lineHeight: '1.5' }}>
                    {children}
                </div>

                {/* footer opcional con botones de acción */}
                {footer && (
                    <div
                        className="modal-footer"
                        style={{
                            padding: '1rem 1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb',
                            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
                        }}
                    >
                        {footer}
                    </div>
                )}
            </div>
            {/* animación de entrada del modal */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
