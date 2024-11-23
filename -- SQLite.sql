-- SQLite
PRAGMA table_info(utilisateurLogin);

CREATE TABLE IF NOT EXISTS utilisateurLogin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_ad TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);




