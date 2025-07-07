// backend/index.js
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './database.js';
import app       from './app.js';

const PORT = process.env.PORT || 4000;

(async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  );
})();
