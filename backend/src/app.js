import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import customerRoutes         from "./routes/customers.js";
import passwordRecoveryRoutes from "./routes/passwordRecovery.js";
import cartRoutes from "./routes/cart.js";

import contactRoutes from "./routes/contact.js";
import catalogRoutes from "./routes/catalogo.js";
import productRoutes from "./routes/products.js";
import profileRoutes from "./routes/profile.js";



const app = express();
import orderRoutes from "./routes/orderRoutes.js";

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/orders', orderRoutes);

app.use("/api/customers",        customerRoutes);
app.use("/api/password-recovery", passwordRecoveryRoutes);
app.use('/api/cart', cartRoutes);






















app.use("/api/contact", contactRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/profile", profileRoutes);



export default app;
