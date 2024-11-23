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
});

function enregisterInscription(inscription){
   fetch('/api/inscriptions', {
    method : 'POST',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify(inscription)
   })
   .then(response=>response.json())
   .then(inscriptionFromServeur =>{
    ajouterInscription(inscriptionFromServeur)
   })
   .catch(error => console.log('Erreur lors de l enregistrement de l inscription :', error))
}