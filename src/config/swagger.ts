import swaggerJSDoc, { type Options } from "swagger-jsdoc";
import { env } from "./env";

const options: Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "DIRIC API",
      version: "1.0.0",
      description: "Documentacion OpenAPI para el sistema de gestion academica DIRIC.",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: `${env.NODE_ENV} server`,
      },
    ],
    tags: [
      { name: "Health", description: "Monitoreo de estado de la API" },
      { name: "Auth", description: "Autenticacion y sesion" },
      { name: "Countries", description: "CRUD de paises" },
      {
        name: "Academic Units",
        description: "CRUD de unidades academicas y asociaciones",
      },
      { name: "Professors", description: "CRUD de profesores" },
      { name: "Projects", description: "CRUD de proyectos y asignaciones" },
      { name: "Events", description: "CRUD de eventos y asistentes" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Mensaje de error" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@diric.edu" },
            password: { type: "string", example: "admin123" },
          },
        },
        GenericObjectResponse: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Estado de la API",
          responses: {
            "200": {
              description: "OK",
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Iniciar sesion",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Sesion iniciada",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GenericObjectResponse" },
                },
              },
            },
            "401": {
              description: "Credenciales invalidas",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Cerrar sesion",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Sesion cerrada" },
            "401": { description: "No autenticado" },
          },
        },
      },
      "/api/auth/session": {
        get: {
          tags: ["Auth"],
          summary: "Obtener sesion actual",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Sesion actual" },
            "401": { description: "No autenticado" },
          },
        },
      },
      "/api/countries": {
        get: {
          tags: ["Countries"],
          summary: "Listar paises",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Filtro por nombre",
            },
          ],
          responses: {
            "200": { description: "Listado de paises" },
          },
        },
        post: {
          tags: ["Countries"],
          summary: "Crear pais",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "201": { description: "Pais creado" },
          },
        },
      },
      "/api/countries/{id}": {
        get: {
          tags: ["Countries"],
          summary: "Detalle de pais",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Detalle de pais" },
          },
        },
        put: {
          tags: ["Countries"],
          summary: "Actualizar pais",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "200": { description: "Pais actualizado" },
          },
        },
        delete: {
          tags: ["Countries"],
          summary: "Eliminar pais",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Pais eliminado" },
          },
        },
      },
      "/api/academic-units": {
        get: {
          tags: ["Academic Units"],
          summary: "Listar unidades academicas",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Listado de unidades" },
          },
        },
        post: {
          tags: ["Academic Units"],
          summary: "Crear unidad academica",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "201": { description: "Unidad creada" },
          },
        },
      },
      "/api/academic-units/{id}": {
        get: {
          tags: ["Academic Units"],
          summary: "Detalle de unidad academica",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Detalle de unidad" },
          },
        },
        put: {
          tags: ["Academic Units"],
          summary: "Actualizar unidad academica",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "200": { description: "Unidad actualizada" },
          },
        },
        delete: {
          tags: ["Academic Units"],
          summary: "Eliminar unidad academica",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Unidad eliminada" },
          },
        },
      },
      "/api/academic-units/{id}/professors": {
        post: {
          tags: ["Academic Units"],
          summary: "Asociar profesor a unidad academica",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "201": { description: "Profesor asociado" },
          },
        },
      },
      "/api/academic-units/{academicUnitId}/professors/{professorId}": {
        delete: {
          tags: ["Academic Units"],
          summary: "Desasociar profesor de unidad academica",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "academicUnitId",
              required: true,
              schema: { type: "integer" },
            },
            {
              in: "path",
              name: "professorId",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Profesor desasociado" },
          },
        },
      },
      "/api/professors": {
        get: {
          tags: ["Professors"],
          summary: "Listar profesores",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Listado de profesores" },
          },
        },
        post: {
          tags: ["Professors"],
          summary: "Crear profesor",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "201": { description: "Profesor creado" },
          },
        },
      },
      "/api/professors/{id}": {
        get: {
          tags: ["Professors"],
          summary: "Detalle de profesor",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Detalle de profesor" },
          },
        },
        put: {
          tags: ["Professors"],
          summary: "Actualizar profesor",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "200": { description: "Profesor actualizado" },
          },
        },
        delete: {
          tags: ["Professors"],
          summary: "Eliminar profesor",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Profesor eliminado" },
          },
        },
      },
      "/api/projects": {
        get: {
          tags: ["Projects"],
          summary: "Listar proyectos",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Listado de proyectos" },
          },
        },
        post: {
          tags: ["Projects"],
          summary: "Crear proyecto",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "201": { description: "Proyecto creado" },
          },
        },
      },
      "/api/projects/{id}": {
        get: {
          tags: ["Projects"],
          summary: "Detalle de proyecto",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Detalle de proyecto" },
          },
        },
        put: {
          tags: ["Projects"],
          summary: "Actualizar proyecto",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "200": { description: "Proyecto actualizado" },
          },
        },
        delete: {
          tags: ["Projects"],
          summary: "Eliminar proyecto",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Proyecto eliminado" },
          },
        },
      },
      "/api/projects/{id}/assignments": {
        post: {
          tags: ["Projects"],
          summary: "Asignar profesor a proyecto",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "201": { description: "Asignacion creada" },
          },
        },
      },
      "/api/projects/{projectId}/assignments/{assignmentId}": {
        delete: {
          tags: ["Projects"],
          summary: "Eliminar asignacion de proyecto",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "projectId",
              required: true,
              schema: { type: "integer" },
            },
            {
              in: "path",
              name: "assignmentId",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Asignacion eliminada" },
          },
        },
      },
      "/api/events": {
        get: {
          tags: ["Events"],
          summary: "Listar eventos",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Listado de eventos" },
          },
        },
        post: {
          tags: ["Events"],
          summary: "Crear evento",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "201": { description: "Evento creado" },
          },
        },
      },
      "/api/events/{id}": {
        get: {
          tags: ["Events"],
          summary: "Detalle de evento",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Detalle de evento" },
          },
        },
        put: {
          tags: ["Events"],
          summary: "Actualizar evento",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "200": { description: "Evento actualizado" },
          },
        },
        delete: {
          tags: ["Events"],
          summary: "Eliminar evento",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Evento eliminado" },
          },
        },
      },
      "/api/events/{id}/attendees": {
        post: {
          tags: ["Events"],
          summary: "Agregar asistente a evento",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "201": { description: "Asistente agregado" },
          },
        },
      },
      "/api/events/{eventId}/attendees/{attendeeId}": {
        patch: {
          tags: ["Events"],
          summary: "Actualizar asistencia de asistente",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "eventId",
              required: true,
              schema: { type: "integer" },
            },
            {
              in: "path",
              name: "attendeeId",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          responses: {
            "200": { description: "Asistencia actualizada" },
          },
        },
        delete: {
          tags: ["Events"],
          summary: "Eliminar asistente de evento",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "eventId",
              required: true,
              schema: { type: "integer" },
            },
            {
              in: "path",
              name: "attendeeId",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Asistente eliminado" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);