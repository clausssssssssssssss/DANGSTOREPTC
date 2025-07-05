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
    expiresIn: process.env.JWT_EXPIRES_IN,  
  },
    email: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.APP_PASSWORD_EMAIL,
  },
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret:   process.env.PAYPAL_CLIENT_SECRET
  },
};
