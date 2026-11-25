# 📅 Calendary — Control Inteligente de Jornadas Laborales

Aplicación web progresiva (**PWA**) fullstack construida con **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **Supabase (PostgreSQL + RLS)** y **Drizzle ORM**.

Diseñada especialmente para profesionales con horarios rotativos, turnos diferenciados por días de la semana, tardes flexibles, desglose de horas extras (al entrar o salir) y cómputo de festivos y descansos trabajados.

---

## 🚀 Características Clave

- ☀️ **Turnos Dinámicos**: Mañanas estándar (ej. Lun-Mié), mañanas especiales (ej. Jue-Vie) y tardes flexibles.
- ⚡ **Desglose de Horas Extras**: Cálculo automático al inicio o final de la jornada con campo para justificar la causa.
- 🛌 **Descansos y Festivos**: Detección de festivos nacionales y registro de libranzas cubiertas.
- 📊 **Analítica & Gráficos**: Evolución visual mensual, trimestral y semestral con Recharts.
- 📑 **Informes & Exportación**: Descarga en Excel (CSV) e impresión optimizada en PDF.
- 💰 **Calculadora de 3 Tarifas Extras**: Estimación económica opcional para día normal, descanso y festivo.
- 📱 **PWA Offline (Nivel 1 y 2)**: Instalable en móvil/PC como app nativa y capaz de registrar turnos sin cobertura con sincronización automática.
- 🎨 **Temas Claro / Oscuro / Sistema**: Adaptable con transiciones fluidas.
- 🔒 **Seguridad RLS en Supabase**: Aislamiento estricto de datos por usuario con PostgreSQL.

---

## 📖 Documentación Completa

Para consultar la guía detallada de arquitectura, modelos de datos, políticas de seguridad y manual de usuario, abre:
👉 **[DOCUMENTATION.md](./DOCUMENTATION.md)**

---

## 💻 Inicio Rápido

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables en `.env.local` (ver `.env.example`).

3. Sincronizar base de datos:
   ```bash
   npx drizzle-kit push
   ```

4. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000).
