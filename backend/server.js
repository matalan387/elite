const express = require('express');
const cors = require('cors');
const routes = require('./routes');
require('./database'); // Initialize database

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://matalan387.github.io'
  ]
}));
app.use(express.json());

// Routes
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Greasy Spoon Events API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
