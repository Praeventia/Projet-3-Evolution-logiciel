export class ConnectClientByDrawing{

    drawingIDToUser: Map<string, Set<string>> = new Map<string, Set<string>>();
    userIDToDrawingID: Map<string, string> = new Map<string, string>();

    addClientToDrawing(drawingID: string, userID: string): void{
        //update user in drawing
        if(this.drawingIDToUser.has(drawingID)){
            this.drawingIDToUser.get(drawingID).add(userID);
        }else{
            this.drawingIDToUser.set(drawingID, new Set([userID]));
        }


        //check if user was in another drawing
        if(this.userIDToDrawingID.has(userID)){
            const drawingID = this.userIDToDrawingID.get(userID);
            if(this.drawingIDToUser.has(drawingID)){
                this.drawingIDToUser.get(drawingID).delete(userID);
            }
        }
        //set drawing to user
        this.userIDToDrawingID.set(userID, drawingID);
    }

    getConnectedUserInDrawing(drawingID: string): string[]{
        if(this.drawingIDToUser.has(drawingID)){
            return [... this.drawingIDToUser.get(drawingID)];
        }
        return [];
    }

    removeUserInDrawing(userID: string): void {
        const drawingID = this.userIDToDrawingID.get(userID);
        this.userIDToDrawingID.delete(userID);
        if(this.drawingIDToUser.has(drawingID)){
            this.drawingIDToUser.get(drawingID).delete(userID);
            if(this.drawingIDToUser.get(drawingID).size < 1){
                this.drawingIDToUser.delete(drawingID);
            }
        }else{
            //should iterate
            for(const connectedUserInDrawing of this.drawingIDToUser){
                connectedUserInDrawing[1].delete(userID);
            }
            //remove all empty drawing
            const drawingsID = [... this.drawingIDToUser.keys()];
            for(const drawingID of drawingsID){
                if(this.drawingIDToUser.get(drawingID).size < 1){
                    this.drawingIDToUser.delete(drawingID);
                }
            }
        }
    }
}