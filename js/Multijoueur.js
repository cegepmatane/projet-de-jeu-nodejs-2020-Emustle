var Multijoueur = function()
{
  var pseudonyme;
  var serveurJeu = new MultiNode();
  //VARIABLES ET CONSTANTES LOCALES AU NAVIGATEUR
  const LARGEUR_ECRAN = 1000;
  const POSITION_SOL_Y = 800;
  const REPARTITION_PIECES_X = 50;
  const REPARTITION_PIECES_Y = 1;
  const BONUS_PREMIER = 100;
  //Position de chaque joueur (x ,y) : posJoueurX, posJoueurY, posAdversaireX, posAdversaireY
  var posJoueurX = LARGEUR_ECRAN / 2;
  var posJoueurY = 0;
  var posAdversaireX = LARGEUR_ECRAN / 2;
  var posAdversaireY = 0;
  //pointage de chaque joueur : pointsJoueur, pointsAdversaire
  var pointsJoueur = 0;
  var pointsAdversaire = 0;
  //Nom de chaque joueur : nomJoueur, nomAdversaire
  var nomJoueur = "";
  var nomAdversaire = "";
  var joueurArrive = false;
  var adversaireArrive = false;
  var partieTerminee = false;
  //Position de toutes les pièces : tableau listePieces liste<Piece> avec positionX, positionY, touchee
  var pieces = new Array();
  //Nom du joueur gagnant : nomGagnant
  var nomGagnant = "";
  //Champs
  var champPointsJoueur = document.querySelector("#champ-points-joueur");
  var champPointsAdversaire = document.querySelector("#champ-points-adversaire");
  //Boutons
  var boutonFinir = document.querySelector("#bouton-finir");
  var boutonPiece = document.querySelector("#bouton-piece");

  var TOUCHE_GAUCHE = 37;
  var TOUCHE_HAUT = 38;
  var TOUCHE_DROITE = 39;
  var MAX_PIECES = 10;
  var ordreJoueur;

  function initialiser()
  {
    var formulairePseudo = document.getElementById("formulaire-pseudo");
    formulairePseudo.addEventListener("submit", authentifier);
  }

  function gererToucheRelevee(evenement)
  {
    //delete touches[evenement.keyCode];
    serveurJeu.posterVariableNumerique(nomJoueur + "=>" + "touche-relevee", evenement.keyCode);
  }

  function gererToucheEnfoncee(evenement)
  {
    //touches[evenement.keyCode] = true;
    serveurJeu.posterVariableNumerique(nomJoueur + "=>" + "touche-enfoncee", evenement.keyCode);
  }

  function authentifier(evenement)
  {
    evenement.preventDefault();
    pseudonyme = document.getElementById("champ-pseudo").value;
    nomJoueur = pseudonyme;
    console.log("Le joueur s'appelle " + pseudonyme);
    serveurJeu.connecter();
  }
          
  serveurJeu.confirmerConnexion = function()
  {
      console.log("Je suis connecte.");
      serveurJeu.demanderAuthentification(pseudonyme);
      //serveurJeu.posterVariableTextuelle("argent", "million");
  }
  serveurJeu.confirmerAuthentification = function(listePseudo)
  {
      console.log("Je suis authentifie.");
      console.log("Les autres participants sont " + JSON.stringify(listePseudo));

      if(listePseudo.length > 0)
      {
        nomAdversaire = listePseudo[0];
        ordreJoueur = 2;
        verifierDebutPartie();
        //serveurJeu.apprendreAuthentification(adversaire);
      }
      else
      {
        ordreJoueur = 1;
      }

      console.log(ordreJoueur);
      ajouterEvenementsTouches();
  }

  function ajouterEvenementsTouches()
  {
      //Interaction clavier
      //APPUI SUR UNE TOUCHE
      window.addEventListener("keydown", gererToucheEnfoncee);
      //AU RELEVEMENT D'UNE TOUCHE
      window.addEventListener("keyup", gererToucheRelevee);
  }

  serveurJeu.apprendreAuthentification = function(pseudonyme)
  {
      console.log("Nouvel opposant :  " + pseudonyme);
      nomAdversaire = pseudonyme;
      verifierDebutPartie();
  }

  function verifierDebutPartie()
  {
      console.log(nomAdversaire);
      console.log(nomJoueur);
      if(nomAdversaire != "" && nomJoueur != "")
      {
          document.querySelector("#formulaire-actions").hidden = false;
          actualiserPoints();

          //Assignement des actions
          boutonFinir.addEventListener("click", finirPartieJoueur);
          boutonPiece.addEventListener("click", ramasserPieceJoueur);
          if(ordreJoueur == 1){ initialiserPieces();  }
      }
  }

  function initialiserPieces()
  {
      var positionsPieces = new Array();
      for(var i = 0; i < MAX_PIECES; i++)
      {
        var superpose = false;
        do
        {
            positionsPieces.push({x: getNombreAleatoire(REPARTITION_PIECES_X), y: getNombreAleatoire(REPARTITION_PIECES_Y)});

            for(var j = 0; j < i; j++)
            {
                if(positionsPieces[i].x == positionsPieces[j].x && positionsPieces[i].y == positionsPieces[j].y)
                {
                    superpose = true;
                    break;
                }
            }

        } while(superpose)
      }
      serveurJeu.posterVariableTextuelle(nomJoueur + "=>" + "initialisation-pieces", JSON.stringify(positionsPieces));
  }

  function getNombreAleatoire(valeurMax)
  {
      return (Math.floor(Math.random() * valeurMax));
  }

  function actualiserPoints()
  {
      champPointsJoueur.value = pointsJoueur;
      champPointsAdversaire.value = pointsAdversaire;
  }

  //FIN DE PARTIE

  function finirPartieJoueur()
  {
      serveurJeu.posterVariableBooleenne(nomJoueur + "=>" + "joueur-arrive", true);
  }

  //RAMASSAGE DE PIECES

  function ramasserPieceJoueur()
  {
      serveurJeu.posterVariableNumerique(nomJoueur + "=>" + "joueur-ramasse", parseInt(pointsJoueur) + 10);
  }


  //ÂRTIE REPONSE DU SERVEUR

  function identifierComposantCleVariable(cleVariable)
  {
    var composantCle = cleVariable.split('=>');
    var cle = {
        pseudonyme : composantCle[0],
        nom : composantCle[1]
    }
    return cle;
  }

  serveurJeu.recevoirVariable = function(variable)
  {
      var cle = identifierComposantCleVariable(variable.cle);

      //console.log("Surcharge de recevoirVariable " + variable.cle + " = " + variable.valeur);
      if(cle.pseudonyme == nomJoueur)
      {
        switch(cle.nom)
        {
          case "touche-enfoncee":
            effectuerDeplacementJoueur(variable.valeur);
            break;
          case "joueur-arrive":
            effectuerArrivee(variable.valeur, nomJoueur);
            break;
          case "joueur-ramasse":
            effectuerRamassage(variable.valeur, nomJoueur);
            break;
          
          default:
            break;
        }
      }
      else if (cle.pseudonyme == nomAdversaire)
      {
        switch(cle.nom)
        {
          case "touche-enfoncee":
            effectuerDeplacementAdversaire(variable.valeur);
            break;
          case "joueur-arrive":
            effectuerArrivee(variable.valeur, nomAdversaire);
            break;
          case "joueur-ramasse":
            effectuerRamassage(variable.valeur, nomAdversaire);
            break;
          default:
            break;
        }
      }

    switch(cle.nom)
    {
      case "initialisation-pieces":
        effectuerInitialisationPieces(JSON.parse(variable.valeur));
        break;
    }

  }

  function effectuerInitialisationPieces(valeur)
  { 
      for(var i = 0; i < MAX_PIECES; i++)
      {
          pieces.push(new Piece(valeur[i]));
      }
  }

  function effectuerRamassage(valeur, nom)
  {
    if(pieces.length > 0)
    {
      if(pieces.length == 1) {  boutonPiece.disabled = true;  } 

      var entierAleatoire = getNombreAleatoire(pieces.length);
      delete pieces[entierAleatoire];
      var nouveauTableauPieces = new Array();
      pieces.forEach(element => {
        if(!(element == undefined)) { nouveauTableauPieces.push(element); }
      });
      pieces = nouveauTableauPieces;
      console.log(pieces);

      effectuerAugmentationPointage(valeur, nom);
    }
  }

  function effectuerDeplacementJoueur(valeur)
  {
    var codeTouche = parseInt(valeur);
    switch (codeTouche)
    {
      case TOUCHE_GAUCHE:
        posJoueurX -= 1;
        break;
      case TOUCHE_DROITE:
        posJoueurX += 1;
        break;
      case TOUCHE_HAUT:
        posJoueurY += 1;
        break;
      default:
        break;
    }

    console.log(nomJoueur + ": " + posJoueurX +  "," + posJoueurY);
  }

  function effectuerDeplacementAdversaire(valeur)
  {
    var codeTouche = parseInt(valeur);
    switch (codeTouche)
    {
      case TOUCHE_GAUCHE:
        posAdversaireX -= 1;
        break;
      case TOUCHE_DROITE:
        posAdversaireX += 1;
        break;
      case TOUCHE_HAUT:
        posAdversaireY += 1;
        break;
      default:
        break;
    }

    console.log(nomAdversaire + ": " + posAdversaireX +  "," + posAdversaireY);
  }

  function effectuerArrivee(valeur, nom)
  {
      if(nom == nomJoueur)
      {
          joueurArrive = valeur;
          //Bonus de points si on arrive en premier
          if(!adversaireArrive)
          {
              effectuerAugmentationPointage(BONUS_PREMIER, nom);
          }
      }
      else
      {
          adversaireArrive = valeur;
          //Bonus de points si on arrive en premier
          if(!joueurArrive)
          {
              effectuerAugmentationPointage(BONUS_PREMIER, nom);
          }
      }

      console.log(nom + " est arrivé !");
      verifierFinPartie();
  }

  function verifierFinPartie()
  {
      if(joueurArrive && adversaireArrive)
      {
          partieTerminee = true;
          boutonFinir.disabled = true;
          boutonPiece.disabled = true;

          nomGagnant = (pointsJoueur > pointsAdversaire) ? nomJoueur : nomAdversaire;
          console.log("Le gagnant est " + nomGagnant);
      }
  }

  function effectuerAugmentationPointage(valeur, nom)
  {

      (nom == nomJoueur) ? pointsJoueur = valeur : pointsAdversaire = valeur;
      actualiserPoints();
  }

  initialiser();
}
