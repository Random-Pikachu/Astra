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
require('./config/passport')(passport); 


connectDb()
// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});