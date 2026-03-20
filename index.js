import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./backend/db.js";
import passport from "./backend/passport.js";
import healthRoutes from "./backend/routes/health.js";
import userRoutes from "./backend/routes/users.js";
import academicRoutes from "./backend/routes/academic.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/academic", academicRoutes);

app.use(express.static(path.join(__dirname, "client/build")));

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });