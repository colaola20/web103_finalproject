import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { fileURLToPath } from "url";

import indexRouter from "./routes/index.js";

var app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(cors({ origin: "https://codepathweb103.mydomainjpr.uk" }));

const globalApiLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Something went wrong on the server, please try again later",
  },
});

app.use("/api/", globalApiLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());

app.use(hpp());

app.disable("x-powered-by");

app.use("/api/data", indexRouter);

app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

export default app;
