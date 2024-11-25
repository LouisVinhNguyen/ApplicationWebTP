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
    // Sélectionne toutes les inscriptions dans la table "inscriptions"
    const inscriptions = await db('utilisateurLogin').select('*');
    res.json(inscriptions); // Envoie la liste sous forme de JSON
  } catch (error) {
    // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions.', error: error.message });
  }
});

/**
 * Route POST : Ajouter une nouvelle inscription
 * Cette route permet de recevoir une inscription via une requête POST.
 */
app.post('/api/inscriptions', async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  try {
    const [id] = await db('utilisateurLogin').insert({ nom, prenom, email, password });
    const inscription = await db('utilisateurLogin').where({ id }).first();
    res.status(201).json(inscription);
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error.message);
    res.status(500).json({ message: 'Erreur lors de l’ajout de l’inscription.', error: error.message });
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
  const { nom, prenom, email, telephone } = req.body;

  try {
    // Met à jour l'inscription correspondant à l'ID donné
    const updated = await db('inscription').where({ id }).update({ nom, prenom, email, telephone });

    // Si aucune inscription n'est trouvée avec cet ID, retourne une erreur 404 (Not Found)
    if (!updated) {
      return res.status(404).json({ message: 'Inscription non trouvée.' });
    }

    // Récupère et renvoie l'inscription mise à jour
    const inscription = await db('inscription').where({ id }).first();
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
    const deleted = await db('inscription').where({ id }).del();

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

// Démarre le serveur et écoute les requêtes sur le port défini
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

app.use(express.json());  // Middleware pour parser les requêtes JSON

// Serve le fichier HTML du formulaire de contact
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Contact.html'));
});

app.post('/api/contact', async (req, res) => {
  const { nomC, courriel, messages } = req.body;

  // Validation des champs
  if (!nomC || !courriel || !messages) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  try {
    // Insertion du message dans la table contact
    const [numMes] = await db('contact').insert({ nomC, courriel, messages });

    // Récupération du message inséré
    const contact = await db('contact').where({ numMes }).first();

    // Réponse avec le message inséré
    res.status(201).json(contact);
  } catch (error) {
    console.error("Erreur lors de l'ajout du message :", error.message);
    res.status(500).json({ message: 'Erreur lors de l’ajout du message.', error: error.message });
  }
});