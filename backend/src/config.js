import dotenv from 'dotenv';
dotenv.config();        

export const config = {
  server: 
  { 
    port: process.env.PORT || 4000 
  },
  db:     
  { uri:  
    process.env.MONGO_URI 
  },   
  jwt:    
  {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '1d'
  }
};
