import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./modules/auth/auth.routes";
import countriesRoutes from "./modules/countries/countries.routes";
import academicUnitsRoutes from "./modules/academic-units/academic-units.routes";
import professorsRoutes from "./modules/professors/professors.routes";
import projectsRoutes from "./modules/projects/projects.routes";
import eventsRoutes from "./modules/events/events.routes";

const app = express();

// Global middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/academic-units", academicUnitsRoutes);
app.use("/api/professors", professorsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/events", eventsRoutes);

// Error handling
app.use(errorHandler);

export default app;
