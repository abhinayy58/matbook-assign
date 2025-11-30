const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/admin.routes");
const publicRoutes = require("./routes/public.routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/admin", adminRoutes);
app.use("/api/forms", publicRoutes);


const distPath = path.join(__dirname, "../dist"); 
app.use(express.static(distPath));

app.use((_req, res, next) => {
  if (!_req.originalUrl.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    next();
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
 
