import swaggerJSDoc, { type Options } from "swagger-jsdoc";
import { env } from "./env";

const options: Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "DIRIC API",
      version: "1.0.0",
      description:
        "Documentacion OpenAPI para el sistema de gestion academica DIRIC.",
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
      {
        name: "Event Images",
        description:
          "Carga y gestion de imagenes de eventos (almacenadas en R2)",
      },
      {
        name: "Event PDFs",
        description: "Historial de PDFs generados automaticamente por evento",
      },
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
            email: {
              type: "string",
              format: "email",
              example: "admin@diric.edu",
            },
            password: { type: "string", example: "admin123" },
          },
        },
        GenericObjectResponse: {
          type: "object",
          additionalProperties: true,
        },
        EventBody: {
          type: "object",
          required: [
            "project_id",
            "type",
            "title",
            "description",
            "start_datetime",
            "end_datetime",
            "encargado_id",
          ],
          properties: {
            project_id: { type: "integer", example: 1 },
            type: {
              type: "string",
              enum: [
                "mesa_trabajo",
                "socializacion_externa",
                "socializacion_interna",
              ],
            },
            title: { type: "string", example: "Visita técnica a PalTolima" },
            location: { type: "string", example: "Armero Guayabal, Tolima" },
            description: {
              type: "string",
              example: "Descripcion general del evento",
            },
            entity_name: {
              type: "string",
              example: "PalTolima – Planta clasificadora Aguacate Hass",
            },
            entity_website: {
              type: "string",
              example: "https://www.paltolima.com",
            },
            entity_sector: {
              type: "string",
              enum: ["academia", "empresa", "estado", "sociedad"],
            },
            anfitrion_name: {
              type: "string",
              example: "Luis Fernando Castillo",
            },
            anfitrion_email: {
              type: "string",
              format: "email",
              example: "contacto@paltolima.com",
            },
            anfitrion_phone: { type: "string", example: "320 6750649" },
            anfitrion_role: { type: "string", example: "Presidente" },
            visitors: {
              type: "array",
              description: "Lista de visitantes de la universidad",
              items: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Helga Bermeo" },
                  phone: { type: "string", example: "315 1234567" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "hbermeo@unibague.edu.co",
                  },
                  role: { type: "string", example: "Investigadora" },
                },
              },
            },
            activities: {
              type: "array",
              description: "Actividades desarrolladas (actividad + detalle)",
              items: { $ref: "#/components/schemas/EventActivity" },
            },
            results: {
              type: "array",
              description: "Resultados obtenidos (tipo + detalle)",
              items: { $ref: "#/components/schemas/EventResult" },
            },
            commitments: {
              type: "array",
              description:
                "Compromisos adquiridos (detalle + responsable + fecha)",
              items: { $ref: "#/components/schemas/EventCommitment" },
            },
            visit_purpose: {
              type: "string",
              example: "Atender requerimientos de mejora de la planta...",
            },
            visit_justification: {
              type: "string",
              example:
                "Oportunidad de consultoría e investigación contratada...",
            },
            conclusions: { type: "string", example: "" },
            start_datetime: {
              type: "string",
              format: "date-time",
              example: "2026-01-27T08:00:00Z",
            },
            end_datetime: {
              type: "string",
              format: "date-time",
              example: "2026-01-27T12:00:00Z",
            },
            encargado_id: { type: "integer", example: 2 },
          },
        },
        EventActivity: {
          type: "object",
          required: ["activity"],
          properties: {
            activity: {
              type: "string",
              example: "Recorrido por instalaciones",
            },
            detail: {
              type: "string",
              example: "Se visitaron las áreas de producción y clasificación",
            },
          },
        },
        EventResult: {
          type: "object",
          required: ["type"],
          properties: {
            type: {
              type: "string",
              example: "Consultoría",
              description:
                "Tipo de resultado (ej: Consultoría, Investigación, Extensión...)",
            },
            detail: {
              type: "string",
              example:
                "Oportunidad de consultoría para el proyecto de inversión",
            },
          },
        },
        EventCommitment: {
          type: "object",
          required: ["detail"],
          properties: {
            detail: {
              type: "string",
              example: "Envío de cotización por parte de Unibagué",
            },
            responsible: {
              type: "string",
              example: "Helga Bermeo",
            },
            date_text: {
              type: "string",
              example: "04/02/2026",
            },
          },
        },
        AcademicUnitRef: {
          type: "object",
          properties: {
            id: { type: "integer", example: 3 },
            name: { type: "string", example: "Ingeniería de Sistemas" },
          },
        },
        ProjectSummary: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            country_id: { type: "integer", example: 1 },
            title: { type: "string", example: "Consultoría PalTolima" },
            description: {
              type: "string",
              example: "Descripción del proyecto",
            },
            status: {
              type: "string",
              enum: ["planificado", "en_progreso", "completado", "cancelado"],
              example: "planificado",
            },
            start_date: { type: "string", example: "2026-01-01" },
            deadline: { type: "string", example: "2026-12-31" },
            end_date: { type: "string", nullable: true, example: null },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2026-01-01T00:00:00Z",
            },
            academic_units: {
              type: "array",
              description: "Unidades académicas asignadas al proyecto",
              items: { $ref: "#/components/schemas/AcademicUnitRef" },
            },
          },
        },
        ProjectDetail: {
          allOf: [
            { $ref: "#/components/schemas/ProjectSummary" },
            {
              type: "object",
              properties: {
                country: {
                  type: "object",
                  properties: {
                    id: { type: "integer", example: 1 },
                    code: { type: "string", example: "CO" },
                    name: { type: "string", example: "Colombia" },
                  },
                },
                assignments: {
                  type: "array",
                  description: "Asignaciones de usuarios al proyecto",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      project_id: { type: "integer", example: 1 },
                      user_id: { type: "integer", example: 5 },
                      role_in_project: {
                        type: "string",
                        example: "Investigador principal",
                      },
                      assigned_at: {
                        type: "string",
                        format: "date-time",
                      },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 5 },
                          name: { type: "string", example: "Carlos Pérez" },
                          email: {
                            type: "string",
                            format: "email",
                            example: "cperez@unibague.edu.co",
                          },
                          phone: { type: "string", example: "310 1234567" },
                          active: { type: "boolean", example: true },
                          created_at: {
                            type: "string",
                            format: "date-time",
                          },
                        },
                      },
                    },
                  },
                },
                events: {
                  type: "array",
                  description: "Eventos asociados al proyecto",
                  items: { type: "object", additionalProperties: true },
                },
              },
            },
          ],
        },
        EventImage: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            event_id: { type: "integer", example: 3 },
            r2_key: {
              type: "string",
              example: "events/3/images/1714000000000-0.jpg",
            },
            url: {
              type: "string",
              format: "uri",
              example:
                "https://pub-xxxx.r2.dev/events/3/images/1714000000000-0.jpg",
            },
            filename: { type: "string", example: "foto_planta.jpg" },
            mime_type: { type: "string", example: "image/jpeg" },
            order_idx: { type: "integer", example: 0 },
            uploaded_at: { type: "string", format: "date-time" },
          },
        },
        EventPdfVersion: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            event_id: { type: "integer", example: 3 },
            version: {
              type: "integer",
              example: 2,
              description:
                "Numero de version incremental. v1 = creacion, v2+ = ediciones.",
            },
            r2_key: {
              type: "string",
              example: "events/3/pdfs/v2-1714000000000.pdf",
            },
            url: {
              type: "string",
              format: "uri",
              example:
                "https://pub-xxxx.r2.dev/events/3/pdfs/v2-1714000000000.pdf",
            },
            generated_at: { type: "string", format: "date-time" },
          },
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
                  schema: {
                    $ref: "#/components/schemas/GenericObjectResponse",
                  },
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
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
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
            "200": { description: "Profesor actualizado" },
          },
        },
        delete: {
          tags: ["Professors"],
          summary: "Eliminar profesor",
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
            "200": { description: "Profesor eliminado" },
          },
        },
      },
      "/api/projects/by-academic-unit": {
        get: {
          tags: ["Projects"],
          summary: "Proyectos por unidad académica",
          description:
            "Retorna la cantidad de proyectos distintos asociados a cada unidad académica. Útil para gráficos de barras.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Listado con conteo de proyectos por unidad",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        academic_unit_id: { type: "integer", example: 3 },
                        academic_unit_name: {
                          type: "string",
                          example: "Ingeniería de Sistemas",
                        },
                        project_count: { type: "integer", example: 7 },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "No autenticado" },
          },
        },
      },
      "/api/projects": {
        get: {
          tags: ["Projects"],
          summary: "Listar proyectos",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Filtro por título o descripción",
            },
          ],
          responses: {
            "200": {
              description:
                "Listado de proyectos con unidades académicas asociadas",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ProjectSummary" },
                      },
                      total: { type: "integer", example: 10 },
                    },
                  },
                },
              },
            },
            "401": { description: "No autenticado" },
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
                schema: {
                  type: "object",
                  required: [
                    "country_id",
                    "title",
                    "description",
                    "start_date",
                    "deadline",
                  ],
                  properties: {
                    country_id: { type: "integer", example: 1 },
                    title: {
                      type: "string",
                      example: "Consultor\u00eda PalTolima",
                    },
                    description: {
                      type: "string",
                      example: "Descripci\u00f3n del proyecto",
                    },
                    status: {
                      type: "string",
                      enum: [
                        "planificado",
                        "en_progreso",
                        "completado",
                        "cancelado",
                      ],
                      default: "planificado",
                    },
                    start_date: { type: "string", example: "2026-01-01" },
                    deadline: { type: "string", example: "2026-12-31" },
                    end_date: { type: "string", nullable: true, example: null },
                    academic_unit_ids: {
                      type: "array",
                      description:
                        "IDs de unidades acad\u00e9micas a asignar al proyecto",
                      items: { type: "integer", example: 3 },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Proyecto creado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ProjectSummary" },
                },
              },
            },
            "400": { description: "Datos inv\u00e1lidos" },
            "401": { description: "No autenticado" },
            "404": { description: "Pa\u00eds no encontrado" },
          },
        },
      },
      "/api/projects/{id}": {
        get: {
          tags: ["Projects"],
          summary: "Detalle de proyecto",
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
            "200": {
              description:
                "Detalle completo del proyecto con asignaciones y unidades académicas",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ProjectDetail" },
                },
              },
            },
            "401": { description: "No autenticado" },
            "404": { description: "Proyecto no encontrado" },
          },
        },
        put: {
          tags: ["Projects"],
          summary: "Actualizar proyecto",
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
                schema: {
                  type: "object",
                  properties: {
                    country_id: { type: "integer", example: 1 },
                    title: {
                      type: "string",
                      example: "Consultor\u00eda PalTolima",
                    },
                    description: {
                      type: "string",
                      example: "Descripci\u00f3n del proyecto",
                    },
                    status: {
                      type: "string",
                      enum: [
                        "planificado",
                        "en_progreso",
                        "completado",
                        "cancelado",
                      ],
                    },
                    start_date: { type: "string", example: "2026-01-01" },
                    deadline: { type: "string", example: "2026-12-31" },
                    end_date: { type: "string", nullable: true, example: null },
                    academic_unit_ids: {
                      type: "array",
                      description:
                        "Reemplaza las unidades acad\u00e9micas asignadas. Si se env\u00eda vac\u00edo ([]) se eliminan todas.",
                      items: { type: "integer", example: 3 },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Proyecto actualizado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ProjectSummary" },
                },
              },
            },
            "400": { description: "Datos inv\u00e1lidos" },
            "401": { description: "No autenticado" },
            "404": { description: "Proyecto o pa\u00eds no encontrado" },
          },
        },
        delete: {
          tags: ["Projects"],
          summary: "Eliminar proyecto",
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
          parameters: [
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Filtro por titulo o descripcion",
            },
          ],
          responses: {
            "200": {
              description: "Listado de eventos con la ultima version de PDF",
            },
            "401": { description: "No autenticado" },
          },
        },
        post: {
          tags: ["Events"],
          summary: "Crear evento",
          description:
            "Crea el evento y genera automaticamente el PDF en Cloudflare R2.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventBody" },
              },
            },
          },
          responses: {
            "201": {
              description: "Evento creado. El PDF se genera en background.",
            },
            "400": { description: "Datos invalidos" },
            "401": { description: "No autenticado" },
          },
        },
      },
      "/api/events/{id}": {
        get: {
          tags: ["Events"],
          summary: "Detalle de evento",
          description:
            "Incluye imagenes cargadas e historial completo de versiones de PDF.",
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
            "200": { description: "Detalle de evento con imagenes y PDFs" },
            "404": { description: "Evento no encontrado" },
          },
        },
        put: {
          tags: ["Events"],
          summary: "Actualizar evento",
          description:
            "Actualiza el evento y genera automaticamente una nueva version de PDF.",
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
                schema: { $ref: "#/components/schemas/EventBody" },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Evento actualizado. Nueva version de PDF generada en background.",
            },
            "400": { description: "Datos invalidos" },
            "404": { description: "Evento no encontrado" },
          },
        },
        delete: {
          tags: ["Events"],
          summary: "Eliminar evento",
          description:
            "Elimina el evento junto con todas sus imagenes y PDFs en R2.",
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
            "200": { description: "Evento y todos sus assets eliminados" },
            "404": { description: "Evento no encontrado" },
          },
        },
      },
      "/api/events/{id}/attendees": {
        post: {
          tags: ["Events"],
          summary: "Agregar asistente a evento",
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
      "/api/events/{id}/images": {
        get: {
          tags: ["Event Images"],
          summary: "Listar imagenes del evento",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID del evento",
            },
          ],
          responses: {
            "200": {
              description: "Lista de imagenes ordenadas por order_idx",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/EventImage" },
                  },
                },
              },
            },
            "404": { description: "Evento no encontrado" },
          },
        },
        post: {
          tags: ["Event Images"],
          summary: "Subir imagenes al evento",
          description:
            "Acepta una o varias imagenes (JPEG o PNG, max 10 MB c/u, hasta 20 archivos). Se suben a Cloudflare R2 y se regenera el PDF automaticamente.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID del evento",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    images: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                      description: "Imagenes a subir (campo: images)",
                    },
                  },
                  required: ["images"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Imagenes subidas. PDF regenerado en background.",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/EventImage" },
                  },
                },
              },
            },
            "400": {
              description: "No se enviaron imagenes o formato invalido",
            },
            "404": { description: "Evento no encontrado" },
          },
        },
      },
      "/api/events/{id}/images/{imageId}": {
        delete: {
          tags: ["Event Images"],
          summary: "Eliminar imagen del evento",
          description:
            "Elimina la imagen de R2 y regenera el PDF automaticamente.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID del evento",
            },
            {
              in: "path",
              name: "imageId",
              required: true,
              schema: { type: "integer" },
              description: "ID de la imagen",
            },
          ],
          responses: {
            "200": {
              description: "Imagen eliminada. PDF regenerado en background.",
            },
            "404": { description: "Imagen o evento no encontrado" },
          },
        },
      },
      "/api/events/{id}/pdfs": {
        get: {
          tags: ["Event PDFs"],
          summary: "Historial de versiones de PDF del evento",
          description:
            "Retorna todas las versiones generadas del PDF EX-FO-10, ordenadas de mas reciente a mas antigua. Cada edicion del evento o cambio de imagenes genera una nueva version.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID del evento",
            },
          ],
          responses: {
            "200": {
              description: "Lista de versiones de PDF",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/EventPdfVersion" },
                  },
                },
              },
            },
            "404": { description: "Evento no encontrado" },
          },
        },
      },
      "/api/events/{id}/pdfs/latest": {
        get: {
          tags: ["Event PDFs"],
          summary: "Redirigir al PDF mas reciente del evento",
          description:
            "Responde con un redirect 302 a la URL publica del PDF mas reciente en R2. Util para abrirlo directamente desde el UI.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID del evento",
            },
          ],
          responses: {
            "302": {
              description: "Redirect a la URL del PDF en Cloudflare R2",
            },
            "404": { description: "Evento sin PDF generado aun" },
          },
        },
      },
      "/api/events/{id}/pdfs/regenerate": {
        post: {
          tags: ["Event PDFs"],
          summary: "Forzar regeneracion de PDF",
          description:
            "Genera manualmente una nueva version del PDF con el estado actual del evento e imagenes. Solo admin y academicUnit.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
              description: "ID del evento",
            },
          ],
          responses: {
            "200": {
              description: "Nueva version de PDF generada",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/EventPdfVersion" },
                },
              },
            },
            "403": { description: "Sin permiso (solo admin / academicUnit)" },
            "404": { description: "Evento no encontrado" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
