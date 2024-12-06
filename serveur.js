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


// Middleware pour traiter les requêtes envoyées en JSON et les rendre accessibles via req.body
app.use(bodyParser.json());

const path = require('path');

// Middleware pour servir des fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la page HTML qui contient le formulaire
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


/**
 * Route GET : Récupérer toutes les inscriptions
 * Cette route retourne la liste de toutes les inscriptions dans la base de données.
 */
app.get('/api/inscriptions', async (req, res) => {
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
app.post('/api/inscriptions', async (req, res) => {
  const { nom, prenom, email, password, repeatPassword } = req.body;

  if (!nom || !prenom || !email || !password || !repeatPassword) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "L'adresse email est invalide." });
  }

  if (!(password == repeatPassword)) {
    return res.status(400).json({ message: "Les mots de passe doivent correspondre."});
  }

  try {
    const [id] = await db('utilisateurLogin').insert({ nom, prenom, email, password });
    const inscription = await db('utilisateurLogin').where({ id }).first();
    res.status(201).json(inscription);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: "L'email est déjà utilisé." });
    }
    res.status(500).json({ message: 'Erreur lors de l’ajout de l’inscription.' });
  }

});


/**
 * Route PUT : Modifier une inscription par ID
 * Cette route permet de mettre à jour une inscription existante par son ID.
 */
app.put('/api/inscriptions/:id', async (req, res) => {
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
app.delete('/api/inscriptions/:id', async (req, res) => {
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

  // Validate email format
  if (!validateEmail(email)) {
      return res.status(400).json({ message: "L'adresse email est invalide." });
  }

  try {
      // Find user by email
      const user = await db('utilisateurLogin').where({ email }).first();

      if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      // Compare the password (ensure you are using hashed passwords in your database)
      const isPasswordCorrect = (password === user.password);

      if (!isPasswordCorrect) {
          return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }

      // If login is successful, return user data or a success message
      res.status(200).json({ message: 'Connexion réussie', user });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
  }
});



// Démarre le serveur et écoute les requêtes sur le port défini
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

app.use(express.json());  // Middleware pour parser les requêtes JSON

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

function validateEmail(email) {

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailPattern.test(email);
}

function valideTelephone(telephone) {

  telephonePattern = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

  return telephonePattern.test(telephone)
}