create table users (
user_id serial primary key,
username varchar(50),
email varchar(50),
password varchar(50),
following integer[],
followers integer[]
);

CREATE TABLE tweets (
    tweet_id SERIAL PRIMARY KEY,
    paragraph TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(user_id)
);