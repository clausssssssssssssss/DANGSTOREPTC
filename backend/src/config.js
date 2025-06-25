// backend/src/config.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  db: {
    URI: process.env.DB_URI,
  },
  server: {
    port: process.env.PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,  
    expiresIn: process.env.JWT_EXPIRES_IN,  
  },
    email: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.APP_PASSWORD_EMAIL,
  },
  paypal: {
    clientId: process.env.PAYPAL_API_CLIENT_ID,
    secret:   process.env.PAYPAL_API_SECRET,
  },
};
