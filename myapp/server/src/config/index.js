/**
 * Central Configuration Export
 * Combines all app configurations
 */

const serverConfig = require('./server');
const databaseConfig = require('./database');

module.exports = {
  server: serverConfig,
  database: databaseConfig
};
