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
   - Gestión y persistencia en JSON estructurado de perfiles y recursos generados.
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

---

## 🛡️ Principios Éticos y Pedagógicos

AulaMIA incorpora desde su diseño los límites éticos definidos en el Brief del proyecto:
- ❌ **No diagnostica trastornos o condiciones médicas.**
- ❌ **No sustituye el criterio pedagógico del profesor.**
- ❌ **No califica de forma punitiva o descontextualizada a los alumnos.**
- ✅ **Aporta apoyos DUA, andamiaje cognitivo, flexibilización de tiempos y reducción de carga de trabajo docente.**
