const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passport = require('passport');
const connectDb = require('./db/connectDB');
const app = express();
const session = require('express-session');
const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/auth.route');
const otpRoutes = require('./routes/otp.route');
const reposRoute = require('./routes/repos.route');
const dependencyRoutes = require('./routes/dependency.route');
const http = require('http').createServer(app);
const { init } = require('./utils/socket');
const io = init(http);

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/otp', otpRoutes);
app.use("/api/repos", reposRoute);
app.use("/api/dependencies", dependencyRoutes);
require('./config/passport')(passport); 


connectDb()
// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Start server (attach Socket.IO to the HTTP server)
http.listen(PORT, ()=>{
  console.log(`HTTP server listening on port ${PORT}`);
});
http.on('error', (err)=>{
  console.error('HTTP server error:', err?.message || err);
});