const app = require('./src/app');

const PORT = 3055;

const server = app.listen(PORT, () => {
  console.log(`web ecommerce start with ${PORT}`);
});

// process.on('SIGINT', () => {
//   server.close(() => console.log('Exit Server Express'));
//   // notify.ping(...)
// });
