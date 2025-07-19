// backend/app.js
import express from 'express';
import cors    from 'cors';
import cookieParser from 'cookie-parser';

import customerRoutes         from './src/routes/customers.js';
import passwordRecoveryRoutes from './src/routes/passwordRecovery.js';
import orderRoutes            from './src/routes/order.js';
import customOrderRoutes      from './src/routes/customOrder.js';
import contactRoutes          from './src/routes/contact.js';
import catalogRoutes          from './src/routes/catalogo.js';
import productRoutes          from './src/routes/products.js';
import profileRoutes          from './src/routes/profile.js';
import adminAuthRoutes        from './src/routes/adminAuth.js';
import logoutRoutes           from './src/routes/logout.js'


const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Mount your routes
app.use('/api/customers',       customerRoutes);
app.use('/api/password-recovery', passwordRecoveryRoutes);
app.use('/api/orders',          orderRoutes);
app.use('/api/custom-orders',   customOrderRoutes);
app.use('/api/contact',         contactRoutes);
app.use('/api/catalog',         catalogRoutes);
app.use('/api/products',        productRoutes);
app.use('/api/profile',         profileRoutes);
app.use('/api/admins',          adminAuthRoutes);
app.use('/api/logout',          logoutRoutes);



export default app;
