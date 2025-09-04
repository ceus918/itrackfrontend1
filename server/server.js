require('dotenv').config();

// const express = require('express')
// const mongoose = require('mongoose')
// const cors = require('cors')
// const userRoutes = require('./routes/userRoutes')
// const servicerequestRoutes = require('./routes/servicerequestRoutes')
// const inventoryRoutes = require('./routes/inventoryRoutes')


// const app = express();
// app.use(cors());
// app.use(express.json())
// app.use(express.urlencoded({extended:true}));

// // mongoose.connect("mongodb://localhost:27017/db2")
// mongoose.connect("mongodb+srv://itrack_user:itrack123@cluster0.py8s8pl.mongodb.net/itrackDB?retryWrites=true&w=majority&appName=Cluster0")
//     .then(() => console.log('Connected to MongoDB Atlas'))
//     .catch(err => console.error('MongoDB connection error:', err));


// app.use('/api',userRoutes)
// app.use('/api',servicerequestRoutes)
// app.use('/api',inventoryRoutes)


// app.listen(8000, ()=>{
//     console.log("Server is running")
// })



require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const servicerequestRoutes = require('./routes/servicerequestRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const driverallocationRoutes = require('./routes/driverallocationRoutes');
// const testdriveRoutes = require('./routes/testdriveRoutes');
const durationRoutes = require('./routes/durationRoutes');
const auditTrailRoutes = require('./routes/auditTrailRoutes');

const app = express();

// Enable CORS with credentials
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://itrackfrontend1.vercel.app'
  ], // React frontend (local and Vercel)
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'yourSecretKeyHere',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

// MongoDB connection

// mongoose.connect("mongodb://localhost:27017/db2")
mongoose.connect("mongodb+srv://itrack_user:itrack123@cluster0.py8s8pl.mongodb.net/itrackDB?retryWrites=true&w=majority&appName=Cluster0")
//   .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth endpoints (you’ll need to create these)
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

// routes
app.use('/api', userRoutes);
app.use('/api', servicerequestRoutes);
app.use('/api', inventoryRoutes);
// app.use('/api', testdriveRoutes);
app.use('/api', driverallocationRoutes);
app.use('/api', durationRoutes);
app.use('/api/audit-trail', auditTrailRoutes);

// ✅ Start server (only once!)
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
