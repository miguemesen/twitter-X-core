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

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const query = `insert into users (username, email, password, following, followers) values
    ($1, $2, $3, array[]::integer[], array[]::integer[]) returning user_id;`;
    const result = await pool.query(query, [username,email,password]);

    res.json({ message: 'Register successful', user_id: result.rows[0].user_id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/createPost', async (req, res) => {
  const {paragraph, user_id} = req.body;
  try {
    const query = `insert into tweets (paragraph, user_id) values ($1,$2);`
    await pool.query(query, [paragraph, user_id])
    res.json({message: 'Tweet created successfully'})
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
})

router.get('/getMyFeed', async (req, res) => {
  const {user_id} = req.query;
  try {
    const query = `SELECT tweets.tweet_id, tweets.paragraph, tweets.date, tweets.user_id, users.username, users.email, users.user_id
    FROM tweets
    JOIN users ON users.user_id = tweets.user_id
    WHERE tweets.user_id = $1 OR users.user_id = ANY(SELECT unnest(following) FROM users WHERE user_id = $1)
    ORDER BY tweets.date DESC;` 
    const result = await pool.query(query, [user_id])
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
})


router.patch('/addFollower', async (req, res) => {
  const {user_id, new_follower_id} = req.body;
  try {
    const query = `UPDATE users
    SET followers = followers || $1
    WHERE user_id = $2;`
    await pool.query(query, [new_follower_id, user_id])
    res.json({message: 'Follower added successfully'})
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
})

router.patch('/removeFollower', async (req, res) => {
  const {user_id, remove_follower_id} = req.body;
  try {
    const query = `UPDATE users
    SET followers = ARRAY_REMOVE(followers, $1)
    WHERE user_id = $2;`
    await pool.query(query, [remove_follower_id, user_id])
    res.json({message: 'Follower removed successfully'})
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
})

router.patch('/addFollowing', async (req, res) => {
  const {user_id, new_following_id} = req.body;
  try {
    const query = `UPDATE users
    SET following = following || $1
    WHERE user_id = $2;`
    await pool.query(query, [new_following_id, user_id])
    res.json({message: 'Following added successfully'})
  } catch (error) {
    console.log('print: error: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

router.patch('/removeFollowing', async (req, res) => {
  const {user_id, remove_following_id} = req.body;
  try {
    const query = `UPDATE users
    SET following = ARRAY_REMOVE(following, $1)
    WHERE user_id = $2;`
    await pool.query(query, [remove_following_id, user_id])
    res.json({message: 'Following removed successfully'})
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
})

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