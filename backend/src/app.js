import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import customerRoutes         from "./routes/customers.js";
import passwordRecoveryRoutes from "./routes/passwordRecovery.js";
import cartRoutes from "./routes/cart.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/customers",        customerRoutes);
app.use("/api/password-recovery", passwordRecoveryRoutes);
app.use('/api/cart', cartRoutes);


export default app;
