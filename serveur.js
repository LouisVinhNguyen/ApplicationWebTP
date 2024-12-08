// Importation du framework Express, qui permet de créer un serveur web facilement
const express = require('express');

// Importation de body-parser, un middleware pour traiter les données JSON dans les requêtes
const bodyParser = require('body-parser');

// Importation de la connexion à la base de données via Knex (défini dans le fichier db.js)
const db = require('./knex');

// Création d'une instance de l'application Express
const app = express();

// Définition du port sur lequel le serveur va écouter les requêtes
const PORT = 3000;

// Import bcrypt pour encrypter les mots de passe
const bcrypt = require('bcrypt');

// Middleware pour traiter les requêtes envoyées en JSON et les rendre accessibles via req.body
app.use(bodyParser.json());

const path = require('path');

const jwt = require('jsonwebtoken'); // Add this if not already included
const cookieParser = require('cookie-parser'); // Add this if not already included
app.use(cookieParser()); // Ensure this is applied

// Middleware pour servir des fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
// Apply authenticateToken middleware to protected routes
app.use('/protected', authenticateToken, express.static(path.join(__dirname, 'protected')));


// Route pour la page HTML qui contient le formulaire
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

function authenticateToken(req, res, next) {
  const token = req.cookies.authToken; // Retrieve token from cookies
  if (!token) {
      return res.redirect('/login.html'); // Redirect to login if no token
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
      if (err) {
          return res.redirect('/login.html'); // Redirect if token is invalid
      }
      req.user = user; // Attach user data to request object
      next(); // Proceed if token is valid
  });
}

app.get('/api/validate-token', authenticateToken, (req, res) => {
  res.json({ message: 'Token valid', user: req.user });
});


/**
 * Route GET : Récupérer toutes les inscriptions
 * Cette route retourne la liste de toutes les inscriptions dans la base de données.
 */
app.get('/api/register', async (req, res) => {
  try {
    // Obtenir les paramètres de la requête
    const queryParams = req.query;

    // Liste des champs valides pour la table "inscription"
    const validFields = ['nom', 'prenom', 'email', 'password', 'id'];

    // Vérification : assurez-vous que tous les champs spécifiés ne sont pas vides
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `Le champ '${key}' ne peut pas être vide.` });
      }
    }

    // Construire la requête filtrée
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Exécuter la requête filtrée
    const inscriptions = await db('utilisateurLogin').where(filters).select('*');

    // Retourner les inscriptions trouvées
    res.json(inscriptions);
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions.', error: error.message });
  }
});

/**
 * Route POST : Ajouter une nouvelle inscription
 * Cette route permet de recevoir une inscription via une requête POST.
 */
app.post('/api/register', async (req, res) => {
  const { username, email, password, repeatPassword } = req.body;
  const defaultRole = "admin";

  if (!username || !email || !password || !repeatPassword) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  if (!valideUsername(username)) {
    return res.status(400).json({ message: "Votre username ne peut contenir que les caractères suivant: a-z 0-9 _" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "L'adresse email est invalide." });
  }

  if (!(password == repeatPassword)) {
    return res.status(400).json({ message: "Les mots de passe doivent correspondre."});
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [id] = await db('users').insert({ username, email, password: hashedPassword, role: defaultRole });
    const inscription = await db('users').where({ id }).first();
    res.status(201).json(inscription);
  } catch (error) {

    console.error('Database Error:', error); // Log the exact error for debugging
    
    if (error.code === 'SQLITE_CONSTRAINT') {
      if (error.message.includes('username')) {
        return res.status(409).json({ message: "Le nom d'utilisateur est déjà utilisé." });
      }
      if (error.message.includes('email')) {
        return res.status(409).json({ message: "L'adresse email est déjà utilisée." });
      }
      return res.status(409).json({ message: "Un des champs uniques est déjà utilisé." });
    }

    res.status(500).json({ message: 'Erreur lors de l’ajout de l’inscription.' });
  }
  

});


/**
 * Route PUT : Modifier une inscription par ID
 * Cette route permet de mettre à jour une inscription existante par son ID.
 */
app.put('/api/register/:id', async (req, res) => {
  // Récupère l'ID de l'inscription depuis les paramètres de la requête (req.params)
  const { id } = req.params;

  // Extraction des champs modifiés depuis le corps de la requête (req.body)
  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  try {
    // Met à jour l'inscription correspondant à l'ID donné
    const updated = await db('utilisateurLogin').where({ id }).update({ nom, prenom, email, password });

    // Si aucune inscription n'est trouvée avec cet ID, retourne une erreur 404 (Not Found)
    if (!updated) {
      return res.status(404).json({ message: 'Inscription non trouvée.' });
    }

    // Récupère et renvoie l'inscription mise à jour
    const inscription = await db('utilisateurLogin').where({ id }).first();
    res.json(inscription);
  } catch (error) {
    // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l’inscription.', error: error.message });
  }
});

/**
 * Route DELETE : Supprimer une inscription par ID
 * Cette route permet de supprimer une inscription de la base de données par son ID.
 */
app.delete('/api/register/:id', async (req, res) => {
  // Récupère l'ID de l'inscription à supprimer depuis les paramètres de la requête
  const { id } = req.params;

  try {
    // Supprime l'inscription correspondant à l'ID donné
    const deleted = await db('utilisateurLogin').where({ id }).del();

    // Si aucune inscription n'est trouvée avec cet ID, retourne une erreur 404
    if (!deleted) {
      return res.status(404).json({ message: 'Inscription non trouvée.' });
    }

    // Si la suppression a réussi, retourne une réponse vide avec un code 204 (No Content)
    res.status(204).send();
  } catch (error) {
    // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
    res.status(500).json({ message: 'Erreur lors de la suppression de l’inscription.', error: error.message });
  }
});

/**
 * Route POST : Login par email
 * Cette route permet de confirmer que l'utilisateur existe dans la base de données et le connecte
 */

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  if (!validateEmail(email)) {
      return res.status(400).json({ message: "L'adresse email est invalide." });
  }

  try {
      const user = await db('users').where({ email }).first();
      if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: user.id, role: user.role }, 'your-secret-key', { expiresIn: '1h' });

      // Set token as an HTTP-only cookie
      res.cookie('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
          sameSite: 'Strict',
          maxAge: 3600000 // 1 hour
      });

      res.json({ message: 'Connexion réussie' });
  } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la connexion.', error: error.message });
  }
});

// Logout route to clear the authentication token
app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken');  // Clears the cookie
  res.json({ message: 'Déconnexion réussie.' });  // Success message
});

app.use(express.json());  // Middleware pour parser les requêtes JSON

app.post('/api/articles', async (req, res) => {
  const { username, title, content, image_url } = req.body;

  if (!valideUsername(username)) {
    return res.status(400).json({ message: "Votre username ne peut contenir que les caractères suivant: a-z 0-9 _" });
  };

  if (!username || !title || !content) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs requis.' });
  };

  try {
      // Insert the article into the database
      const [id] = await db('articles').insert({title, content, image_url, views: 0, admin_id: 0});
      const article = await db('articles').where({ id }).first();
      res.status(201).json(article);
  } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: 'Error creating article', error: error.message });
  }
});

app.get('/api/articles', async (req, res) => {
  try {
    const queryParams = req.query;

    // Liste des champs valides pour la table "inscription"
    const validFields = ['id', 'title', 'content', 'image_url', 'views', 'admin_id'];

    // Vérification : assurez-vous que tous les champs spécifiés ne sont pas vides
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `Le champ '${key}' ne peut pas être vide.` });
      }
    }

    // Construire la requête filtrée
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Exécuter la requête filtrée
    const articles = await db('articles').where(filters).select('*');

    // Retourner les inscriptions trouvées
    res.json(articles);
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions.', error: error.message });
  }
})

/**
 * Route POST : Ajouter un nouveau message de contact
 * Cette route permet de recevoir un message via une requête POST.
 */
app.post('/api/contact', async (req, res) => {
  const { nomC,  courriel, messages } = req.body;
  console.log("Request received:", req.body);

  if (!nomC || !courriel || !messages) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  if (!validateEmail(courriel)) {
    return res.status(400).json({ message: "L'adresse email est invalide." });
  }

  try {
    const [numMes] = await db('contact').insert({ nomC, courriel , messages });
    const contact = await db('contact').where({ numMes }).first();
    res.status(201).json(contact);
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error.message);
    res.status(500).json({ message: 'Erreur lors de l’envoi du message.', error: error.message });
}
});

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function validateEmail(email) {

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailPattern.test(email);
}

function valideUsername(username) {

  usernamePattern = /^[a-zA-Z0-9_.]+$/;

  return usernamePattern.test(username)
}

// Démarre le serveur et écoute les requêtes sur le port défini
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
