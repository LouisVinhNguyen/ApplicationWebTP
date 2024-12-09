-- SQLite
PRAGMA foreign_keys = ON;

--drop table if exists comments;
--drop table if exists articles;
--drop table if exists users;


CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role varchar NOT NULL,
    created_ad TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    views INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    created_ad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id)
        REFERENCES users (id)
);


CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    article_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_ad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS contact (
    numMes INTEGER PRIMARY KEY AUTOINCREMENT,
    nomC TEXT NOT NULL,
    courriel TEXT NOT NULL,
    messages TEXT NOT NULL,
    sent_ad TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);
