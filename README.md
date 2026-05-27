# 🖥️ lab-frontend-nextjs — Panel de Administración y Catálogo

Panel de administración construido con Next.js que consume el backend `lab-spring-postgres`. Incluye autenticación JWT, gestión de ítems y un catálogo de medicamentos con filtros avanzados.

**Estado**: ✅ Live en Vercel  
**URL Producción**: `https://lab-frontend-nextjs.vercel.app`  
**Backend**: `lab-spring-postgres` (Render) — `https://lab-spring-postgres.onrender.com`

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Deploy**: Vercel

---

## 📂 Páginas y Funcionalidades

### `/` — Login
- Formulario de autenticación (usuario + contraseña).
- Se comunica con `POST /login` del backend Spring Boot.
- Guarda el JWT en `localStorage` al autenticarse.
- **Health Check integrado**: antes de mostrar el formulario activo, verifica que el backend esté UP con `GET /health`. Si está dormido (Cold Start de Render), muestra un banner ámbar y deshabilita el botón hasta que el servidor responda.

### `/dashboard` — Panel Principal
- Vista de bienvenida con acceso a las secciones del sistema.

### `/items` — Gestión de Ítems
- CRUD completo de la tabla `items` del backend Spring Boot.
- Lista paginada de ítems con controles de navegación.
- Formulario para crear y editar ítems (nombre + descripción).
- Eliminación con confirmación.

### `/catalogo` — Catálogo de Medicamentos
Consume el JSON generado por `lab-data-service` vía una API Route interna de Next.js (`/api/catalogo`). No depende del backend Spring Boot.

**Funcionalidades del catálogo:**
- Tabla de 450+ medicamentos con columnas: Código, Medicamento, Presentación, Estado.
- **Búsqueda global**: por nombre o código.
- **Filtro de disponibilidad**: Todos / En Stock / Agotados.
- **Filtro por presentación**: Comprimidos, Jarabes, Cremas, Inyectables, Oftálmicos, Óvulos, Sobres (detectados dinámicamente del dataset).
- **Paginación configurable**: 5, 10, 25, 50, 100 o 200 registros por página.
- **Estadísticas en tiempo real**: conteo de medicamentos con y sin stock.

---

## ⚙️ Configuración

### Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

Para apuntar al backend en Render (producción/pruebas):
```env
NEXT_PUBLIC_API_URL=https://lab-spring-postgres.onrender.com
```

> Ver `docs/switch-backend.md` para instrucciones detalladas de cambio de entorno y consideraciones CORS.

### Instalación y desarrollo local

```bash
npm install
npm run dev
```

El servidor inicia en `http://localhost:3000`.

**Prerequisito**: Tener `lab-spring-postgres` corriendo en `localhost:8081` o configurar `NEXT_PUBLIC_API_URL` al backend en Render.

---

## 🔄 Cold Start Handling

El backend corre en Render free tier y entra en reposo tras 15 min de inactividad. El frontend maneja esto con:

1. **`useServerHealth` hook** (`src/hooks/useServerHealth.ts`): al montar la página de login, hace polling cada 5 segundos a `GET /health` hasta recibir `{ status: "UP" }`.
2. **Banner visual**: notifica al usuario que el servidor está despertando (~1 min).
3. **Botón bloqueado**: el login queda deshabilitado y muestra "Esperando servidor..." hasta que el backend confirme que está listo.

---

## 🏗️ Arquitectura del Catálogo

```
[lab-data-service] → outputs/botica-municipal/data.json (GitHub)
                                    │
                         API Route interna de Next.js
                         src/app/api/catalogo/route.ts
                                    │
                         Página /catalogo (tabla + filtros)
```

La API Route lee el JSON directamente desde GitHub Raw, evitando dependencias con el backend Spring Boot y asegurando disponibilidad independiente.

---

## 📂 Estructura del Proyecto

```
lab-frontend-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Login con health check
│   │   ├── dashboard/page.tsx  # Panel principal
│   │   ├── items/page.tsx      # CRUD de ítems
│   │   ├── catalogo/page.tsx   # Catálogo de medicamentos
│   │   └── api/catalogo/       # API Route interna (proxy al JSON)
│   ├── hooks/
│   │   └── useServerHealth.ts  # Polling de salud del backend
│   └── lib/
│       └── api.ts              # Cliente HTTP (login, items CRUD)
├── docs/
│   └── switch-backend.md       # Guía para alternar entre local y Render
└── openspec/
    └── specs/health-monitor.md # Spec del sistema de Health Check
```

---

## 🔗 Integración con el Ecosistema

| Servicio | Cómo se usa |
|---|---|
| `lab-spring-postgres` | Auth JWT (`/login`) y CRUD de ítems (`/items`) |
| `lab-data-service` | JSON del catálogo vía GitHub Raw → API Route interna |
| `lab-monitor-service` | Mantiene activo `lab-spring-postgres` en Render |
