require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Import all your routes
const projectRoutes = require('./routes/projectRoutes');
const authRoutes = require('./routes/authRoutes');
const statRoutes = require('./routes/statRoutes');
const messageRoutes = require('./routes/messageRoutes');
const resumeRoutes = require('./routes/resumeRoute'); // <-- Added Resume Route Import

const app = express();

// 2. Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins (Easiest for troubleshooting)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// 3. DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 4. Register Routes
app.use('/api/projects', projectRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/resume', resumeRoutes); // <-- Added Resume API Endpoint

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));