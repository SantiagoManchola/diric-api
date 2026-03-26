// =============================================
// DIRIC - Database Seed
// =============================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.country.deleteMany();
  await prisma.professorAcademicUnit.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Roles
  const roles = await Promise.all([
    prisma.role.create({
      data: { id: 1, name: "admin", description: "Administrador del sistema" },
    }),
    prisma.role.create({
      data: {
        id: 2,
        name: "academicUnit",
        description: "Jefe de unidad academica",
      },
    }),
    prisma.role.create({
      data: { id: 3, name: "profesor", description: "Profesor investigador" },
    }),
  ]);
  console.log(`  ✓ ${roles.length} roles created`);

  // Users
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 1,
        name: "Administrador DIRIC-GUESS",
        phone: "+57 300 100 0001",
        email: "admin@diric.edu",
        password: hash("admin123"),
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 2,
        name: "Ciencias, Ingenieria e Innovacion",
        phone: "+57 300 200 0002",
        email: "ua.ingenieria@diric.edu",
        password: hash("ua123"),
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 3,
        name: "Derecho, Administracion y Economia",
        phone: "+57 300 200 0003",
        email: "ua.derecho@diric.edu",
        password: hash("ua123"),
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 4,
        name: "Humanidades, Artes, Filosofia y Educacion",
        phone: "+57 300 200 0004",
        email: "ua.humanidades@diric.edu",
        password: hash("ua123"),
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 5,
        name: "Carlos Garcia",
        phone: "+57 300 300 0005",
        email: "profesor.garcia@diric.edu",
        password: hash("prof123"),
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 6,
        name: "Maria Lopez",
        phone: "+57 300 300 0006",
        email: "maria.lopez@diric.edu",
        password: hash("prof123"),
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 7,
        name: "Juan Martinez",
        phone: "+57 300 300 0007",
        email: "juan.martinez@diric.edu",
        password: hash("prof123"),
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 8,
        name: "Ana Torres",
        phone: "+57 300 300 0008",
        email: "ana.torres@diric.edu",
        password: hash("prof123"),
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        id: 9,
        name: "Pedro Ramirez",
        phone: "+57 300 300 0009",
        email: "pedro.ramirez@diric.edu",
        password: hash("prof123"),
        active: false,
      },
    }),
  ]);
  console.log(`  ✓ ${users.length} users created`);

  // User-role assignments
  await Promise.all([
    prisma.userRole.create({ data: { user_id: 1, role_id: 1 } }),
    prisma.userRole.create({ data: { user_id: 2, role_id: 2 } }),
    prisma.userRole.create({ data: { user_id: 3, role_id: 2 } }),
    prisma.userRole.create({ data: { user_id: 4, role_id: 2 } }),
    prisma.userRole.create({ data: { user_id: 5, role_id: 3 } }),
    prisma.userRole.create({ data: { user_id: 6, role_id: 3 } }),
    prisma.userRole.create({ data: { user_id: 7, role_id: 3 } }),
    prisma.userRole.create({ data: { user_id: 8, role_id: 3 } }),
    prisma.userRole.create({ data: { user_id: 9, role_id: 3 } }),
  ]);
  console.log("  ✓ User-role assignments created");

  // Professor-academic unit associations
  await Promise.all([
    prisma.professorAcademicUnit.create({
      data: { professor_id: 5, academic_unit_id: 2 },
    }),
    prisma.professorAcademicUnit.create({
      data: { professor_id: 6, academic_unit_id: 2 },
    }),
    prisma.professorAcademicUnit.create({
      data: { professor_id: 7, academic_unit_id: 3 },
    }),
    prisma.professorAcademicUnit.create({
      data: { professor_id: 8, academic_unit_id: 3 },
    }),
    prisma.professorAcademicUnit.create({
      data: { professor_id: 9, academic_unit_id: 4 },
    }),
  ]);
  console.log("  ✓ Professor-academic unit associations created");

  // Countries
  await Promise.all([
    prisma.country.create({ data: { id: 1, code: "CO", name: "Colombia" } }),
    prisma.country.create({ data: { id: 2, code: "MX", name: "Mexico" } }),
    prisma.country.create({ data: { id: 3, code: "AR", name: "Argentina" } }),
    prisma.country.create({ data: { id: 4, code: "CL", name: "Chile" } }),
    prisma.country.create({ data: { id: 5, code: "PE", name: "Peru" } }),
  ]);
  console.log("  ✓ 5 countries created");

  // Projects
  await Promise.all([
    prisma.project.create({
      data: {
        id: 1,
        country_id: 1,
        title: "Investigacion en IA Aplicada",
        description:
          "Proyecto de investigacion sobre inteligencia artificial aplicada a la educacion superior",
        status: "en_progreso",
        start_date: "2025-03-01",
        deadline: "2025-12-31",
      },
    }),
    prisma.project.create({
      data: {
        id: 2,
        country_id: 2,
        title: "Colaboracion Interuniversitaria LATAM",
        description:
          "Red de colaboracion entre universidades latinoamericanas para intercambio academico",
        status: "en_progreso",
        start_date: "2025-04-01",
        deadline: "2026-04-01",
      },
    }),
    prisma.project.create({
      data: {
        id: 3,
        country_id: 1,
        title: "Desarrollo Sostenible Urbano",
        description:
          "Estudio sobre practicas de desarrollo sostenible en ciudades colombianas",
        status: "planificado",
        start_date: "2025-06-01",
        deadline: "2026-06-01",
      },
    }),
    prisma.project.create({
      data: {
        id: 4,
        country_id: 3,
        title: "Biotecnologia y Salud Publica",
        description:
          "Investigacion conjunta en biotecnologia aplicada a problemas de salud publica",
        status: "completado",
        start_date: "2024-01-01",
        deadline: "2025-01-01",
        end_date: "2025-01-15",
      },
    }),
  ]);
  console.log("  ✓ 4 projects created");

  // Project assignments
  await Promise.all([
    prisma.projectAssignment.create({
      data: {
        id: 1,
        project_id: 1,
        user_id: 5,
        role_in_project: "Investigador principal",
      },
    }),
    prisma.projectAssignment.create({
      data: {
        id: 2,
        project_id: 1,
        user_id: 6,
        role_in_project: "Co-investigador",
      },
    }),
    prisma.projectAssignment.create({
      data: {
        id: 3,
        project_id: 2,
        user_id: 7,
        role_in_project: "Coordinador",
      },
    }),
    prisma.projectAssignment.create({
      data: {
        id: 4,
        project_id: 2,
        user_id: 8,
        role_in_project: "Investigador",
      },
    }),
    prisma.projectAssignment.create({
      data: { id: 5, project_id: 3, user_id: 5, role_in_project: "Asesor" },
    }),
    prisma.projectAssignment.create({
      data: {
        id: 6,
        project_id: 4,
        user_id: 8,
        role_in_project: "Investigador principal",
      },
    }),
    prisma.projectAssignment.create({
      data: { id: 7, project_id: 4, user_id: 9, role_in_project: "Asistente" },
    }),
  ]);
  console.log("  ✓ 7 project assignments created");

  // Events
  await Promise.all([
    prisma.event.create({
      data: {
        id: 1,
        project_id: 1,
        type: "mesa_trabajo",
        title: "Kickoff IA Aplicada",
        description: "Reunion de inicio del proyecto de IA",
        conclusions: "",
        start_datetime: new Date("2025-03-15T09:00:00Z"),
        end_datetime: new Date("2025-03-15T12:00:00Z"),
        created_by: 5,
        encargado_id: 5,
      },
    }),
    prisma.event.create({
      data: {
        id: 2,
        project_id: 1,
        type: "socializacion_interna",
        title: "Avance Semestral IA",
        description: "Presentacion de avances del primer semestre",
        conclusions: "",
        start_datetime: new Date("2025-07-01T14:00:00Z"),
        end_datetime: new Date("2025-07-01T17:00:00Z"),
        created_by: 5,
        encargado_id: 6,
      },
    }),
    prisma.event.create({
      data: {
        id: 3,
        project_id: 2,
        type: "socializacion_externa",
        title: "Foro LATAM Educacion",
        description: "Foro abierto sobre educacion en Latinoamerica",
        conclusions: "",
        start_datetime: new Date("2025-05-20T10:00:00Z"),
        end_datetime: new Date("2025-05-20T16:00:00Z"),
        created_by: 7,
        encargado_id: 7,
      },
    }),
    prisma.event.create({
      data: {
        id: 4,
        project_id: 3,
        type: "mesa_trabajo",
        title: "Planificacion Desarrollo Sostenible",
        description: "Mesa de trabajo para planificar metodologia",
        conclusions: "",
        start_datetime: new Date("2025-06-15T09:00:00Z"),
        end_datetime: new Date("2025-06-15T13:00:00Z"),
        created_by: 5,
        encargado_id: 5,
      },
    }),
    prisma.event.create({
      data: {
        id: 5,
        project_id: 4,
        type: "socializacion_interna",
        title: "Resultados Finales Biotecnologia",
        description: "Presentacion de resultados finales del proyecto",
        conclusions: "",
        start_datetime: new Date("2025-01-10T10:00:00Z"),
        end_datetime: new Date("2025-01-10T14:00:00Z"),
        created_by: 8,
        encargado_id: 8,
      },
    }),
    prisma.event.create({
      data: {
        id: 6,
        project_id: 2,
        type: "mesa_trabajo",
        title: "Revision Convenios LATAM",
        description: "Revision de convenios firmados con universidades",
        conclusions: "",
        start_datetime: new Date("2025-08-10T10:00:00Z"),
        end_datetime: new Date("2025-08-10T13:00:00Z"),
        created_by: 7,
        encargado_id: 8,
      },
    }),
  ]);
  console.log("  ✓ 6 events created");

  // Event attendees
  await Promise.all([
    prisma.eventAttendee.create({
      data: { id: 1, event_id: 1, user_id: 5, status: "attended", note: "" },
    }),
    prisma.eventAttendee.create({
      data: { id: 2, event_id: 1, user_id: 6, status: "attended", note: "" },
    }),
    prisma.eventAttendee.create({
      data: { id: 3, event_id: 2, user_id: 5, status: "attended", note: "" },
    }),
    prisma.eventAttendee.create({
      data: {
        id: 4,
        event_id: 2,
        user_id: 6,
        status: "attended",
        note: "Llego 15 min tarde",
      },
    }),
    prisma.eventAttendee.create({
      data: { id: 5, event_id: 3, user_id: 7, status: "attended", note: "" },
    }),
    prisma.eventAttendee.create({
      data: {
        id: 6,
        event_id: 3,
        user_id: 8,
        status: "absent",
        note: "No pudo asistir",
      },
    }),
    prisma.eventAttendee.create({
      data: { id: 7, event_id: 4, user_id: 5, status: "attended", note: "" },
    }),
    prisma.eventAttendee.create({
      data: { id: 8, event_id: 5, user_id: 8, status: "attended", note: "" },
    }),
    prisma.eventAttendee.create({
      data: {
        id: 9,
        event_id: 5,
        user_id: 9,
        status: "excused",
        note: "Enfermedad",
      },
    }),
    prisma.eventAttendee.create({
      data: { id: 10, event_id: 6, user_id: 7, status: "attended", note: "" },
    }),
    prisma.eventAttendee.create({
      data: { id: 11, event_id: 6, user_id: 8, status: "attended", note: "" },
    }),
  ]);
  console.log("  ✓ 11 event attendees created");

  // Reset sequences
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT MAX(id) FROM roles))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('countries', 'id'), (SELECT MAX(id) FROM countries))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('projects', 'id'), (SELECT MAX(id) FROM projects))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('project_assignments', 'id'), (SELECT MAX(id) FROM project_assignments))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('events', 'id'), (SELECT MAX(id) FROM events))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('event_attendees', 'id'), (SELECT MAX(id) FROM event_attendees))`;

  console.log("\n✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
