const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!', timestamp: new Date().toISOString() });
}); 

app.get('/api/kiro', (req, res) => {
  res.json({ 
    message: 'Hi I am Kiro from the backend!', 
    description: 'I am your AI assistant running on the server',
    version: '1.0.0'
  });
});

app.get('/api/pokemon', (req, res) => {
  res.json({ 
    message: 'I like Pokemons from the backend!',
    favorites: ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur'],
    count: 4
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});