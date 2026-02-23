import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ─── Single Toast Item ──────────────────────────────────────────────────── */
function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Mount → slide in
        const showTimer = setTimeout(() => setVisible(true), 10);
        // Auto-dismiss after duration
        const hideTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 350);
        }, toast.duration || 4000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [toast.id, toast.duration, onRemove]);

    const config = {
        success: {
            icon: <CheckCircle size={20} />,
            bg: '#F0FDF4',
            border: '#86EFAC',
            text: '#166534',
            iconColor: '#22C55E',
        },
        error: {
            icon: <XCircle size={20} />,
            bg: '#FEF2F2',
            border: '#FCA5A5',
            text: '#991B1B',
            iconColor: '#EF4444',
        },
        warning: {
            icon: <AlertTriangle size={20} />,
            bg: '#FFFBEB',
            border: '#FCD34D',
            text: '#92400E',
            iconColor: '#F59E0B',
        },
        info: {
            icon: <Info size={20} />,
            bg: '#EFF6FF',
            border: '#93C5FD',
            text: '#1E40AF',
            iconColor: '#3B82F6',
        },
    };

    const cfg = config[toast.type] || config.info;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: '0.75rem',
                padding: '0.875rem 1rem',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                minWidth: '280px',
                maxWidth: '380px',
                position: 'relative',
                transform: visible ? 'translateX(0)' : 'translateX(110%)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s',
                fontFamily: "'Outfit', sans-serif",
            }}
        >
            {/* Icon */}
            <div style={{ color: cfg.iconColor, flexShrink: 0, marginTop: '0.1rem' }}>
                {cfg.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                {toast.title && (
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: cfg.text, marginBottom: '0.15rem' }}>
                        {toast.title}
                    </p>
                )}
                <p style={{ fontSize: '0.85rem', color: cfg.text, lineHeight: 1.5 }}>
                    {toast.message}
                </p>
            </div>

            {/* Close */}
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onRemove(toast.id), 350);
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: cfg.text,
                    opacity: 0.6,
                    padding: '0.1rem',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <X size={16} />
            </button>

            {/* Progress bar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    borderRadius: '0 0 0.75rem 0.75rem',
                    background: cfg.iconColor,
                    animation: `toastProgress ${toast.duration || 4000}ms linear forwards`,
                }}
            />
        </div>
    );
}

/* ─── Toast Container ────────────────────────────────────────────────────── */
export default function ToastContainer({ toasts, onRemove }) {
    return (
        <>
            <style>{`
                @keyframes toastProgress {
                    from { width: 100%; }
                    to   { width: 0%; }
                }
            `}</style>
            <div
                style={{
                    position: 'fixed',
                    top: '1.25rem',
                    right: '1.25rem',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                    pointerEvents: 'none',
                }}
            >
                {toasts.map(t => (
                    <div key={t.id} style={{ pointerEvents: 'all' }}>
                        <ToastItem toast={t} onRemove={onRemove} />
                    </div>
                ))}
            </div>
        </>
    );
}
