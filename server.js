const app = require('./src/app');

console.log(process.env);
const PORT = process.env.PORT || 3056;

const server = app.listen(PORT, () => {
  console.log(`web ecommerce start with ${PORT}`);
});

// process.on('SIGINT', () => {
//   server.close(() => console.log('Exit Server Express'));
//   // notify.ping(...)
// });
