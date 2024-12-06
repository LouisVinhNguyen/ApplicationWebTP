document.addEventListener('DOMContentLoaded', function() {

    document.getElementById("inscriptionForm").addEventListener("submit", function(event) {
        event.preventDefault();  // Empêche la soumission du formulaire
        
        // Récupération des valeurs du formulaire
        const inscription = {
            prenom: document.getElementById("prenom").value,
            nom: document.getElementById("nom").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            repeatPassword: document.getElementById("repeatPassword").value
        };

        if (!inscription.nom || !inscription.prenom || !inscription.email || !inscription.password || !inscription.repeatPassword) {
            alert("Veuillez remplir tous les champs.");
            return;
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

    function enregisterInscription(inscription) {
        fetch('/api/inscriptions', {
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

    document.getElementById("loginForm").addEventListener("submit", function(event) {
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

        console.log("Form validation passed, calling loginUser...");
    
        // Call function to verify user credentials
        loginUser(login);
    });
    
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
            window.location.href = 'home.html';
        })
        .catch(error => {
            console.error('Login error:', error);
            alert(error.message);
        });
    }
    
    document.getElementById("messageContact").addEventListener("submit", function(event) {
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

        if (!validateEmail(contact.email)) {
            alert("L'adresse mail saisie n'est pas valide.");
            return;
        }

        enregistrerMessage(contact);
        document.getElementById("messageContact").reset();
    });

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
            window.location.href = './index.html';
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

});

function validateEmail(email) {

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailPattern.test(email);
}

function valideTelephone(telephone) {

    telephonePattern = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

    return telephonePattern.test(telephone)
}