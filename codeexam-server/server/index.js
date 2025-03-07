const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Error Handler
app.use(errorHandler);

// Test DB Connection
db.authenticate()
  .then(() => {
    console.log('MySQL connection established successfully');
    
    // Sync models with database
    return db.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });