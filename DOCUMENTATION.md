# 📖 Calendary — Manual de Usuario y Documentación Técnica

> **Calendary** es una aplicación web progresiva (PWA) fullstack diseñada para el registro, control y análisis inteligente de jornadas laborales con horarios rotativos, turnos diferenciados, horas extras al inicio o al final, descansos trabajados y festivos nacionales.

---

## 📑 Tabla de Contenidos
1. [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
2. [Seguridad y Base de Datos (Supabase RLS)](#-seguridad-y-base-de-datos-supabase-rls)
3. [Características Principales](#-características-principales)
   - [Calendario Mensual Interactivo](#1-calendario-mensual-interactivo)
   - [Turnos Variables y Plantillas Dinámicas](#2-turnos-variables-y-plantillas-dinámicas)
   - [Cálculo y Desglose de Horas Extras](#3-cálculo-y-desglose-de-horas-extras)
   - [Días Especiales: Festivos y Descansos](#4-días-especiales-festivos-y-descansos)
   - [Informes Mensuales, Exportación Excel y PDF](#5-informes-mensuales-exportación-excel-y-pdf)
   - [Estimación Económica de Horas Extras (3 Tarifas)](#6-estimación-económica-de-horas-extras-3-tarifas)
   - [Analítica y Gráficos Visuales](#7-analítica-y-gráficos-visuales)
   - [PWA Instalable y Modo Offline (Nivel 1 y 2)](#8-pwa-instalable-y-modo-offline-nivel-1-y-2)
   - [Sistema de Temas (Claro / Oscuro / Sistema)](#9-sistema-de-temas-claro--oscuro--sistema)
   - [Landing Page Pública](#10-landing-page-pública)
4. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
5. [Estructura de Archivos del Proyecto](#-estructura-de-archivos-del-proyecto)

---

## 🛠️ Arquitectura y Stack Tecnológico

| Capa | Tecnología | Función |
| :--- | :--- | :--- |
| **Framework Fullstack** | **Next.js 16 (App Router)** | Servidor de renderizado, Server Actions y Proxy/Middleware. |
| **Lenguaje** | **TypeScript 5** | Tipado estricto en cálculos de tiempo, duraciones e interfaces de datos. |
| **Estilos & UI** | **Tailwind CSS v4** | Utilidades modernas con `@custom-variant dark` para cambio de tema dinámico. |
| **Base de Datos** | **PostgreSQL (Supabase)** | Base de datos relacional con `uuid`, marcas temporales y claves foráneas. |
| **ORM** | **Drizzle ORM + Drizzle Kit** | Consultas SQL de alto rendimiento y migraciones declarativas. |
| **Autenticación** | **Supabase Auth (`@supabase/ssr`)** | Sesiones seguras en cookies HTTP-only, flujo de login/registro. |
| **Gráficos** | **Recharts** | Visualización interactiva de barras, líneas y gráficos circulares. |
| **Fechas y Tiempos** | **date-fns** | Algoritmos de duraciones, cruce de medianoche y formatos localizados en español. |
| **Iconografía** | **Lucide React** | Iconos consistentes y optimizados para móvil y escritorio. |

---

## 🔒 Seguridad y Base de Datos (Supabase RLS)

La seguridad se sustenta en el principio de **aislamiento estricto por usuario**:
- **Row Level Security (RLS)** activado en todas las tablas (`work_entries`, `shift_templates`, `holidays`).
- Cada consulta utiliza `auth.uid() = user_id`, impidiendo que cualquier usuario pueda leer, modificar o eliminar registros que no le pertenezcan.
- El archivo [`supabase_rls_security.sql`](./supabase_rls_security.sql) contiene las políticas oficiales ejecutables en el panel de Supabase.

---

## 🌟 Características Principales

### 1. Calendario Mensual Interactivo
- **Navegación Fluida**: Selector de mes y año con flechas y botón para regresar a *"Hoy"*.
- **Código de Colores Distintivo**:
  - ☀️ **Azul**: Turnos de Mañana.
  - ⛅ **Ámbar**: Turnos de Tarde flexible.
  - 🎉 **Púrpura**: Festivos nacionales oficiales.
  - ⚡ **Punto de luz ámbar**: Indicador visual instantáneo si en esa jornada se generaron horas extras.
- **Micro-interacciones**: Elevación de celdas al pasar el cursor (`calendar-cell-hover`) para anticipar la pulsación.

### 2. Turnos Variables y Plantillas Dinámicas
- Resuelve el problema de jornadas que cambian según el día de la semana:
  - **Mañana Estándar**: Horario fijo para ciertos días (ej: Lun-Mié, 07:00 a 15:00).
  - **Mañana Reducida/Especial**: Horario alternativo para los otros dos días (ej: Jue-Vie, 08:00 a 14:30).
  - **Tarde Flexible**: Entrada y salida variables sin hora forzada.
- **Autoselección Inteligente**: Al hacer clic en un día del calendario, la aplicación detecta el día de la semana y precarga la plantilla correspondiente para que no tengas que escribir todo desde cero.
- **Gestor de Plantillas**: Modal para crear, modificar días aplicables o eliminar plantillas libremente.

### 3. Cálculo y Desglose de Horas Extras
- Algoritmo que calcula minutos netos trabajados descontando los descansos.
- Soporta turnos que **cruzan la medianoche** (salidas al día siguiente).
- **Doble Origen de Horas Extras**:
  - Horas extras **al inicio** (por relevos anticipados).
  - Horas extras **al final** (por prolongación de jornada).
- Campo para añadir la justificación o motivo de la hora extraordinaria.

### 4. Días Especiales: Festivos y Descansos
- Detección automática del calendario oficial de **Festivos Nacionales**.
- Casilla para marcar si la jornada se realizó en un **Día de Descanso / Libranza habitual**.

### 5. Informes Mensuales, Exportación Excel y PDF
- **Resumen Completo**: Total de horas del mes, total de extras, turnos de mañana/tarde y días especiales.
- **Tabla Desglosada Día por Día**: Con horas exactas, pausas y motivos.
- **Exportación Excel (CSV)**: Descarga directa con codificación UTF-8 compatible con tildes y caracteres en español.
- **Impresión Limpia / Guardar como PDF**: Estilos optimizados `@media print` que eliminan botones y adaptan la tipografía para entrega oficial a RRHH.

### 6. Estimación Económica de Horas Extras (3 Tarifas)
- Módulo opcional y colapsable integrado en el modal de informes con animación suave.
- Permite configurar tres tarifas independientes (€/hora):
  1. 🏢 **Día Ordinario**
  2. 🛌 **En Día de Descanso**
  3. 🎉 **En Día Festivo**
- Calcula automáticamente el importe acumulado del mes y guarda tus tarifas en tu navegador de forma privada.

### 7. Analítica y Gráficos Visuales
- Vista dedicada en `/analytics` con filtros por:
  - **Último Mes**, **Trimestre**, **Semestre** y **1 Año**.
- Gráficos interactivos de Recharts:
  - **Barras Comparativas**: Horas ordinarias vs Horas extras mes a mes.
  - **Donut de Turnos**: Proporción porcentual entre mañanas y tardes.
  - **Donut de Origen de Extras**: Proporción entre extras generadas al entrar vs al salir.

### 8. PWA Instalable y Modo Offline (Nivel 1 y 2)
- **Nivel 1 (Instalable)**:
  - Manifiesto oficial [`manifest.json`](./public/manifest.json) e iconos vectoriales (`192x192` y `512x512`).
  - Se instala en **Android, iPhone, Windows o Mac** como aplicación nativa a pantalla completa sin barras de navegador.
- **Nivel 2 (Modo Offline Completo)**:
  - Permite fichar y guardar registros aunque no tengas conexión a internet (sótanos, parkings o modo avión).
  - Los fichajes se guardan en una cola local protegida.
  - En cuanto el dispositivo recupera cobertura, se dispara la **sincronización automática** con Supabase sin pérdida de datos.
  - Banner discreto [`SyncStatusBanner`](./src/components/sync-status-banner.tsx) que informa del estado de la cola offline.

### 9. Sistema de Temas (Claro / Oscuro / Sistema)
- Selector de 3 estados en la cabecera (☀️ Sol, 🌙 Luna, 💻 Pantalla).
- Persistencia en `localStorage` sin parpadeos visuales al recargar.
- Soporte de alto contraste tanto para entornos oscuros como luminosos.

### 10. Landing Page Pública
- Si el usuario no ha iniciado sesión, la ruta raíz (`/`) presenta una **página de bienvenida moderna**:
  - Presentación interactiva de las características.
  - Mockup visual fiel del dashboard.
  - Acceso directo al formulario de inicio de sesión o creación de cuenta.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js 18.18+ o superior.
- Una cuenta gratuita en [Supabase](https://supabase.com).

### 1. Clonar e Instalar Dependencias
```bash
npm install
```

### 2. Variables de Entorno (`.env.local`)
Crea o edita el archivo `.env.local` en la raíz con tus claves de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Conexión directa para Drizzle ORM (puerto 6543)
DATABASE_URL="postgresql://postgres.tu-proyecto:tu_password@aws-1-tu-region.pooler.supabase.com:6543/postgres"
```

### 3. Migrar Tablas y Seguridad a Supabase
```bash
# Aplicar el esquema a Supabase
npx drizzle-kit push
```
Posteriormente, copia y ejecuta en el **SQL Editor** de Supabase el archivo [`supabase_rls_security.sql`](./supabase_rls_security.sql).

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador: `http://localhost:3000`.

---

## 📁 Estructura de Archivos del Proyecto

```text
Calendary/
├── public/
│   ├── icons/                    # Iconos PWA (192 y 512 px)
│   ├── manifest.json             # Web App Manifest
│   └── sw.js                     # Service Worker PWA
├── src/
│   ├── app/
│   │   ├── (auth)/login/         # Página y Server Actions de Login/Registro
│   │   ├── actions/              # Server Actions de BD (work-entries, templates)
│   │   ├── analytics/            # Página de analítica y gráficos
│   │   ├── globals.css           # Tailwind v4, selector dark y keyframes
│   │   ├── layout.tsx            # Root layout con ThemeProvider, SW y PWA meta
│   │   └── page.tsx              # Landing condicional (pública) o Dashboard (autenticado)
│   ├── components/
│   │   ├── analytics/            # Componentes de Recharts
│   │   ├── calendar/             # MonthlyCalendar y DayModal
│   │   ├── reports/              # MonthlyReportModal y OvertimeCompensation
│   │   ├── templates/            # TemplatesModal
│   │   ├── dashboard-client.tsx  # Vista cliente principal del usuario
│   │   ├── landing-page.tsx      # Landing page de presentación
│   │   ├── sync-status-banner.tsx# Notificador de conexión y cola offline
│   │   ├── theme-provider.tsx    # Proveedor de next-themes
│   │   └── theme-toggle.tsx      # Selector de 3 modos
│   ├── db/
│   │   ├── index.ts              # Conexión Postgres / Drizzle
│   │   └── schema.ts             # Modelos de tablas (work_entries, templates, holidays)
│   ├── lib/
│   │   ├── export-utils.ts       # Generador de CSV / Excel
│   │   ├── holidays.ts           # Festivos oficiales de referencia
│   │   ├── offline-sync.ts       # Gestor de cola local y auto-sincronización
│   │   ├── supabase/             # Clientes SSR para navegador, servidor y middleware
│   │   └── time-calculations.ts  # Algoritmo puro de horas ordinarias y extras
│   └── proxy.ts                  # Convención Next.js 16 para protección de rutas
├── drizzle.config.ts             # Configuración de Drizzle Kit
├── next.config.ts                # Configuración de Next.js Turbopack
├── package.json
└── supabase_rls_security.sql     # Script de seguridad RLS
```
