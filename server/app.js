import express from "express";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Importing models registers them with Mongoose
import "./models/Office.js";
import "./models/Service.js";
import "./models/Counter.js";
import "./models/User.js";
import "./models/Token.js";
import "./models/TokenSequence.js";
import authRoutes from "./routes/authRoutes.js";
import officeRoutes from "./routes/officeRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import counterRoutes from "./routes/counterRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "SahiSewaQ" });
});

app.use("/api/auth", authRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/counters", counterRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;