// Authentification routes (POST /api/register, POST /api/login, POST /api/logout)

const { userInfo } = require("os");

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
        document.getElementById("inscriptionForm").reset();
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

// Routes Gestion des Articles (GET /api/articles, GET /api/articles/:id, POST /api/articles, 
//                              PUT /api/articles/:id, DELETE /api/articles/:id)

articleForm = document.getElementById("articleForm")
if (articleForm) {
    articleForm.addEventListener("submit", function(event) {
        event.preventDefault();  // Empêche la soumission du formulaire
        const article = {
            username: document.getElementById("username").value,
            title: document.getElementById("titre").value,
            content: document.getElementById("content").value
        };
        if (!article.username || !article.title || !article.content) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        enregistrerArticle(article);
        document.getElementById("formArticle").reset();
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
        document.getElementById("formArticle").reset();
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
fetch('/api/articles')
    .then(response => response.json())
    .then(articles => {
        const container = document.getElementById('articles-container');
        articles.forEach(article => {
            // Create a Bulma card for each article
            const articleElement = document.createElement('div');
            articleElement.classList.add('column', 'is-one-third');
            articleElement.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <p class="card-header-title">${article.title}</p>
                    </div>
                    <div class="card-image">
                        <figure class="image is-4by3">
                            <img src="${article.image_url}" alt="Image for ${article.title}">
                        </figure>
                    </div>
                    <div class="card-content">
                        <div class="content">
                            <p>${article.content}</p>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(articleElement);
        });
    })
    .catch(error => console.error('Error fetching articles:', error));

// Routes Gestion des Commentaires (POST /api/articles/:id/comments, GET /api/articles/:id/)

// Routes Recherche et Pagination (Route GET /api/articles/search?q=mot-cle)

//Other

contactForm = document.getElementById("messageContact")

if (contactForm) {

    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();  // Empêche la soumission du formulaire
        
        const contact = {
            nomC: document.getElementById("nomC").value,  
            courriel: document.getElementById("courriel").value, 
            messages: document.getElementById("messages").value  
        };

        console.log(contact);

        // Vérification simple que tous les champs sont remplis
        if (!contact.nomC || !contact.courriel || !contact.messages) {  
            alert("Veuillez remplir tous les champs.");
            return;
        }

        if (!validateEmail(contact.courriel)) {
            alert("L'adresse mail saisie n'est pas valide.");
            return;
        }

        enregistrerMessage(contact);
        document.getElementById("messageContact").reset();
    });

} else {
    // The form does not exist on this page, so we can safely ignore it.
    console.log("No form with id 'messageContact' on this page.");
};

function enregistrerMessage(contact) {
    fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Une erreur est survenue.');
            });
        }
        return response.json();
    })
    .then(messageFromServeur => {
        console.log('Message envoyé :', messageFromServeur);
        // Rediriger vers index.html après succès
        alert("Votre message a été reçu avec succès.")
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

function validateEmail(email) {

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailPattern.test(email);
}

function valideUsername(username) {

    usernamePattern = /^[a-zA-Z0-9_.]+$/;

    return usernamePattern.test(username)
}
