import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import clientsRoutes from "./routes/clients.js";
import passwordRecoveryRoutes from "./routes/passwordRecovery.js";

const app = express();
// Middlewares
app.use(cors({
  origin: 'http://localhost:4000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/passwordRecovery", passwordRecoveryRoutes);
app.use("/api/clients", clientsRoutes);


export default app;
