const express = require('express');
const serverless = require('serverless-http');
const pool = require('./db');
const app = express();
const router = express.Router();

app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the database to find user by username
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    // If user not found, return error
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // If password is incorrect, return error
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // If username and password are correct, return success
    res.json({ message: 'Login successful', user_id: user.user_id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// comment for local development
// app.use('/.netlify/functions/api', router);
// --------

// comment for production
app.use('/', router);
app.listen(3002, console.log('server listening'));
// --------

module.exports.handler = serverless(app);