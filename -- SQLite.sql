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

PRAGMA table_info(contact);

CREATE TABLE IF NOT EXISTS contact (
    numMes INTEGER PRIMARY KEY AUTOINCREMENT,
    nomC TEXT NOT NULL,
    courriel TEXT NOT NULL,
    messages TEXT NOT NULL,
    sent_ad TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);




