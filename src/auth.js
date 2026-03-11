import { API_URL } from './config';

// obtiene el token jwt guardado en sessionStorage después del login
export const getToken = () => sessionStorage.getItem('ut_token');

// genera los headers de autorización para peticiones autenticadas
export const authHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    ...extra
});

// wrapper de fetch que agrega el token jwt automáticamente en cada petición
// si el servidor responde 401 o 403, limpia la sesión y redirige al login
export const authFetch = async (endpoint, options = {}) => {
    // permite pasar una url completa o solo el path relativo a la api
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    const mergedOptions = {
        ...options,
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            // agrega content-type solo si el body no es un FormData (archivos)
            ...(options.body && !(options.body instanceof FormData)
                ? { 'Content-Type': 'application/json' }
                : {}),
            ...options.headers
        }
    };

    const response = await fetch(url, mergedOptions);

    // token expirado o sin permisos: cerrar sesión y redirigir al login
    if (response.status === 401 || response.status === 403) {
        sessionStorage.clear();
        window.location.href = '/';
        return response;
    }

    return response;
};
