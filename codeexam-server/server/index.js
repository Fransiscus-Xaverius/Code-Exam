const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

//Routes
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problem');
const competitionRoutes = require('./routes/competition');
const frontendProblemRoutes = require('./routes/frontendProblem');
const frontendSubmissionRoutes = require('./routes/frontendSubmission');
const discussionRoutes = require('./routes/discussion');
const submissionRoutes = require('./routes/submission');
const discussionCommentsRoutes = require('./routes/discussionComments');
const manageUserRoutes = require('./routes/userRoutes');
const warningRoutes = require('./routes/warningRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const profileRoutes = require('./routes/profileRoutes')

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
app.use('/api/problems', problemRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/comments', discussionCommentsRoutes);
app.use('/api/frontend-problems', frontendProblemRoutes);
app.use('/api/frontend-submissions', frontendSubmissionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/manage/users', manageUserRoutes);
app.use('/api/manage', warningRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/profile', profileRoutes);

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