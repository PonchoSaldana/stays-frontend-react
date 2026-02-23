import { useState, useCallback } from 'react';

let nextId = 1;

/**
 * useToast – hook para mostrar notificaciones tipo toast.
 *
 * Uso:
 *   const { toasts, showToast, removeToast } = useToast();
 *
 *   showToast({ type: 'success', title: 'Listo', message: 'Operación completada', duration: 4000 });
 *   showToast({ type: 'error',   message: 'Algo salió mal' });
 *   showToast({ type: 'warning', message: 'Atención' });
 *   showToast({ type: 'info',    message: 'Información' });
 *
 * Luego monta <ToastContainer toasts={toasts} onRemove={removeToast} /> en el return del componente.
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = nextId++;
        setToasts(prev => [...prev, { id, type, title, message, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
}
