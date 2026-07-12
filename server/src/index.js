require('dotenv').config();
const app = require('./app');
const { startKeepAlive } = require('./utils/keepAlive');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);

  // Initialize keep-alive module (development only)
  startKeepAlive();
});
