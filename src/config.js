// url base del backend, leída desde la variable de entorno del archivo .env
// si no existe la variable, usa el servidor local de desarrollo
let url = import.meta.env.VITE_API_URL || 'https://api-gesti.me/api';
if (url.endsWith('/')) {
    url = url.slice(0, -1);
}
if (!url.endsWith('/api')) {
    url = url + '/api';
}
export const API_URL = url;
