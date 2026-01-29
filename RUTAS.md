# Guía de Rutas del Sistema de Estadías

Para visualizar las diferentes etapas del proceso de estadía, asegúrate de que el servidor esté corriendo (generalmente en `http://localhost:5173`).

**Importante**: Primero debes ir al **Login** e ingresar una matrícula (ej. `20230001`) para crear la sesión.

## Mapa de Rutas

| Etapa del Proceso | Ruta Relativa | Descripción |
|-------------------|---------------|-------------|
| **1. Autenticación** | `/login` | Pantalla de inicio de sesión. |
| **2. Carga Inicial** | `/estadia/documentos-iniciales` | Módulo para subir los 10 documentos requeridos (Solicitud, INE, etc.). |
| **3. Validación 1** | `/estadia/revision-inicial` | Pantalla de espera mientras se "validan" los documentos. Transición automática. |
| **4. Generación** | `/estadia/generacion-documentos` | Módulo donde aparecen los formatos de reportes para descargar. |
| **5. Carga Final** | `/estadia/documentos-finales` | Módulo para subir los reportes mensuales y evaluaciones ya firmados. |
| **6. Validación 2** | `/estadia/revision-final` | Segunda validación de documentos entregados. |
| **7. Firma Admin** | `/estadia/firma-digital` | Simulación de la firma electrónica del Director/Asesor. |
| **8. Conclusión** | `/estadia/finalizado` | Pantalla final con documentos liberados para descarga. |

## Modos de Prueba
- **Demo Mode**: En las pantallas de carga, puedes hacer clic en el recuadro punteado (o en el icono de subida) para simular que cargas un archivo instantáneamente sin abrir el explorador de archivos.
