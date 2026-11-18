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

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "SahiSewaQ" });
});

// Day 3+ routes will be added here

app.use(notFound);
app.use(errorHandler);

export default app;