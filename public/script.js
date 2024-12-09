// 1. Authentification:

/*
* Route POST /api/register
* Cette route ajoute des utilisateurs a la table "users"
*/
inscriptionForm = document.getElementById("inscriptionForm")

if (inscriptionForm) {

    inscriptionForm.addEventListener("submit", function(event) {
        event.preventDefault();  // Empêche la soumission du formulaire

        // Récupération des valeurs du formulaire
        const inscription = {
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            repeatPassword: document.getElementById("repeatPassword").value
        };

        if (!inscription.username || !inscription.email || !inscription.password || !inscription.repeatPassword) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        if (!valideUsername(inscription.username)) {
            alert("Votre username ne peut contenir que les caractères suivant: a-z 0-9 _")
        }

        if (!validateEmail(inscription.email)) {
            alert("L'adresse mail saisie n'est pas valide.");
            return;
        }

        if (!(inscription.password == inscription.repeatPassword)) {
            alert("Les mots de passe doivent correspondre.")
            return;
        }

        // Appel de la fonction ajouter pour insérer une nouvelle ligne dans le tableau et dans la base de donnees
        enregisterInscription(inscription);
    });
} else {
    console.log("No form with id 'inscriptionForm' on this page.");
};

function enregisterInscription(inscription) {
    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inscription)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Une erreur est survenue.');
            });
        }
        return response.json();
    })
    .then(inscriptionFromServeur => {
        console.log('Inscription réussie :', inscriptionFromServeur);
        document.getElementById("inscriptionForm").reset();
        // Rediriger vers login.html après succès
        window.location.href = 'login.html';
    })
    .catch(error => {
        if (error.message === 'Failed to fetch') {
            console.error('Erreur : Impossible de se connecter au serveur.');
            alert('Le serveur est inaccessible. Vérifiez votre connexion ou réessayez plus tard.');
        } 
        else {
            // Gérer d'autres types d'erreurs
            console.error('Erreur lors de l\'enregistrement de l\'inscription :', error);
            alert(`Une erreur s'est produite : ${error.message}`);
        }
    });
}

/**
 * Route POST : Login par email
 * Cette route permet de confirmer que l'utilisateur existe dans la base de données et le connecte
 */

const loginForm = document.getElementById("loginForm")

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();  // Prevent form from submitting

        // Grab values from the form
        const login = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        // Check if both fields are filled
        if (!login.email || !login.password) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        // Validate email format
        if (!validateEmail(login.email)) {
            alert("L'adresse email saisie n'est pas valide.");
            return;
        }

        console.log("Form validation passed, calling loginUser with data:", login);

        // Call function to verify user credentials
        loginUser(login);
    });

} else {
    // The form does not exist on this page, so we can safely ignore it.
    console.log("No form with id 'messageContact' on this page.");
};

function loginUser(login) {
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Erreur de connexion.');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Login successful:', data);
        // Redirect to home page or user dashboard
        window.location.href = '/loginProtected/index.html';
    })
    .catch(error => {
        console.error('Error during login:', error);
        alert(`Une erreur s'est produite : ${error.message}`);
    });
}

/*
 * Route POST : Logout
 * Cette route permet deconnecte l'utilisateur
 */
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function(event) {
        event.preventDefault();  // Prevent the default behavior (e.g., following the link)
        logoutUser();  // Call the logout function
    });
} else {
    console.log("Logout button not found");
}

function logoutUser() {
    fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Erreur de déconnexion.');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Déconnexion réussie:', data);
        // Redirect to login page after successful logout
        window.location.href = '../login.html';  // Or redirect to another page (e.g., home page)
    })
    .catch(error => {
        console.error('Error during logout:', error);
        alert(`Une erreur s'est produite : ${error.message}`);
    });
}

// 2. Gestion des Articles:

/*
 * Route GET /api/articles :
 * Cette route permet de charger les articles sur la page index.html
 */

function chargerArticlesIndex() {
    fetch('/api/articles')
        .then(response => response.json())
        .then(articles => {
            articles.forEach(article => {
                ajouterArticleIndex(article);
            });
        })
        .catch(error => {
            if (error.message === 'Failed to fetch') {
                console.error('Error: Unable to connect to the server.');
                alert('The server is unavailable. Check your connection or try again later.');
            } else {
                console.log('Error fetching articles:', error);
                alert(`An error occurred: ${error.message}`);
            }
        });
}

function ajouterArticleIndex(article) {
    if (document.getElementById("listeArticles")) {
        const listeArticles = document.getElementById("listeArticles");
        const li = document.createElement('li');

        li.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <figure class="image">
                        <img src="${article.image_url || 'https://bulma.io/assets/images/placeholders/1280x960.png'}" alt="Image">
                    </figure>
                </div>
                <div class="card-content">
                    <div class="media">
                        <div class="media-left">
                            <figure class="image is-48x48">
                                <img src="${article.avatar || 'https://bulma.io/assets/images/placeholders/96x96.png'}" alt="Avatar">
                            </figure>
                        </div>
                        <div class="media-content">
                            <p class="title is-4">${article.title}</p>
                            <p class="subtitle is-6">@${article.author}</p>
                        </div>
                    </div>
                    <div class="content">
                        ${article.content}
                        <br />
                        <time datetime="${article.date}">${new Date(article.date).toLocaleString()}</time>
                    </div>
                </div>
            </div>
            <br>
        `;

        listeArticles.appendChild(li);
    } else {
        console.log("Aucune liste avec ID 'listeArticles'.");
    }
}

// Call the function to load articles when the page loads
if (document.getElementById("listeArticles")) {
    chargerArticlesIndex();
} else {
    console.log("Aucune liste avec ID 'listeArticles'.");
}

function chargerArticlesAdmin() {
    fetch('/api/articles')
        .then(response => response.json())
        .then(articles => {
            articles.forEach(article => {
                ajouterArticleAdmin(article);
            });
        })
        .catch(error => {
            if (error.message === 'Failed to fetch') {
                console.error('Error: Unable to connect to the server.');
                alert('The server is unavailable. Check your connection or try again later.');
            } else {
                console.log('Error fetching articles:', error);
                alert(`An error occurred: ${error.message}`);
            }
        });
}

function ajouterArticleAdmin(article) {
    if (document.getElementById("tableArticles")) {
        let table = document.getElementById("tableArticles").getElementsByTagName('tbody')[0];
        let newRow = table.insertRow();
        newRow.id = `row-${article.id}`;

        // Insert article data into cells
        newRow.insertCell(0).textContent = article.id;
        newRow.insertCell(1).textContent = article.title;
        newRow.insertCell(2).textContent = article.content;
        newRow.insertCell(3).textContent = article.image_url;
        newRow.insertCell(4).textContent = article.views;
        newRow.insertCell(5).textContent = article.admin_id;
        newRow.insertCell(6).textContent = article.created_ad;

        // Create action buttons
        let actionsCell = newRow.insertCell(7);

        // Edit button
        let editButton = document.createElement("button");
        editButton.className = "button is-warning is-small";
        editButton.textContent = "Modifier";

        // Delete button
        let deleteButton = document.createElement("button");
        deleteButton.className = "button is-danger is-small";
        deleteButton.textContent = "Supprimer";

        deleteButton.onclick = function() {
            supprimerArticle(article.id, newRow);
        };

        editButton.onclick = function() {
            activerModeEdition(newRow, article.id); // Passe la ligne entière en mode édition
        };

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
    } else {
        console.log("Aucune table avec ID 'tableArticles'.");
    }
}

// Call the function to load articles when the page loads
if (document.getElementById("listeArticles")) {
    chargerArticlesAdmin();
} else {
    console.log("Aucune liste avec ID 'listeArticles'.");
}

/*
 * Route POST /api/articles :
 * Cette route permet de creer des articles
 */
articleForm = document.getElementById("articleForm");
if (articleForm) {
    articleForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form submission
        const article = {
            username: document.getElementById("username").value,
            title: document.getElementById("title").value,
            content: document.getElementById("content").value,
            image_url: document.getElementById("image_url").value || null // Use null if empty
        };

        if (!article.username || !article.title || !article.content) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        enregistrerArticle(article);
        document.getElementById("articleForm").reset();
    });
}

function enregistrerArticle(article) {
    fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Une erreur est survenue.');
            });
        }
        return response.json();
    })
    .then(articleFromServeur => {
        console.log('Article enregistrer! :', articleFromServeur);
        document.getElementById("articleForm").reset();
        // Rediriger vers admin.html après succès
        window.location.href = './Admin.html';
    })
    .catch(error => {
        if (error.message === 'Failed to fetch') {
            console.error('Erreur : Impossible de se connecter au serveur.');
            alert('Le serveur est inaccessible. Vérifiez votre connexion ou réessayez plus tard.');
        } else {
            console.error('Erreur lors de l\'enregistrement de l\'article :', error);
            alert(`Une erreur s'est produite : ${error.message}`);
        }
    });
}

/*
 * Route PUT /api/articles/:id :
 * Cette route permet de modifier la valeur des articles
 */
// Function to activate edit mode for an article
function activerModeEdition(row, id) {
    // Récupérer les valeurs actuelles des cellules
    const title = row.cells[1].textContent;
    const content = row.cells[2].textContent;
    const imageUrl = row.cells[3].textContent;
    const views = row.cells[4].textContent;
    const adminId = row.cells[5].textContent;
    const createdDate = row.cells[6].textContent;

    // Transformer chaque cellule en champ de saisie
    row.cells[1].innerHTML = `<input type="text" value="${title}" class="input is-small">`;
    row.cells[2].innerHTML = `<input type="text" value="${content}" class="input is-small">`;
    row.cells[3].innerHTML = `<input type="text" value="${imageUrl}" class="input is-small">`;
    row.cells[4].innerHTML = `<input type="number" value="${views}" class="input is-small">`;
    row.cells[5].innerHTML = `<input type="number" value="${adminId}" class="input is-small">`;
    row.cells[6].innerHTML = `<input type="text" value="${createdDate}" class="input is-small" disabled>`; // Date should not be editable

    // Remplacer les boutons d'action par un bouton "Enregistrer"
    const actionsCell = row.cells[7];
    actionsCell.innerHTML = "";  // Efface le contenu actuel

    let saveButton = document.createElement("button");
    saveButton.className = "button is-primary is-small";
    saveButton.textContent = "Enregistrer";

    saveButton.onclick = function() {
        enregistrerModification(row, id);
    };

    actionsCell.appendChild(saveButton);
}

// Function to save the modifications and exit the edit mode
function enregistrerModification(row, id) {
    // Récupérer les valeurs des champs de saisie
    const title = row.cells[1].querySelector("input").value;
    const content = row.cells[2].querySelector("input").value;
    const imageUrl = row.cells[3].querySelector("input").value;
    const views = row.cells[4].querySelector("input").value;
    const adminId = row.cells[5].querySelector("input").value;

    // Validate inputs
    if (!title || !content || !imageUrl || !views || !adminId) {
        alert("Tous les champs sont obligatoires.");
        return;
    }

    // Update the display of cells with the new values
    row.cells[1].textContent = title;
    row.cells[2].textContent = content;
    row.cells[3].textContent = imageUrl;
    row.cells[4].textContent = views;
    row.cells[5].textContent = adminId;

    // Remettre les boutons "Modifier" et "Supprimer" dans la cellule des actions
    const actionsCell = row.cells[7];
    actionsCell.innerHTML = "";

    let editButton = document.createElement("button");
    editButton.className = "button is-warning is-small";
    editButton.textContent = "Modifier";
    editButton.onclick = function() {
        activerModeEdition(row, id);
    };

    let deleteButton = document.createElement("button");
    deleteButton.className = "button is-danger is-small";
    deleteButton.textContent = "Supprimer";
    deleteButton.onclick = function() {
        supprimerArticle(id, row);
    };

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);

    // Send modifications to the server
    updateArticle(id, { title, content, imageUrl, views, adminId });
}

// Function to send the PUT request to the server and update the article
function updateArticle(id, article) {
    fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
    })
    .then(response => {
        if (!response.ok) {
            console.log('Erreur lors de la mise à jour de l\'article :', response.statusText);
        }
    })
    .catch(error => {
        if (error.message === 'Failed to fetch') {
            console.error('Erreur : Impossible de se connecter au serveur.');
            alert('Le serveur est inaccessible. Vérifiez votre connexion ou réessayez plus tard.');
        } else {
            console.log('Erreur lors de la requête de mise à jour :', error);
            alert(`Une erreur s'est produite : ${error.message}`);
        }
    });
}


/*
 * Route DELETE /api/articles/:id :
 * Cette route permet de modifier la valeur des articles
 */
function supprimerArticle(id, row) {
    fetch(`/api/articles/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.status === 404) {
            alert("L'article que vous essayez de supprimer n'existe pas.");
        } else if (response.ok) {
            row.remove();  // Remove the row from the table
        }
    })
    .catch(error => {
        if (error.message === 'Failed to fetch') {
            console.error('Erreur : Impossible de se connecter au serveur.');
            alert('Le serveur est inaccessible. Vérifiez votre connexion ou réessayez plus tard.');
        } else {
            // Handle other types of errors
            console.error('Erreur lors de la suppression de l\'article :', error);   
            alert(`Une erreur s'est produite : ${error.message}`);
        }
    });
}


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