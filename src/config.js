// url base del backend
// En Railway/Vercel leerá VITE_API_URL, en local fallará a localhost
let url = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

if (url.endsWith('/')) {
    url = url.slice(0, -1);
}
if (!url.endsWith('/api')) {
    url = url + '/api';
}
export const API_URL = url;
