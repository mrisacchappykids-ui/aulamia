# AulaMIA: “La IA que entiende tu aula y te ayuda a enseñar”

> **Proyecto Académico** — Técnicas de Inteligencia Artificial para la Educación  
> **Equipo:** 2 estudiantes de Licenciatura en Tecnología  
> **Principio Rector:** *"La IA genera propuestas; el docente decide"*

---

## 🌟 ¿Qué es AulaMIA?

A diferencia de los generadores de texto tradicionales (como un ChatGPT genérico), **AulaMIA** no inicia preguntando simplemente *“¿qué actividad quieres crear?”*. Su núcleo diferencial es el **Contexto del Aula**:

```
CONTEXTO DEL AULA ➡️ MOTOR DE IA ➡️ PROPUESTA PEDAGÓGICA ➡️ REVISIÓN DEL DOCENTE ➡️ EXPERIENCIA DE APRENDIZAJE
```

El docente define o selecciona su perfil de aula (grado, asignatura, número de estudiantes, recursos disponibles, metodología y **apoyos de inclusión / DUA**), y a partir de este contexto la plataforma genera propuestas de enseñanza estructuradas y respetuosas de la diversidad.

---

## 🚀 Arquitectura del Prototipo

El prototipo está construido en dos capas independientes y desacopladas:

1. **Frontend en Next.js (App Router, TypeScript, Tailwind CSS, Lucide Icons)**
   - Dashboard principal con métricas de impacto pedagógico y horas ahorradas.
   - Selector persistente de Contexto de Aula activo en barra de navegación y vistas.
   - Módulo de **Perfiles de Aula** con enfoque de inclusión DUA (sin etiquetas médicas).
   - Generador estructurado de **Planeaciones de Clase** (fases: Inicio, Desarrollo, Cierre, DUA).
   - Generador de **Actividades Diferenciadas en 4 niveles** (Base, Refuerzo, Profundización, Adaptada).
   - Generador de **Evaluaciones Formativas y Rúbricas Cualitativas** con pistas de andamiaje.
   - Generador y **Simulador Interactivo en Vivo de Mini-Juegos** con insignias y sin frustración.
   - Herramienta diferencial estrella: **“✨ Adaptar para mi aula”** (rediseño 1-click a partir de consignas externas).
   - Formatos limpios y optimizados para imprimir o exportar a PDF (`@media print`).

2. **Backend en FastAPI (Python 3.13, Pydantic v2, Uvicorn, CORS)**
   - API REST documentada interactivamente con Swagger UI (`/docs`).
   - Persistencia de cuentas, sesiones, perfiles y recursos en PostgreSQL. En desarrollo, SQLite se activa cuando la URL de PostgreSQL está vacía.
   - Motor de IA pedagógica contextualizada con plantillas DUA y soporte nativo para **Google Gemini** (`GEMINI_API_KEY`).

---

## 💻 Instrucciones para Ejecutar

### Opción 1: Un solo clic en Windows
Haz doble clic sobre el archivo:
```
start-all.bat
```
Este archivo abrirá simultáneamente el backend en el puerto `8000` y el frontend en el puerto `3000`.

### Opción 2: Ejecución manual por terminales

#### Terminal 1 — Backend (FastAPI):
```powershell
cd c:\Users\ijs-b\Documents\aulamia\backend
.\.venv\Scripts\activate
python run.py
```
- API disponible en: `http://localhost:8000`
- Documentación Swagger: `http://localhost:8000/docs`

#### Terminal 2 — Frontend (Next.js):
```powershell
cd c:\Users\ijs-b\Documents\aulamia\frontend
npm run dev
```
- Aplicación web en: `http://localhost:3000`

### Configuración y pruebas

Para instalar las dependencias del backend, crea `backend/.venv` con Python 3.13 y ejecuta `python -m pip install -r requirements.txt` dentro de ese entorno. En `frontend/` ejecuta `npm ci`. Los archivos `.env.example` indican las variables de cada servicio. Para una prueba local con SQLite, define `AULAMIA_USE_SQLITE=1` y apunta `AULAMIA_DATA_DIR` a un directorio de pruebas.

La suite inicia su propia API con una base SQLite temporal, datos ficticios y generación por plantillas. Desde la raíz del repositorio en Windows:

```powershell
.\backend\.venv\Scripts\python.exe backend/test_api_suite.py
```

### Despliegue en Vercel

- El proyecto Next.js debe usar `frontend/` como directorio raíz y apuntar con `NEXT_PUBLIC_API_URL` al origen de FastAPI. Si cambia esa variable, vuelve a compilar el frontend.
- El proyecto FastAPI debe usar `backend/` como directorio raíz y tener `STORAGE_POSTGRES_URL`. Comprueba que `/health/db` responda HTTP 200 con `mode=postgres` antes de promover un despliegue. Agrega orígenes adicionales del frontend en `CORS_ORIGINS`.
- Para activar Google, configura el mismo ID de cliente en `GOOGLE_CLIENT_ID` del backend y `NEXT_PUBLIC_GOOGLE_CLIENT_ID` del frontend. Registra el origen del frontend en Google Cloud.
- Verifica que las cuentas anteriores se importen antes de retirar de Git el archivo legado. La importación usa una transacción y conserva los identificadores y hashes existentes. Para importar un respaldo privado desde otra máquina, coloca el respaldo en esa máquina, define `AULAMIA_LEGACY_USERS_FILE` y ejecuta el backend con la conexión a la base de destino. Prueba una cuenta existente antes de cambiar el despliegue.

---

## 🛡️ Principios Éticos y Pedagógicos

AulaMIA incorpora desde su diseño los límites éticos definidos en el Brief del proyecto:
- ❌ **No diagnostica trastornos o condiciones médicas.**
- ❌ **No sustituye el criterio pedagógico del profesor.**
- ❌ **No califica de forma punitiva o descontextualizada a los alumnos.**
- ✅ **Aporta apoyos DUA, andamiaje cognitivo, flexibilización de tiempos y reducción de carga de trabajo docente.**
