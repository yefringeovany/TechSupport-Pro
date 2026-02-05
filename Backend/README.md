# TechSupport Pro - Backend API

Sistema de gestion de tickets de soporte tecnico con manejo de SLA para clientes VIP y normales.

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Arquitectura](#arquitectura)
- [Tecnologias](#tecnologias)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecucion](#ejecucion)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Reglas de Negocio](#reglas-de-negocio)
- [Seguridad](#seguridad)
- [Suposiciones](#suposiciones)

---

## Descripcion

TechSupport Pro es un sistema de gestion de tickets que permite:

- Gestion completa de tickets (CRUD) con soft delete
- Manejo de SLA diferenciado: clientes VIP (2 horas) y normales (24 horas)
- Escalamiento automatico de tickets VIP no atendidos
- Sistema de autenticacion con JWT y refresh tokens
- Control de acceso basado en roles (RBAC): Admin, Supervisor, Agente
- Logging estructurado con almacenamiento en MongoDB

---

## Arquitectura

El proyecto sigue una arquitectura modular por capas:

```
src/
|-- config/          # Configuracion de bases de datos y variables de entorno
|-- cron/            # Tareas programadas (escalamiento automatico)
|-- middlewares/     # Middlewares de autenticacion y autorizacion
|-- modules/         # Modulos de negocio
|   |-- agents/      # Gestion de agentes
|   |-- auth/        # Autenticacion y usuarios
|   |-- clients/     # Gestion de clientes
|   |-- tickets/     # Gestion de tickets
|-- types/           # Definiciones de tipos TypeScript
|-- utils/           # Utilidades (logger)
```

### Flujo de Datos

```
Request -> Middleware Auth -> Controller -> Service -> Prisma/DB -> Response
```

---

## Tecnologias

- **Runtime**: Node.js 20
- **Lenguaje**: TypeScript 5.x
- **Framework**: Express 5.x
- **ORM**: Prisma
- **Bases de Datos**:
  - PostgreSQL 16 (datos transaccionales)
  - MongoDB 7.0 (logs y reportes)
- **Autenticacion**: JWT (jsonwebtoken)
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Contenedores**: Docker y Docker Compose

---

## Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 20+ (solo para desarrollo local)
- npm o yarn

---

## Instalacion

### Opcion 1: Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd Backend

# Iniciar todos los servicios
docker-compose up --build
```

El sistema estara disponible en `http://localhost:3000`

### Opcion 2: Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar solo las bases de datos con Docker
docker-compose up postgres mongodb -d

# Ejecutar migraciones de Prisma
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate

# Ejecutar seed (opcional)
npx prisma db seed

# Iniciar en modo desarrollo
npm run dev
```

---

## Variables de Entorno

Crear un archivo `.env` en la raiz del proyecto:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/techsupport_db?schema=public"

# Base de datos MongoDB
MONGODB_URI="mongodb://mongo:mongo123@localhost:27017/techsupport_logs?authSource=admin"

# JWT Secrets (usar valores seguros en produccion)
JWT_SECRET=tu_secret_jwt_super_seguro_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_aqui

# Puerto del servidor (opcional, default: 3000)
PORT=3000

# Nivel de log (opcional, default: info)
LOG_LEVEL=info
```

### Variables en Docker Compose

Las variables para Docker ya estan configuradas en `docker-compose.yml`. Para produccion, usar un archivo `.env` o secretos de Docker.

---

## Ejecucion

### Comandos Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar version compilada
npm start

# Ejecutar con Docker
docker-compose up

# Detener contenedores
docker-compose down

# Ver logs de la aplicacion
docker-compose logs -f app
```

---

## Estructura del Proyecto

```
Backend/
|-- prisma/
|   |-- schema.prisma        # Esquema de la base de datos
|   |-- seed.ts              # Datos iniciales
|   |-- migrations/          # Migraciones de PostgreSQL
|-- src/
|   |-- index.ts             # Punto de entrada de la aplicacion
|   |-- config/
|   |   |-- database.config.ts  # Conexion a bases de datos
|   |   |-- env.ts              # Variables de entorno
|   |   |-- prisma.ts           # Cliente Prisma
|   |-- cron/
|   |   |-- tickets.cron.ts     # Escalamiento automatico de tickets
|   |-- middlewares/
|   |   |-- verifyToken.ts      # Verificacion de JWT
|   |   |-- authorizeRoles.ts   # Autorizacion por roles
|   |-- modules/
|   |   |-- agents/             # CRUD de agentes
|   |   |-- auth/               # Login, registro, logout, refresh
|   |   |-- clients/            # CRUD de clientes
|   |   |-- tickets/            # CRUD de tickets con reglas de negocio
|   |-- types/
|   |   |-- jwt.ts              # Tipos para JWT
|   |-- utils/
|       |-- logger.ts           # Logger con Winston y MongoDB
|-- docker-compose.yml
|-- Dockerfile
|-- package.json
|-- tsconfig.json
```

---

## Endpoints de la API

### Autenticacion (Publico)

| Metodo | Endpoint           | Descripcion              | Autenticacion |
|--------|-------------------|--------------------------|---------------|
| POST   | /api/auth/login   | Iniciar sesion           | No            |
| POST   | /api/auth/refresh | Renovar access token     | No            |

### Autenticacion (Protegido)

| Metodo | Endpoint            | Descripcion              | Rol Requerido |
|--------|---------------------|--------------------------|---------------|
| POST   | /api/auth/register  | Registrar usuario        | ADMIN         |
| POST   | /api/auth/logout    | Cerrar sesion            | Autenticado   |

### Tickets

| Metodo | Endpoint                  | Descripcion                | Rol Requerido            |
|--------|---------------------------|----------------------------|--------------------------|
| GET    | /api/tickets              | Listar tickets (paginado)  | ADMIN, SUPERVISOR, AGENTE|
| GET    | /api/tickets/:id          | Obtener ticket por ID      | ADMIN, SUPERVISOR, AGENTE|
| POST   | /api/tickets              | Crear ticket               | ADMIN, SUPERVISOR, AGENTE|
| PUT    | /api/tickets/:id          | Actualizar ticket          | ADMIN, SUPERVISOR, AGENTE|
| DELETE | /api/tickets/:id          | Eliminar ticket (soft)     | ADMIN, SUPERVISOR        |
| PUT    | /api/tickets/:id/asignar  | Asignar agente a ticket    | ADMIN, SUPERVISOR        |
| PUT    | /api/tickets/:id/resolver | Resolver ticket            | ADMIN, SUPERVISOR, AGENTE|

#### Parametros de consulta para GET /api/tickets

- `estado`: ABIERTO, EN_PROGRESO, RESUELTO, CERRADO, ESCALADO
- `prioridad`: BAJA, MEDIA, ALTA, URGENTE
- `clienteId`: ID del cliente
- `desde`: Fecha inicio (YYYY-MM-DD)
- `hasta`: Fecha fin (YYYY-MM-DD)
- `page`: Numero de pagina (default: 1)
- `limit`: Resultados por pagina (default: 10)

### Clientes

| Metodo | Endpoint            | Descripcion           | Rol Requerido            |
|--------|---------------------|-----------------------|--------------------------|
| GET    | /api/clientes       | Listar clientes       | ADMIN, SUPERVISOR, AGENTE|
| GET    | /api/clientes/:id   | Obtener cliente       | ADMIN, SUPERVISOR, AGENTE|
| POST   | /api/clientes       | Crear cliente         | ADMIN, SUPERVISOR        |
| PUT    | /api/clientes/:id   | Actualizar cliente    | ADMIN, SUPERVISOR        |
| DELETE | /api/clientes/:id   | Eliminar cliente      | ADMIN                    |

### Agentes

| Metodo | Endpoint           | Descripcion          | Rol Requerido     |
|--------|--------------------|----------------------|-------------------|
| GET    | /api/agentes       | Listar agentes       | ADMIN, SUPERVISOR |
| GET    | /api/agentes/:id   | Obtener agente       | ADMIN, SUPERVISOR, AGENTE |
| POST   | /api/agentes       | Crear agente         | ADMIN             |
| PUT    | /api/agentes/:id   | Actualizar agente    | ADMIN, SUPERVISOR |
| DELETE | /api/agentes/:id   | Eliminar agente      | ADMIN             |

### Utilidades

| Metodo | Endpoint      | Descripcion          | Autenticacion |
|--------|---------------|----------------------|---------------|
| GET    | /api/health   | Estado del servidor  | No            |

---

## Reglas de Negocio

### Tickets

1. **Prioridad Automatica**: Los tickets de clientes VIP se crean con prioridad ALTA, los normales con MEDIA.

2. **Escalamiento Automatico (Cron cada 5 minutos)**:
   - Tickets VIP sin atender por mas de 2 horas: estado cambia a ESCALADO
   - Tickets normales sin atender por mas de 24 horas: se notifica al supervisor (log)

3. **Restriccion de Agentes**: Los tickets ESCALADOS solo pueden ser atendidos por agentes de nivel 2 o superior.

4. **Maquina de Estados**:
   - ABIERTO -> EN_PROGRESO
   - EN_PROGRESO -> RESUELTO
   - RESUELTO -> CERRADO
   - ESCALADO -> EN_PROGRESO

5. **Tiempo de Resolucion**: Al resolver un ticket, se calcula y almacena automaticamente el tiempo transcurrido desde su creacion.

### Usuarios y Roles

| Rol        | Permisos                                                    |
|------------|-------------------------------------------------------------|
| ADMIN      | Acceso total, gestiona usuarios, agentes y configuracion   |
| SUPERVISOR | Ve todos los tickets, puede reasignar, ve reportes basicos |
| AGENTE     | Solo puede ver y gestionar tickets asignados a el          |

---

## Seguridad

### Medidas Implementadas

1. **Rate Limiting**: Maximo 100 requests por minuto por IP
2. **Timeout**: Las peticiones expiran despues de 30 segundos
3. **Helmet**: Headers de seguridad HTTP configurados
4. **CORS**: Configurado para origenes permitidos
5. **Validacion de Inputs**: Todos los endpoints validan los datos de entrada
6. **JWT**: Tokens de acceso (15 min) y refresh tokens (7 dias)
7. **Password Hashing**: bcrypt con salt rounds de 10
8. **Soft Delete**: Los tickets no se eliminan fisicamente

### Headers de Seguridad

- `X-API-Version`: Version de la API
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- Otros headers via Helmet

---

## Suposiciones

1. **Seed de Datos**: Se asume que existe al menos un usuario ADMIN para poder crear otros usuarios. Ejecutar `npx prisma db seed` para crear datos iniciales.

2. **Timezone**: El sistema usa UTC para todas las operaciones de fecha/hora.

3. **Notificaciones**: Las notificaciones al supervisor se simulan mediante logs. En produccion se integraria con un servicio de correo o notificaciones push.

4. **Nivel de Agente**: Los niveles van de 1 (junior) a 3 (senior). Solo nivel 2+ puede atender tickets escalados.

5. **Soft Delete**: Solo los tickets implementan soft delete. Clientes y agentes se eliminan fisicamente (considerar implementar soft delete si es necesario).

---

## Coleccion de Postman

La coleccion de Postman se encuentra en el archivo `TechSupport-Pro.postman_collection.json` en la raiz del proyecto. Incluye:

- Todos los endpoints documentados
- Variables de entorno preconfiguradas
- Ejemplos de requests y responses
- Scripts de pre-request para manejar tokens automaticamente

### Importar en Postman

1. Abrir Postman
2. Click en "Import"
3. Seleccionar el archivo `TechSupport-Pro.postman_collection.json`
4. La coleccion incluye variables de entorno que se actualizan automaticamente

---

## Librerias Utilizadas

| Libreria          | Proposito                                    |
|-------------------|----------------------------------------------|
| express           | Framework web                                |
| @prisma/client    | ORM para PostgreSQL                          |
| mongoose          | ODM para MongoDB                             |
| jsonwebtoken      | Generacion y verificacion de JWT             |
| bcrypt            | Hashing de contrasenas                       |
| helmet            | Headers de seguridad HTTP                    |
| cors              | Manejo de CORS                               |
| express-rate-limit| Rate limiting                                |
| express-validator | Validacion de inputs                         |
| node-cron         | Tareas programadas                           |
| winston           | Logging estructurado                         |
| compression       | Compresion de respuestas                     |
| dotenv            | Variables de entorno                         |

---

## Autor

Desarrollado como prueba tecnica para posicion Backend Developer Node.js
