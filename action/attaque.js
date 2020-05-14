(function(){

    const NOMBRE_JOUEUR_REQUIS = 2;
    const NOMBRE_POINT_DE_VIE = 20;
    const FORCE_MAXIMUM = 3;
    const VARIABLE =
        {
            ATTAQUE : "attaque",
            POINT_DE_VIE : "point-de-vie",
            FIN_PARTIE : "fin-partie"
        };

    var multiNode;

    var pseudonyme;
    var boutonAuthentification;

    var formulaireJeu;
    var pointDeVie;
    var attaque;
    var informationAutreJoueur;
    var pointDeVieAutreJoueur;

    var listeJoueur;
    var pseudonymeJoueur;
    var pseudonymeAutreJoueur;

    function initialiser(){

        multiNode = new MultiNode();
        multiNode.confirmerConnexion = confirmerConnexion;
        multiNode.confirmerAuthentification = confirmerAuthentification;
        multiNode.apprendreAuthentification = apprendreAuthentification;
        multiNode.recevoirVariable = recevoirVariable;
        multiNode.connecter();

        listeJoueur = {};
        pseudonymeJoueur = "";
        pseudonymeAutreJoueur = "";

        initialiserVue();

    }

    function initialiserVue(){

        formulaireAuthentification = document.getElementById("formulaire-authentification");
        formulaireAuthentification.addEventListener("submit", authentifierJoueur)

        pseudonyme = document.getElementById("pseudonyme");

        boutonAuthentification = document.getElementById("bouton-authentification");

        formulaireJeu = document.getElementById("formulaire-jeu");
        formulaireJeu.addEventListener("submit", attaquerAutreJoueur)
        formulaireJeu.style.display = "none";

        pointDeVie = document.getElementById("point-de-vie");
        attaque = document.getElementById("attaque");
        informationAutreJoueur = document.getElementById("information-autre-joueur");
        pointDeVieAutreJoueur = document.getElementById("point-de-vie-autre-joueur");

    }

    function confirmerConnexion()
    {
        console.log("Je suis connecté.");
        
        
    }
    
    function confirmerAuthentification(autresParticipants){

        console.log("Je suis authentifié.");
        console.log("Les autres participants sont " + JSON.stringify(autresParticipants));

        formulaireAuthentification.querySelector("fieldset").disabled = true;

        ajouterJoueur(pseudonymeJoueur);

        for (index = 0; index < autresParticipants.length; ++index) {
            ajouterJoueur(autresParticipants[index]);
        }

        validerDebutPartie();

    }

    function recevoirVariable(variable){

        console.log("Surcharge de recevoirVariable " + variable.cle + " = " + variable.valeur);

        var cle = identifierComposantCleVariable(variable.cle);

        if(cle.pseudonyme.indexOf(pseudonymeJoueur) >= 0 ){

            switch (cle.nomAnonyme) {

                case VARIABLE.POINT_DE_VIE:

                    changerPointdeVieJoueur(variable.valeur);

                break;

                case VARIABLE.FIN_PARTIE:

                    appliquerFinPartie("perdu");

                    break;
            }

        }else{

            switch (cle.nomAnonyme) {

                /*
                case VARIABLE.ATTAQUE:

                    subirAttaque(variable.valeur);

                break;
                */

                case VARIABLE.POINT_DE_VIE:

                    changerPointdeVieAutreJoueur(variable.valeur);

                break;

                case VARIABLE.FIN_PARTIE:

                    appliquerFinPartie("gagné");

                    break;

            }

        }

    }

    function apprendreAuthentification(pseudonyme){

        console.log("Nouvel ami " + pseudonyme);

        ajouterJoueur(pseudonyme);

        validerDebutPartie();

    }

    function authentifierJoueur(evenement){

        evenement.preventDefault();

        pseudonymeJoueur = pseudonyme.value;

        multiNode.demanderAuthentification(pseudonymeJoueur);

        boutonAuthentification.disabled = true;

    }

    function identifierComposantCleVariable(cleVariable){

        var composantCle = cleVariable.split('=>');

        var cle = {

            pseudonyme : composantCle[0],
            nomAnonyme : composantCle[1]

        }

        return cle;

    }

    function ajouterJoueur(nouveauPseudonymeJoueur){

        console.log("ajouterJoueur() : " + nouveauPseudonymeJoueur);

        listeJoueur[nouveauPseudonymeJoueur] =
            {
                pointDeVie : NOMBRE_POINT_DE_VIE
            };

    }

    function validerDebutPartie(){

        var nombreJoueur = Object.keys(listeJoueur).length;

        console.log("validerDebutPartie() : " + nombreJoueur + " == " + NOMBRE_JOUEUR_REQUIS);

        if(nombreJoueur == NOMBRE_JOUEUR_REQUIS){

            debuterPartie();

        }

    }

    function identifierAutreJoueur(){

        for (var clePseudonyme in listeJoueur) {

            if(clePseudonyme.indexOf(pseudonymeJoueur) < 0){

                return clePseudonyme;

            }

        }

    }

    function debuterPartie(){

        pseudonymeAutreJoueur = identifierAutreJoueur();

        informationAutreJoueur.innerHTML =
            informationAutreJoueur.innerHTML.replace("{nom-autre-joueur}", pseudonymeAutreJoueur);

        pointDeVieAutreJoueur.value = listeJoueur[pseudonymeAutreJoueur].pointDeVie;

        pointDeVie.value = listeJoueur[pseudonymeJoueur].pointDeVie;

        formulaireJeu.style.display = "block";


    }

    function genererForceAttaque(){

        return Math.floor(Math.random() * FORCE_MAXIMUM) + 1;

    }

    function attaquerAutreJoueur(evenement){

        console.log("attaquerAutreJoueur()");

        evenement.preventDefault();

        var forceAttaque = genererForceAttaque();

        attaque.value = forceAttaque;

        multiNode.posterVariableNumerique(
            pseudonymeJoueur + "=>" + VARIABLE.ATTAQUE,
            forceAttaque);

    }

    /*
    function subirAttaque(valeur){

        console.log("subirAttaque()=>valeur" + valeur);

        multiNode.posterVariableNumerique(
            pseudonymeJoueur + "=>" + VARIABLE.POINT_DE_VIE,
            listeJoueur[pseudonymeJoueur].pointDeVie - valeur);

    }
    */

    function changerPointdeVieJoueur(nouveauPointDeVie){

        console.log("changerPointdeVieJoueur()=>valeur" + nouveauPointDeVie);

        listeJoueur[pseudonymeJoueur].pointDeVie = nouveauPointDeVie;
        pointDeVie.value = nouveauPointDeVie;

        //validerFinPartie();

    }

    function changerPointdeVieAutreJoueur(nouveauPointDeVie){

        console.log("changerPointdeVieAutreJoueur()=>valeur" + nouveauPointDeVie);

        listeJoueur[pseudonymeAutreJoueur].pointDeVie = nouveauPointDeVie;
        pointDeVieAutreJoueur.value = nouveauPointDeVie;

        //validerFinPartie();

    }

    /*
    function validerFinPartie(){

        console.log("changerPointdeVieAutreJoueur()");

        if(listeJoueur[pseudonymeAutreJoueur].pointDeVie <= 0){

            alert("Vous avez gagné!");

        }else if(listeJoueur[pseudonymeJoueur].pointDeVie <= 0){

            alert("Vous avez perdu!");

        }

    }
    */

    function appliquerFinPartie(message)
    {
        console.log("appliquerFinPartie : ", message);

        alert("Vous avez " + message + "!");
    }

    initialiser();

})();
