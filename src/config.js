// Lee la URL del backend desde el .env (VITE_API_URL).
// Si no existe la variable, usa el valor local por defecto.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

