# DIRIC API

API REST para el sistema de gestión académica DIRIC-GUESS.

## Stack tecnológico

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Prisma
- **Base de datos:** PostgreSQL (Supabase - nube)
- **Autenticación:** JWT (Bearer token)
- **Validación:** Zod

## Configuración inicial

### 1. Crear base de datos en Supabase (gratuito)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (selecciona una región cercana)
3. Ve a **Settings → Database → Connection string**
4. Copia la **URI** (modo Transaction/Session) y la **Direct connection**

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
DATABASE_URL="postgresql://postgres.[TU-PROYECTO]:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[TU-PROYECTO]:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="un-secreto-seguro-de-al-menos-32-caracteres-aqui"
```

### 3. Instalar dependencias y configurar DB

```bash
npm install
npx prisma db push    # Crear tablas en Supabase
npm run db:seed        # Poblar datos iniciales
```

### 4. Iniciar el servidor

```bash
npm run dev            # Modo desarrollo (hot reload)
```

El API estará disponible en `http://localhost:3001`

### Documentacion Swagger

- UI interactiva: `http://localhost:3001/api/docs`
- Especificacion OpenAPI (JSON): `http://localhost:3001/api/docs.json`

## Endpoints

### Auth

| Método | Ruta                | Descripción           | Auth |
| ------ | ------------------- | --------------------- | ---- |
| POST   | `/api/auth/login`   | Iniciar sesión        | No   |
| POST   | `/api/auth/logout`  | Cerrar sesión         | Sí   |
| GET    | `/api/auth/session` | Obtener sesión actual | Sí   |

### Países (solo Admin)

| Método | Ruta                 | Descripción              |
| ------ | -------------------- | ------------------------ |
| GET    | `/api/countries`     | Listar países (?search=) |
| GET    | `/api/countries/:id` | Detalle con proyectos    |
| POST   | `/api/countries`     | Crear país               |
| PUT    | `/api/countries/:id` | Actualizar país          |
| DELETE | `/api/countries/:id` | Eliminar país            |

### Unidades Académicas (solo Admin)

| Método | Ruta                                           | Descripción            |
| ------ | ---------------------------------------------- | ---------------------- |
| GET    | `/api/academic-units`                          | Listar (?search=)      |
| GET    | `/api/academic-units/:id`                      | Detalle con profesores |
| POST   | `/api/academic-units`                          | Crear                  |
| PUT    | `/api/academic-units/:id`                      | Actualizar             |
| DELETE | `/api/academic-units/:id`                      | Eliminar               |
| POST   | `/api/academic-units/:id/professors`           | Asociar profesor       |
| DELETE | `/api/academic-units/:auId/professors/:profId` | Desasociar profesor    |

### Profesores (Admin + Unidad Académica)

| Método | Ruta                  | Descripción       |
| ------ | --------------------- | ----------------- |
| GET    | `/api/professors`     | Listar (?search=) |
| GET    | `/api/professors/:id` | Detalle completo  |
| POST   | `/api/professors`     | Crear             |
| PUT    | `/api/professors/:id` | Actualizar        |
| DELETE | `/api/professors/:id` | Eliminar          |

### Proyectos (todos los roles)

| Método | Ruta                                  | Descripción         | Roles     |
| ------ | ------------------------------------- | ------------------- | --------- |
| GET    | `/api/projects`                       | Listar (?search=)   | Todos     |
| GET    | `/api/projects/:id`                   | Detalle completo    | Todos     |
| POST   | `/api/projects`                       | Crear               | Admin, UA |
| PUT    | `/api/projects/:id`                   | Actualizar          | Todos     |
| DELETE | `/api/projects/:id`                   | Eliminar            | Admin, UA |
| POST   | `/api/projects/:id/assignments`       | Asignar profesor    | Admin, UA |
| DELETE | `/api/projects/:pId/assignments/:aId` | Eliminar asignación | Admin, UA |

### Eventos (todos los roles)

| Método | Ruta                              | Descripción           | Roles     |
| ------ | --------------------------------- | --------------------- | --------- |
| GET    | `/api/events`                     | Listar (?search=)     | Todos     |
| GET    | `/api/events/:id`                 | Detalle completo      | Todos     |
| POST   | `/api/events`                     | Crear                 | Todos     |
| PUT    | `/api/events/:id`                 | Actualizar            | Todos     |
| DELETE | `/api/events/:id`                 | Eliminar              | Admin, UA |
| POST   | `/api/events/:id/attendees`       | Agregar asistente     | Todos     |
| PATCH  | `/api/events/:eId/attendees/:aId` | Actualizar asistencia | Todos     |
| DELETE | `/api/events/:eId/attendees/:aId` | Eliminar asistente    | Todos     |

## Usuarios de prueba

| Rol              | Email                     | Password |
| ---------------- | ------------------------- | -------- |
| Admin            | admin@diric.edu           | admin123 |
| Unidad Académica | ua.ingenieria@diric.edu   | ua123    |
| Profesor         | profesor.garcia@diric.edu | prof123  |

## Autenticación

Todas las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene del endpoint `/api/auth/login`.

## Estructura del proyecto

```
src/
├── config/env.ts              # Variables de entorno (Zod)
├── lib/prisma.ts              # Cliente Prisma singleton
├── middleware/
│   ├── auth.ts                # JWT auth + autorización por rol
│   ├── errorHandler.ts        # Manejo global de errores
│   └── validate.ts            # Validación con Zod
├── modules/
│   ├── auth/                  # Login, logout, session
│   ├── countries/             # CRUD países
│   ├── academic-units/        # CRUD unidades académicas
│   ├── professors/            # CRUD profesores
│   ├── projects/              # CRUD proyectos + asignaciones
│   └── events/                # CRUD eventos + asistentes
├── app.ts                     # Configuración Express
└── server.ts                  # Entry point
```

## Comandos útiles

```bash
npm run dev              # Desarrollo con hot reload
npm run build            # Compilar TypeScript
npm start                # Producción
npm run db:generate      # Regenerar Prisma Client
npm run db:push          # Sincronizar schema → DB
npm run db:migrate       # Crear migración
npm run db:seed          # Poblar datos
npm run db:studio        # GUI de Prisma para la DB
```
