import { API_URL } from './config';

/**
 * Obtiene el token JWT guardado en sessionStorage.
 */
export const getToken = () => sessionStorage.getItem('ut_token');

/**
 * Obtiene headers con Authorization Bearer para requests autenticados.
 */
export const authHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    ...extra
});

/**
 * Wrapper de fetch que agrega automáticamente el token JWT.
 * Si la respuesta es 401/403, limpia la sesión y redirige al login.
 *
 * @param {string} endpoint  - Path relativo a API_URL (ej: '/students/12345')
 * @param {object} options   - Opciones de fetch (method, body, etc.)
 */
export const authFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    const mergedOptions = {
        ...options,
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            ...(options.body && !(options.body instanceof FormData)
                ? { 'Content-Type': 'application/json' }
                : {}),
            ...options.headers
        }
    };

    const response = await fetch(url, mergedOptions);

    // Token expirado o inválido → cerrar sesión
    if (response.status === 401 || response.status === 403) {
        sessionStorage.clear();
        window.location.href = '/';
        return response;
    }

    return response;
};
