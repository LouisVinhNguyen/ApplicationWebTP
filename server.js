const express = require('express');

const bodyParser = require('body-parser');

const db = require('./knex')

const app = express();

const PORT = 3000;

const bcrypt = require('bcrypt');

app.use(bodyParser.json());

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// 1. Authentification:

/*
* Route POST /api/register
* Cette route ajoute des utilisateurs a la table "users"
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
  
        res.json({ message: 'Connexion réussie' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion.', error: error.message });
    }
});

/*
 * Route POST : Logout
 * Cette route permet deconnecte l'utilisateur
 */
app.post('/api/logout', (req, res) => {
    res.json({ message: 'Déconnexion réussie.' });  // Success message
  });

// 2. Gestion des Articles:

/*
 * Route GET :
 * Cette route permet de charger les articles sur la page index.html
 */

// Route to fetch articles
app.get('/api/articles', async (req, res) => {
  try {
    // Get query parameters
    const queryParams = req.query;

    // List of valid fields for filtering articles
    const validFields = ['title', 'author', 'date', 'content', 'id'];

    // Check if any fields are invalid or empty
    for (const [key, value] of Object.entries(queryParams)) {
      if (validFields.includes(key) && (!value || value.trim() === '')) {
        return res.status(400).json({ message: `The field '${key}' cannot be empty.` });
      }
    }

    // Build filtered query
    const filters = {};
    validFields.forEach((field) => {
      if (queryParams[field]) {
        filters[field] = queryParams[field];
      }
    });

    // Execute the filtered query
    const articles = await db('articles').where(filters).select('*');

    // Send the fetched articles as JSON
    res.json(articles);
  } catch (error) {
    // Handle errors gracefully
    res.status(500).json({ message: 'Error fetching articles.', error: error.message });
  }
});

/*
 * Route POST /api/articles :
 * Cette route permet de creer des articles
 */

app.post('/api/articles', async (req, res) => {
  const { username, title, content, image_url } = req.body;

  if (!valideUsername(username)) {
    return res.status(400).json({ message: "Votre username ne peut contenir que les caractères suivant: a-z 0-9 _" });
  };

  if (!username || !title || !content) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs requis.' });
  };

  try {
      const [id] = await db('articles').insert({
          title,
          content,
          image_url: image_url || null, // Use null if no image URL is provided
          views: 0,
          admin_id: 0
      });
      const article = await db('articles').where({ id }).first();
      res.status(201).json(article);
  } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: 'Error creating article', error: error.message });
  }
});

/*
 * Route PUT /api/articles/:id
 * Cette route permet de modifier les infos de l'articles
 */

app.put('/api/articles/:id', async (req, res) => {
  // Récupère l'ID de l'article depuis les paramètres de la requête
  const { id } = req.params;

  // Extraction des champs modifiés depuis le corps de la requête
  const { title, content, imageUrl, views, adminId } = req.body;

  if (!title || !content || !imageUrl || !views || !adminId) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  try {
    // Met à jour l'article correspondant à l'ID donné
    const updated = await db('articles').where({ id }).update({ title, content, imageUrl, views, adminId });

    // Si aucun article n'est trouvé avec cet ID, retourne une erreur 404
    if (!updated) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    // Récupère et renvoie l'article mis à jour
    const article = await db('articles').where({ id }).first();
    res.json(article);
  } catch (error) {
    // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l’article.', error: error.message });
  }
});


/*
 * Route DELETE /api/articles :
 * Cette route permet de creer des articles
 */

app.delete('/api/articles/:id', async (req, res) => {
  // Récupère l'ID de l'article à supprimer depuis les paramètres de la requête
  const { id } = req.params;

  try {
    // Supprime l'article correspondant à l'ID donné
    const deleted = await db('articles').where({ id }).del();

    // Si aucun article n'est trouvé avec cet ID, retourne une erreur 404
    if (!deleted) {
      return res.status(404).json({ message: "L'article que vous essayez de supprimer n'existe pas." });
    }

    // Si la suppression a réussi, retourne une réponse vide avec un code 204 (No Content)
    res.status(204).send();
  } catch (error) {
    // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
    res.status(500).json({ message: "Erreur lors de la suppression de l'article.", error: error.message });
  }
});


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// Extras
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailPattern.test(email);
}
  
function valideUsername(username) {
    const usernamePattern = /^[a-zA-Z0-9_.]+$/;
  
    return usernamePattern.test(username)
}

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
