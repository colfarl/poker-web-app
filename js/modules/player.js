// player.js
export class Player {
    constructor(id, type, chips) {
        this.id = id;
        this.type = type;
        this.chips = chips;
        this.hand = [];
        this.currentBet = 0;
        this.isInGame = true;
        this.hasActed =  false; 
        this.isAllIn = false;
        this.buyIns = -5000;
    }
}