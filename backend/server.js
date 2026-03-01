import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import userRouter from "./routes/userRoute.js";
import taskRouter from "./routes/taskRoute.js";
import forgotPasswordRouter from "./routes/forgotPassword.js";
import groupRouter from "./routes/groupRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app config
dotenv.config();
const app = express();
const port = process.env.PORT || 8001;

// middlewares
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// db config
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error("DB Error:", err));

// health check
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);
app.use("/api/forgotPassword", forgotPasswordRouter);
app.use("/api/group", groupRouter);

// listen
app.listen(port, () => console.log("Listening on localhost:" + port));
