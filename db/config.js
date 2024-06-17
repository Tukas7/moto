const { Pool } = require('pg');


const pool = new Pool({
    user: 'postgres',
    host: 'viaduct.proxy.rlwy.net',
    database: 'MotoZavod',
    password: 'VABbgCjkjLffcsYvmgjOYcWeUmolovRb',
    port: 13266,
  });

module.exports = pool;