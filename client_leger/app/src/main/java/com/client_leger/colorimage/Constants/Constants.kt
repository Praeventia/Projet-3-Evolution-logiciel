package com.client_leger.colorimage.Constants

object Constants {

    val DEFAULT_DRAWING_CHANNEL: String = "Dessin"
    val DEFAULT_ERROR_MESSAGE: String = "Une erreur c'est produite "
    val USER_FIELD_EMPTY:String = "Le champ nom d'utilisateur est vide"
    val EMAIL_FIELD_EMPTY:String = "Le champ courriel électronique est vide"
    val PASSWORD_EMPTY:String = "Le champ mot de passe est vide"

    val ERROR: String = "Erreur"

    val NO_MODIFICATION_MADE: String = "Aucune modification n'a été apportée"

    val USER_LOGIN: String = "Se connecter"
    val USER_LOGOUT: String = "Se déconnecter"

    val LOGIN_SUCCES_MESSAGE: String = "Connexion réussite"
    val LOGOUT_SUCCES_MESSAGE: String = "Déconnexion réussite"
    val EXPIRED_SESSION: String = "Session expirée"

    val SIGNIN_REDIRECT_SUCCES_MESSAGE: String = "Compte créé avec succès. Vous serez redirigé sous peu"
    val SIGNIN_SUCCES_MESSAGE: String = "Compte créé avec succès. Vous êtes connecté"

    val USERNAME_UPDATE_SUCCES_MESSAGE: String = "Modification du nom d'utilisateur réussie"
    val AVATAR_UPDATE_SUCCES_MESSAGE: String = "Modification d'avatar réussie"

    val DRAWING_WAS_SUBMIT: String = "Un dessin a été soumis pour ce concours"
    val NO_DRAWING: String = "Aucun dessin trouvé"

    val LOGIN_SUCCES_STATUS: String = "201"
    val LOGOUT_SUCCES_STATUS: String = "201"

    val USER_SUCCES_STATUS: String = "200"
    val SINGIN_SUCCES_STATUS: String = "200"
    val USERNAME_UPDATE_SUCCES_STATUS: String = "200"
    val SUCCES_STATUS: String = "200"
    val UNAUTHORIZED_STATUS: String = "401"

    val USER_AVATAR_URL: String = "https://backendpi3.fibiess.com/users/avatar/"
    val DEFAULT_AVATAR_URL: String = "https://backendpi3.fibiess.com/users/defaultAvatar/"

    val NO_IMAGE_SELECTED:String = "Aucune image sélectionnée"
    val MAX_NUMBER_VOTES: Int = 5
    val CONTEST_MAX_VOTES_ACHIEVED:String = "Vous avez atteint la limite de vote"
    val NO_CONTEST: String = "Aucun concours"
    val VOTE_SUCCES_STATUS: String = "201"
    val CURRENT_WEEK_CONTEST: String = "Concours courant"
    val PAST_WEEK_CONTEST: String = "Concours passé"
    val CONFLICT_STATUS: String = "409"
    val VOTE_MODIFICATION_UNAVAILABLE: String = "Vous ne pouvez pas modifier ce vote"
    val DEFAULT_CHANNEL: String = "Principal"
    var ERROR_MESSAGE_CONNECTION_SERVER = "Une erreur c'est produite, redirection vers la page principal"
    var INPUT_ERROR: String = "Les données entrées ne sont pas valides"
    var SUCCES_PUT: String = "201"
    val NO_DRAWING_SELECTED:String = "Aucun dessin sélectionné"


    enum class ToolType {
        Pencil,
        Rectangle,
        Ellipse,
    }

}
