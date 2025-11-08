
# Biblioteca React (Migración rápida)

Este proyecto es un *esqueleto* en React (Vite + React Router) para migrar tu proyecto de frontend.
Incluye:
- Rutas equivalentes a tus páginas (`/`, `/login`, `/register`, `/admin`, `/estudiantes`, `/prestamos`, `/gestion-usuarios`)
- Copia de tus **Imagenes** y **styles** originales
- Carpeta **legacy/** con tus JS originales para que migres la lógica por partes
- Utilidades para `localStorage` y *seeding* del catálogo

## Correr el proyecto
```bash
npm install
npm run dev
```
Luego abre la URL que te indique Vite (por defecto http://localhost:5173).

## Dónde poner cada cosa
- Componentes comunes: `src/components/`
- Páginas: `src/pages/`
- Estilos globales: `src/styles/index.css` (puedes importar tus CSS existentes aquí o por componente)
- Lógica que aún no migras: `src/legacy/` (referencia)
- Utilidades: `src/utils/`

## Ejemplo migrado
La página **Estudiantes** ya muestra el catálogo desde `localStorage` (llave `catalogo_items`) y permite
"Solicitar", lo que decrementa stock y agrega a `solicitudes_tmp`.

Para migrar el resto, abre los archivos en `legacy/` y trae sus funciones a componentes o hooks.
