// backend/src/config.js
import dotenv from "dotenv";
dotenv.config();


export const config = {
  db: {
    URI: process.env.MONGO_URI,
  },
  server: {
    port: process.env.PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,  
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',  
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret:   process.env.PAYPAL_CLIENT_SECRET
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
};
