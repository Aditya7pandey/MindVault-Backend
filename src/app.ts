import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import contentRoutes from "./routes/content.route.js";
import shareRoutes from "./routes/share.route.js";
import cookieParser from "cookie-parser";
import searchRoutes from "./routes/search.route.js";
import cors from "cors";

const app = express();
dotenv.config();

const clientUrl = process.env.CLIENT_URL;

app.use(
  cors({
    // origin: "http://localhost:5173", // Explicit origin (fixed from last step)
    origin: [
      "http://localhost:5173",
      "https://mindvaultio.vercel.app"
    ],
    credentials: true, // THIS IS THE MISSING PIECE
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/share", shareRoutes);
app.use("/api/v1/search", searchRoutes);

export default app;
