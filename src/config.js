// url base del backend, leída desde la variable de entorno del archivo .env
// si no existe la variable, usa el servidor local de desarrollo
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
