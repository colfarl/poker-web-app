import { Player } from './player.js'; 
import { createDeck, shuffleDeck, dealFlop, dealTurnOrRiver } from './deck.js';  
import { updateActionLog, displayHand, displayFaceDown, displayCommunity, updatePotTotal, updatePlayerChips, inProgressUI, displayGameEndOptions, updateMinRaise} from './ui.js';
import { HandEvaluation } from './handEval.js';

export class GameManager {
    constructor() {
        this.players = [];
        this.deck = [];
        this.communityCards = [];
        this.pot = 0;
        this.highestBet = 0;
        this.currentStage = 'pre-flop';
        this.gameState = 'notStarted'; 
        this.dealerPosition = 0;
        this.smallBlindPosition = 1;
        this.bigBlindPosition = 2;
        this.smallBlind = 25;
        this.bigBlind = 50;
        this.hands = [8, 9, 5, 6, 1, 2, 3, 10, 4, 7];
        this.handRank = ["High Card", "Pair", "Two Pair", "3 of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush", "Royal Flush"];
        this.resolvePlayerAction = null;
        this.minRaise = 100;
    }

    addPlayer(id, type, chips) {
        const player = new Player(id, type, chips);
        this.players.push(player);
    }

    canCall(player) {
        return this.highestBet > player.currentBet;
    }
    
    canCheck(player) {
        return this.highestBet === 0 || player.currentBet === this.highestBet;
    }

    async bet(player, amount) {
        if (player.chips <= amount) {
            amount = player.chips;
            player.isAllIn = true;
        }
        player.chips -= amount;
        player.currentBet += amount;
        this.pot += amount;
        this.highestBet = Math.max(this.highestBet, player.currentBet);
            
        // Update UI
        updatePotTotal(this.pot);
        updatePlayerChips(player, player.chips); 
    }

    async check(player) {
        if (this.highestBet === 0 || player.currentBet === this.highestBet) {
            updateActionLog(`Player ${player.id} checks`);
        } else {
            console.error('Cannot check, there is a bet already.');
        }
    }

    async fold(player) {
        player.isInGame = false;
        updateActionLog(`Player ${player.id} folds`);
    }

    async call(player) {
        const amount = this.highestBet - player.currentBet;
        await this.bet(player, amount);
        updateActionLog(`Player ${player.id} calls (${amount} chips)`);
    }

    resetGame() {
        this.players.forEach(player => {
            player.hand = [];
            player.currentBet = 0;
            player.isInGame = true;
            player.isAllIn = false;
            if(player.chips <= 25000){
                player.chips += 25000;
                player.buyIns -= 25000;
            }
        });
        this.pot = 0;
        this.highestBet = 0;
        this.minRaise = 100;
        this.currentStage = 'pre-flop';
    }

    async raise(player, amount) {
        if (amount >= 2 * this.highestBet) {
            this.minRaise += amount;
            await this.resetAction();
            await this.bet(player, amount);
            player.hasActed = true;
            updateActionLog(`Player ${player.id} raises ${amount} chips`);
            updateMinRaise(this.minRaise); 
        } 
    }

    async resetAction(){
        this.players.forEach(player =>{
            player.hasActed = false;
        })
    }
    
    isValidAction(player, action) {
        switch (action) {
            case 'call':
                return this.canCall(player);
            case 'check':
                return this.canCheck(player);
            case 'fold':
                return true;
            case 'allin':
                return true;
            case 'raise':
                return true;
            default:
                return false;
        }
    }

    waitForPlayerDecision() {
        return new Promise((resolve) => {
            this.resolvePlayerAction = resolve;
        });
    }

    playerAction(action) {
        if (this.resolvePlayerAction) {
            this.resolvePlayerAction(action); 
        }
    }

    allPlayersActed() {
        return this.players.every(player => !player.isInGame || player.hasActed);
    }

    highestBetEqualized() {
        return this.players.every(player => !player.isInGame || player.currentBet === this.highestBet);
    }

    postBlinds() {
        this.bet(this.players[this.smallBlindPosition], this.smallBlind);
        this.bet(this.players[this.bigBlindPosition], this.bigBlind);
        updateActionLog(`Player ${this.players[this.smallBlindPosition].id} bets ${this.smallBlind} (small blind)`);
        updateActionLog(`Player ${this.players[this.bigBlindPosition].id} bets ${this.bigBlind} (big blind)`);
    }
    
    rotateDealer() {
        this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
        this.smallBlindPosition = (this.dealerPosition + 1) % this.players.length;
        this.bigBlindPosition = (this.dealerPosition + 2) % this.players.length;
    }
    
    async resetBetting(){
        this.highestBet = 0;
        this.minRaise = 50;
        this.players.forEach(player => {
            player.currentBet = 0;
        });
        updateMinRaise(this.minRaise);
    }
    
    isAnyPlayerAllIn() {
        return this.players.some(player => player.isAllIn);
    }

    dealHands() {
        this.players.forEach(player => {
            if (this.deck.length < 2) {
                throw new Error("Not enough cards in the deck to deal a hand");
            }
            player.hand = this.deck.splice(0, 2);
        });
    }
    
    async handlePlayerAction(player, action) {
        if (this.isValidAction(player, action)) {
            switch (action) {
                case 'call':
                    this.call(player);
                    break;
                case 'fold':
                    this.fold(player);
                    break;
                case 'check':
                    this.check(player);
                    break;
                case 'allin':
                    this.bet(player, player.chips);
                    break;
                case 'raise':
                    break;
                default:
                    console.error(`Unknown action: ${action}`);
            }
            this.resolvePlayerAction(action);
        } else {
            updateActionLog(`Invalid action: ${action}`);
            const newAction = await this.waitForPlayerDecision();
            await this.handlePlayerAction(player, newAction);
        }
    }

    async botPreFlop(player, position, strength){
        if (strength === 1) {
            console.log('statement 1');
            await this.raise(player, this.minRaise * 3);
        } else if (strength <= 4) {
            console.log('statement 2');
            if (this.highestBet <= 400) {
                console.log('statement 2 1');
                await this.raise(player, this.minRaise * 3);
            } else {
                console.log('statement 2 2');
                await this.call(player);
            }
        } else if (strength === 5 && position <= 3) {
            console.log('statement 3');
            await this.call(player);
        } else if (strength === 6) {
            console.log('statement 4');
            if (position > 4 && this.minRaise <= 250) {
                console.log('statement 4 1');
                await this.raise(player, this.minRaise);
            } else if (position > 3 && this.highestBet <= 800) {
                console.log('statement 4 2');
                await this.call(player);
            }
            else{
                //incomplete
                console.log('statement 4 3');
                await this.fold(player);
            }
        } else if (strength <= 8 && position >= 7 && this.highestBet <= 500) {
            console.log('statement 5');
            await this.call(player);
        } else if (position === 0 && this.highestBet <= 200 && this.canCall(player)) {
            console.log('statement 6');
            await this.call(player);
        } else {
            console.log('statement 7');
            await this.fold(player);
        }
    }

    async botDecision(player, _isAllInRound, position) {
        if(this.currentStage === 'pre-flop'){
            const strength = HandEvaluation.evaluatePreFlopHand(player.hand);
            await this.botPreFlop(player, position, strength);
        }
        else if(this.canCheck(player)){
            await this.check(player);
        }
        else{
            await this.call(player);
        }
        player.hasActed = true;
    }

    updateGameState(newState) {
        this.gameState = newState;
        switch(this.gameState) {
            case 'notStarted':
                initializeGame();
                break;
            case 'inProgress':
                inProgressUI();
                break;
            case 'finished':
                displayGameEndOptions();
                break;
            default:
                console.log("Invalid Game State");
                break;
        }
    }

    async nextGame() {
        document.getElementById('next-game-button').style.display = 'none';
        document.getElementById('stop-playing-button').style.display = 'none';
        document.getElementById('community-cards').style.display = 'none';
    
        this.updateGameState('inProgress');
        this.rotateDealer();
        updatePotTotal();
        await this.playRound();
        this.updateGameState('finished');
    }

    async bettingRound() {
        let bettingContinues = true;
        let currentPlayerIndex = (this.bigBlindPosition + 1) % this.players.length;
        let position = 2;
        if (this.currentStage !== 'pre-flop') {
            currentPlayerIndex = this.smallBlindPosition % this.players.length;
            position = 0;
        }

        while (bettingContinues) {
            const player = this.players[currentPlayerIndex];
            console.log(`Player ${player.id}, in game: ${player.isInGame},has acted: ${player.hasActed}`);
            if (player.isInGame) {
                
                if (player.type === 'bot') {
                    await this.botDecision(player, false, position);
                } else {
                    updateActionLog("Action is on you:");
                    const action = await this.waitForPlayerDecision();
                    await this.handlePlayerAction(player, action);
                    player.hasActed = true;
                }
                if (player.isAllIn) {
                    await this.allInBettingRound(currentPlayerIndex);
                    break;
                }
            }
            
            console.log(`Player ${player.id}, in game: ${player.isInGame},has acted: ${player.hasActed}`);
            currentPlayerIndex = (currentPlayerIndex + 1) % this.players.length;
            position = (position + 1) % this.players.length;
            if ((this.allPlayersActed() && this.highestBetEqualized()) || this.checkForEndOfRound(this.players)) {
                bettingContinues = false;
            }
        }
    }

    async allInBettingRound(allInPlayerIndex) {
        let currentPlayerIndex = (allInPlayerIndex + 1) % this.players.length;
    
        while (currentPlayerIndex !== allInPlayerIndex) {
            let player = this.players[currentPlayerIndex];
    
            if (player.type === 'bot') {
                this.botDecision(player, true);
            } else {
                const action = await this.waitForPlayerDecision();
                await this.handlePlayerAction(player, action);
                player.hasActed = true;
            }
            currentPlayerIndex = (currentPlayerIndex + 1) % this.players.length;
        }
    }

    checkForEndOfRound(players) {
        const activePlayers = players.filter(player => player.isInGame).length;
        if (activePlayers === 1) {
            return true;
        }
        return false;
    }

    endGame(winners){
        for (let i = 1; i < this.players.length; i++) {
            displayHand(this.players[i].hand, i + 1);
        }
        this.awardWinner(winners, this.communityCards);
        this.resetGame();
    }

    async playRound() {
        updateActionLog('------Pre-Flop-------');
        this.deck = createDeck();
        shuffleDeck(this.deck);
        this.communityCards = [];

        this.dealHands(this.deck);
        
        for (let i = 0; i < this.players.length; i++) {
            if (i === 0) {
                displayHand(this.players[i].hand, i + 1);
            } else {
                displayFaceDown(this.players[i].hand, i + 1);
            }
        }

        this.postBlinds();

        await this.bettingRound();

        if(this.checkForEndOfRound(this.players)){
            this.communityCards = dealFlop(this.deck, this.communityCards);
            dealTurnOrRiver(this.deck, this.communityCards);
            dealTurnOrRiver(this.deck, this.communityCards);
            displayCommunity(this.communityCards);
            const winners = HandEvaluation.evaluateAllHands(this.players, this.communityCards, this.hands);
            this.endGame(winners);
            return;
        }

        // Deal the flop
        this.communityCards = dealFlop(this.deck, this.communityCards);
        displayCommunity(this.communityCards);

        // Flop round of betting
        this.currentStage = "flop";
        await this.resetAction();
        await this.resetBetting();
        updateActionLog('--------Flop---------');

        if (!this.isAnyPlayerAllIn()) {
            await this.bettingRound();
        }

        if(this.checkForEndOfRound(this.players)){
            dealTurnOrRiver(this.deck, this.communityCards);
            dealTurnOrRiver(this.deck, this.communityCards);
            displayCommunity(this.communityCards);
            const winners = HandEvaluation.evaluateAllHands(this.players, this.communityCards, this.hands);
            this.endGame(winners);
            return;
        }

        // Deal the Turn
        dealTurnOrRiver(this.deck, this.communityCards);
        displayCommunity(this.communityCards);

        // Turn round of betting
        updateActionLog('--------Turn---------');
        this.currentStage = "turn";
        await this.resetAction();
        await this.resetBetting();

        if (!this.isAnyPlayerAllIn()) {
            await this.bettingRound();
        }

        if(this.checkForEndOfRound(this.players)){
            dealTurnOrRiver(this.deck, this.communityCards);
            displayCommunity(this.communityCards);
            const winners = HandEvaluation.evaluateAllHands(this.players, this.communityCards, this.hands);
            this.endGame(winners);
            return;
        }
        // Deal river
        dealTurnOrRiver(this.deck, this.communityCards);
        displayCommunity(this.communityCards);

        // River round of betting
        updateActionLog('--------River---------');
        this.currentStage = "river";
        await this.resetAction();
        await this.resetBetting();

        if (!this.isAnyPlayerAllIn()) {
            await this.bettingRound();
        }
        
        // Find Best Hand
        const winners = HandEvaluation.evaluateAllHands(this.players, this.communityCards, this.hands);
        this.endGame(winners);
    }

    awardWinner(winners, communityCards) {
        if (winners.length === 1) {
            const winner = winners[0];
            this.players[winner].chips += this.pot;
            updatePlayerChips(this.players[winner], this.players[winner].chips);
            const [rank, _score, _hand] = HandEvaluation.evaluateHand(this.players[winner].hand, communityCards, this.hands);
            updateActionLog(`Player ${this.players[winner].id} wins the pot of ${this.pot} chips with a ${this.handRank[rank - 1]}`);
        } else {
            const splitPot = Math.floor(this.pot / winners.length);
            let winnersLog = winners.map(winner => `Player ${this.players[winner].id}`);
            winners.forEach(winner => {
                this.players[winner].chips += splitPot;
                updatePlayerChips(this.players[winner], this.players[winner].chips);
            });
            updateActionLog(`${winnersLog.join(", ")} split the pot of ${this.pot} chips, each receiving ${splitPot} chips`);
        }
    }
}