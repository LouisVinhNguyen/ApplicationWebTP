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

    // Vérification simple que tous les champs sont remplis
    if (!inscription.nom || !inscription.prenom || !inscription.email || !inscription.password || !inscription.repeatPassword) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (inscription.password != inscription.repeatPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    // Appel de la fonction ajouter pour insérer une nouvelle ligne dans le tableau et dans la base de donnees
    enregisterInscription(inscription);
    document.getElementById("inscriptionForm").reset();
});

function enregisterInscription(inscription){
   fetch('/api/inscriptions', {
    method : 'POST',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify(inscription)
   })
   .then(response=>response.json())
   .catch(error => console.log('Erreur lors de l enregistrement de l inscription :', error))
}

function enregisterInscription(inscription) {
    fetch('/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inscription)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de l’enregistrement');
        }
        return response.json();
    })
    .then(inscriptionFromServeur => {
        console.log('Inscription réussie :', inscriptionFromServeur);
        // Rediriger vers login.html après succès
        window.location.href = 'login.html';
    })
    .catch(error => console.log('Erreur lors de l’enregistrement de l’inscription :', error));
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
    enregistrerMessage(contact);
    document.getElementById("messageContact").reset();
});

function enregistrerMessage(contact){
    fetch('/api/contact', {
     method : 'POST',
     headers: {'Content-Type' : 'application/json'},
     body: JSON.stringify(contact)
    })
    .then(response=>response.json())
    .catch(error => console.log('Erreur lors de l envoi du messages:', error))
 }

function enregistrerMessage(contact) {
    fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de l’enregistrement');
        }
        return response.json();
    })
    .then(messageFromServeur => {
        console.log('Message envoyé :', messageFromServeur);
        // Rediriger vers index.html après succès
        window.location.href = './index.html';
    })
    .catch(error => console.log('Erreur lors de l’envoi du message :', error));
}

});