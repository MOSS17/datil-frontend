# Datil — Frontend

Plataforma de reservacion de citas para negocios de servicios en Mexico.

## Stack

- React 19 + TypeScript (strict)
- Vite 8
- React Router v7
- TanStack Query v5
- Tailwind CSS v4
- React Hook Form + Zod
- bun

## Inicio rapido

```bash
# Instalar dependencias
bun install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
bun run dev
```

La app corre en `http://localhost:5173`. El backend se espera en `http://localhost:8080/api/v1`.

## Scripts

| Comando            | Descripcion                          |
| ------------------ | ------------------------------------ |
| `bun run dev`      | Servidor de desarrollo               |
| `bun run build`    | Build de produccion                  |
| `bun run preview`  | Preview del build de produccion      |
| `bun run lint`     | Lint con ESLint                      |

## Estructura del proyecto

```
src/
├── api/                    # Cliente HTTP y hooks de TanStack Query
│   ├── client.ts           # Fetch wrapper con auth y manejo de errores
│   ├── endpoints.ts        # Constantes de endpoints
│   ├── types/              # Tipos de request/response por dominio
│   └── hooks/              # Hooks de TanStack Query por dominio
├── auth/                   # Contexto de auth, guards, manejo de tokens
├── routes/                 # Definicion de rutas y paginas
│   ├── router.tsx          # createBrowserRouter
│   ├── dashboard/          # Rutas del panel de administracion (protegidas)
│   ├── booking/            # Rutas publicas de reservacion
│   └── auth/               # Login y registro
├── components/ui/          # Componentes reutilizables (pendiente)
├── hooks/                  # Hooks compartidos
├── lib/                    # Utilidades: formateadores, validadores, constantes
└── types/                  # Tipos compartidos
```

## Rutas

### Panel de administracion (`/dashboard/*`) — requiere autenticacion

| Ruta                          | Pagina                    |
| ----------------------------- | ------------------------- |
| `/dashboard`                  | Inicio                    |
| `/dashboard/servicios`        | Servicios                 |
| `/dashboard/categorias`       | Categorias                |
| `/dashboard/citas`            | Citas                     |
| `/dashboard/horario`          | Horario                   |
| `/dashboard/tiempo-personal`  | Tiempo personal           |
| `/dashboard/perfil`           | Perfil del negocio        |
| `/dashboard/calendario`       | Sincronizacion calendario |
| `/dashboard/banco`            | Datos bancarios           |

### Reservacion publica (`/:slug/*`)

| Ruta                  | Pagina                |
| --------------------- | --------------------- |
| `/:slug`              | Pagina del negocio    |
| `/:slug/servicios`    | Seleccionar servicios |
| `/:slug/horario`      | Seleccionar horario   |
| `/:slug/confirmar`    | Confirmar reservacion |

### Otras

| Ruta        | Pagina           |
| ----------- | ---------------- |
| `/`         | Pagina principal |
| `/login`    | Iniciar sesion   |
| `/registro` | Registro         |

## Variables de entorno

| Variable              | Descripcion               | Default                          |
| --------------------- | ------------------------- | -------------------------------- |
| `VITE_API_BASE_URL`   | URL base del API backend  | `http://localhost:8080/api/v1`   |
