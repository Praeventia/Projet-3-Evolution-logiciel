import { HttpException, HttpStatus } from '@nestjs/common';

export class SelectCommand{

    commandIDToUserID: Map<string, string> = new Map<string, string>();
    userIDToCommandID: Map<string, string> = new Map<string, string>();

    //retirer les commandes select par lutilisateur
    unselectCommandSelectedByUser(userID: string): void{
        const commandID = this.userIDToCommandID.get(userID);
        if(commandID != null){
            this.userIDToCommandID.delete(userID);
            this.commandIDToUserID.delete(commandID);
        }
    }

    //verifier si un utilisateur select une commande
    doesUserSelectCommand(userID: string, commandID: string): boolean{
        const command = this.userIDToCommandID.get(userID);
        return command == commandID;
    }

    //selectionner une commande
    //si l'utilisateur select deja une commande, enlever lancienne select la nouvelle
    //si la commande est deja selectionner, throw error
    selectCommand(userID:string, commandID:string): void {
        //le user select deja cette commande
        if(this.commandIDToUserID.get(commandID) === userID) return;

        //si la commande est déja sélectionne
        if(this.commandIDToUserID.get(commandID) != null) throw new HttpException('Cette commande est déjà sélectionné par un autre utilisateur', HttpStatus.CONFLICT);

        //est-ce que le user selectionne deja de quoi?
        const commandIDAlreadySelectByUser = this.userIDToCommandID.get(userID);
        if(commandIDAlreadySelectByUser != null){
            //je dois supprimer l'ancienne command select par l'utilisateur
            this.commandIDToUserID.delete(commandIDAlreadySelectByUser);
        }

        this.userIDToCommandID.set(userID, commandID);
        this.commandIDToUserID.set(commandID, userID);
    }

    //supprimer une commande select
    unselectCommand(commandID: string): void {
        const user = this.commandIDToUserID.get(commandID);
        if(user != null){
            //la commande est vrm select, je dois la unselect
            this.commandIDToUserID.delete(commandID);
            this.userIDToCommandID.delete(user);
        }
    }
}