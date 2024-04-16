const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  user: 'inrfxssj',
  host: 'bubble.db.elephantsql.com', 
  database: 'inrfxssj',
  password: 'U9d0vA3i3Rm8T2SwMXJlWFQ4LvdOazIG',
  port: 5432, 
  ssl: true,
  maintenanceDB: 'inrfxssj'
});

module.exports = pool;