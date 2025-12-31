const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Scalable E-Commerce Backend (scaffold)' });
});

// API route used by frontend scaffold
app.get('/api', (req, res) => {
  res.json({ message: 'Scalable E-Commerce Backend (API) - OK' });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
