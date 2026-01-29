# Sistema de Titulación UT Tecamachalco (Frontend Demo)

Este proyecto es una demostración visual del proceso de titulación para la UT Tecamachalco.

## Tecnologías
- **Vite + React**: Framework ligero y rápido.
- **Tailwind CSS (Inline/Custom)**: Estilos rápidos (aunque usamos CSS vanilla con variables en `index.css`).
- **Framer Motion**: Animaciones fluidas para el "Avatar Path".
- **Lucide React**: Iconos modernos.
- **Canvas Confetti**: Celebración final.

## Flujo del Usuario
1. **Login**: Ingresar matrícula.
2. **Carga Inicial**: 10 Documentos obligatorios.
3. **Validación**: Simulación de revisión automática.
4. **Generación**: Creación de documentos intermedios (Pago, Solicitud).
5. **Segunda Carga**: Subir documentos generados y firmados.
6. **Firma Admin**: Aprobación final.
7. **Descarga**: Obtención del Título Electrónico.

## Ejecución
```bash
npm install
npm run dev
```
