const app = require('./src/app');
const db = require('./src/db');
const port = process.env.PORT || 5000;

db.connect()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Backend listening on port ${port} (DB connected)`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Kill the process using that port or change PORT.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  })
  .catch(() => {
    // If DB connection fails, still start server for limited functionality
    const server = app.listen(port, () => {
      console.warn(`Backend listening on port ${port} (DB unavailable)`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Kill the process using that port or change PORT.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  });
