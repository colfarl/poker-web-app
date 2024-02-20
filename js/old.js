//===================================Global variables===============================

hands=[8, 9, 5, 6, 1,
       2, 3, 10, 4, 7];

handRank = [ "High Card", "Pair", "Two Pair", "3 of a Kind", "Straight", "Flush", "Full House","Four of a Kind", "Straight Flush" , "Royal Flush"];

const CardValues = {
    '2':2,
    '3':3,
    '4':4,
    '5':5,
    '6':6,
    '7':7,
    '8':8,
    '9':9,
    '10':10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14
};

const SuitValues = {
    'spades':1,
    'clubs':2,
    'hearts':4,
    'diamonds':8
};

let players = [
    { id: 1, hand: [], type: 'human',chips:50000, currentBet: 0, isInGame: true, hasActed: false, isAllIn: false },
    { id: 2, hand: [], type: 'bot', chips: 50000, currentBet: 0, isInGame: true, hasActed: false, isAllIn: false },
    { id: 3, hand: [], type: 'bot', chips: 50000, currentBet: 0, isInGame: true, hasActed: false, isAllIn: false },
    { id: 4, hand: [], type: 'bot', chips: 50000, currentBet: 0, isInGame: true, hasActed: false, isAllIn: false },
    { id: 5, hand: [], type: 'bot', chips: 50000, currentBet: 0, isInGame: true, hasActed: false, isAllIn: false }
];

let pot = 0;
let highestBet = 0;
let currentStage = 'pre-flop'; 
let gameState = 'notStarted';
let smallBlind = 25;
let bigBlind = 50;
let dealerPosition = 0;
let smallBlindPosition = (dealerPosition + 1) % players.length;
let bigBlindPosition = (dealerPosition + 2) % players.length;

//============================================Deck Operations====================================================
//Creates a deck of 52 standard cards
//Cards are stored in a list as (rank, suit)
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];

    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ rank, suit });
        }
    }
    return deck;
}

//Shuffles a deck of Cards Using the Fisher Yates Algorithm
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

//Simulates A Flop by burning a card and then taking three
//off the top of the deck and adding them to community cards
function dealFlop(deck, communityCards) {
    deck.splice(0, 1); 
    let flopCards = deck.splice(0, 3); 
    return communityCards.concat(flopCards); 
}

//Simulates Turn and River by burning a card and then taking three
//off the top of the deck
function dealTurnOrRiver(deck, communityCards) {
    deck.splice(0, 1); 
    let card = deck.splice(0, 1)[0];
    communityCards.push(card); 
    return communityCards;
}

//=====================================UI Functions=======================================================
//Shows What Cards a particular player has
//cards in hand are {rank, suit} player id is an int [0,5]
function displayHand(hand, playerId) {
    const cardContainer = document.querySelector(`#player${playerId} .player-cards`);
    cardContainer.innerHTML = ''; // Clear previous cards

    hand.forEach(function(card) {
        const cardImg = document.createElement('img');
        cardImg.src = `./Images/cards/${card.suit}_${card.rank}.png`; 
        cardImg.className = 'card';
        cardContainer.appendChild(cardImg);
    });
}

function updatePotTotal() {
    const potDisplay = document.getElementById('potDisplay');
    potDisplay.innerText = `Pot: ${pot}`;
}

function updatePlayerChips(player, newChipTotal) {
    const playerElement = document.getElementById(`player${player.id}`);
    playerElement.setAttribute('data-chips', newChipTotal);
}

function updateActionLog(message) {
    const log = document.getElementById('action-log');
    const newAction = document.createElement('p');
    newAction.textContent = message;
    log.appendChild(newAction); // Append the new message as a separate paragraph
    log.scrollTop = log.scrollHeight; // Scroll to the bottom of the log
}

//Displays Community Cards
function displayCommunity(hand) {
    document.getElementById('community-cards').style.display = 'flex';
    const cardContainer = document.getElementById('community-cards');
    cardContainer.innerHTML = ''; 

    hand.forEach(function(card) {
        const cardImg = document.createElement('img');
        cardImg.src = `./Images/cards/${card.suit}_${card.rank}.png`;
        cardImg.className = 'card';
        cardContainer.appendChild(cardImg);
    });
}

//Shows cards back of players
//uses same logic as display hand except it uses a card back as image
function displayFaceDown(hand, playerId) {
    const cardContainer = document.querySelector(`#player${playerId} .player-cards`);
    cardContainer.innerHTML = ''; // Clear previous cards

    hand.forEach(function(card) {
        const cardImg = document.createElement('img');
        cardImg.src = `./Images/cards/card_back.png`; 
        cardImg.className = 'card';
        cardContainer.appendChild(cardImg);
    });
}

function displayGameEndOptions() {
    document.getElementById('stop-playing-button').style.display = 'block';
    document.getElementById('next-game-button').style.display = 'block';
}

function initializeGame() {
    // Hide betting buttons at the start
    document.querySelectorAll('.betting-options button').forEach(button => {
        button.style.display = 'none';
    });

    // Hide the raise slider and label
    document.getElementById('raiseSlider').style.display = 'none';
    document.getElementById('raiseAmountLabel').style.display = 'none';
    document.getElementById('potDisplay').style.display = 'none';
    document.getElementById('player1').style.display = 'none';
    document.getElementById('action-log').style.display = 'none';

    // Show only the 'Deal' button initially
    document.getElementById('start-button').style.display = 'block';
}

function inProgressUI() {
    // Hide the 'Start' button
    document.getElementById('start-button').style.display = 'none';
    document.querySelectorAll('.betting-options button').forEach(button => {
        button.style.display = 'inline-block'; // or 'block', depending on your layout
    });

    // Show the raise slider and label
    document.getElementById('raiseSlider').style.display = 'inline-block'; // or 'block'
    document.getElementById('raiseAmountLabel').style.display = 'flex';
    document.getElementById('potDisplay').style.display = 'flex';
    document.getElementById('player1').style.display = 'flex';
    document.getElementById('action-log').style.display = 'block';
}

function displayGameEndOptions() {
    document.getElementById('stop-playing-button').style.display = 'block';
    document.getElementById('next-game-button').style.display = 'block';
}
//====================== Hand Evaluation Logic ====================================================================================

// Function to get the numerical value of a card
function getCardValue(card) {
    return CardValues[card.rank];
}

// Maps suit to bit value for evaluation
function getSuitValue(card) {
    return SuitValues[card.suit];
}

function isSpecialStraight(ranks) {
    var sortedRanks = ranks.slice().sort(function(a, b) { return a - b; });
    return sortedRanks[0] === 2 && sortedRanks[1] === 3 && 
           sortedRanks[2] === 4 && sortedRanks[3] === 5 && sortedRanks[4] === 14;
}

//generates combinations of size k from array
function generateCombinations(array, k) {
    let result = [];
    let n = array.length;

    function recurse(start, combo) {
        if (combo.length === k) {
            result.push(combo.map(index => array[index - 1]));
            return;
        }
        for (let i = start; i <= n; i++) {
            combo.push(i);
            recurse(i + 1, combo);
            combo.pop();
        }
    }

    recurse(1, []);
    return result;
}

// Calculates the Rank of a 5 card Poker hand using bit manipulations.
// adapted slightly from https://www.codeproject.com/Articles/569271/A-Poker-hand-analyzer-in-JavaScript-using-bit-math
function rankPokerHand(cs, ss) {
    var v, i, o, s = 1<<cs[0]|1<<cs[1]|1<<cs[2]|1<<cs[3]|1<<cs[4];
    for (i=-1, v=o=0; i<5; i++, o=Math.pow(2,cs[i]*4)) {v += o*((v/o&15)+1);}
    v = v % 15 - ((s/(s&-s) == 31) || (s == 0x403c) ? 3 : 1);
    v -= (ss[0] == (ss[1]|ss[2]|ss[3]|ss[4])) * ((s == 0x7c00) ? -5 : 1);
    return hands[v];
}

//From:https://jsfiddle.net/subskybox/r4mSF/
//renamed for readability
function getHandValue(cardRanks) {
    var sortedRanks = cardRanks.slice(),
      rankCounts = {},
      index;

  // Count the occurrences of each card rank
  for (index = 0; index < 5; index++) {
    var rank = sortedRanks[index];
    rankCounts[rank] = (rankCounts[rank] >= 1) ? rankCounts[rank] + 1 : 1;
  }


  // Sort the card ranks based on their frequency and value
  sortedRanks.sort(function(rank1, rank2) {
    var countCompare = rankCounts[rank2] - rankCounts[rank1];
    var rankCompare = rank2 - rank1;
    return countCompare === 0 ? rankCompare : countCompare;
  });

  if (isSpecialStraight(sortedRanks)) {
    return 0;
  }
  // Encode the sorted ranks into a single integer for comparison
  return (sortedRanks[0] << 16) | (sortedRanks[1] << 12) | 
         (sortedRanks[2] << 8) | (sortedRanks[3] << 4) | sortedRanks[4];
}

function findBestHand(combinations) {
    var bestRank = 0;
    var currScore = 0;
    var bestHand;

    for(var i = 0; i < combinations.length; ++i){
        var hand = combinations[i].map(card => {
            return {
                rank: getCardValue(card),
                suit: getSuitValue(card)
            };
        });
        var cs = hand.map(card => card.rank);
        var ss = hand.map(card => card.suit);
        var currentRank = rankPokerHand(cs, ss);
        if (currentRank > bestRank) {
            bestRank = currentRank;
            bestHand = combinations[i];
            currScore = getHandValue(cs);
        }
        else if(currentRank === bestRank && currScore < getHandValue(cs)){
            bestRank = currentRank;
            bestHand = combinations[i];
            currScore = getHandValue(cs);
        }
    }
    return [bestRank, currScore, bestHand];
}

//Determines best possible hand a player can have by using utility functions above
function evaluateHand(playerHand, communityCards) {
    let combinedHand = playerHand.concat(communityCards);
    let possibleHands = generateCombinations(combinedHand, 5);
    let bestHand = findBestHand(possibleHands);
    return bestHand;
}

function evaluateAllHands(players, communityCards) {
    let bestHandScore = 0;
    let winners = []; 

    players.forEach((player, index) => {
        if (player.isInGame) {
            const [rank, score, hand] = evaluateHand(player.hand, communityCards);

            // Compare the rank and score to determine the best hand or ties
            if (rank > bestHandScore) {
                bestHandScore = rank;
                winners = [index]; 
            } else if (rank === bestHandScore) {
                if (score > (winners.length > 0 ? evaluateHand(players[winners[0]].hand, communityCards)[1] : 0)) {
                    winners = [index];
                } else if (score === evaluateHand(players[winners[0]].hand, communityCards)[1]) {
                    winners.push(index); 
                }
            }
        }
    });

    return winners;
}
//================== Betting Logic ====================================================================


function isValidAction(player, action) {
    switch (action) {
        case 'call':
            return canCall(player);
        case 'check':
            return canCheck(player);
        case 'fold':
            return true; // Fold is always a valid action
        case 'allin':
            return true; // All-in is always valid if the player has chips
        default:
            return false;
    }
}

function check(player) {
    if (highestBet === 0 || player.currentBet === highestBet) {
        updateActionLog(`Player ${player.id} checks`);
    } else {
        console.error('Cannot check, there is a bet already.');
    }
}

let resolvePlayerAction;

function waitForPlayerDecision() {
    return new Promise((resolve) => {
        resolvePlayerAction = resolve;
    });
}

function playerAction(action) {
    console.log(`Player decides to ${action}`);
    resolvePlayerAction(action);
}

async function handlePlayerAction(player, action) {
    if (isValidAction(player, action)) {
        switch (action) {
            case 'call':
                call(player);
                break;
            case 'fold':
                fold(player);
                break;
            case 'check':
                check(player);
                break;
            case 'allin':
                bet(player, player.chips);
                break;
            default:
                console.error(`Unknown action: ${action}`);
        }
        resolvePlayerAction(action); // Resolve the promise only if the action is valid
    } else {
        updateActionLog(`Invalid action: ${action}`);
        const newAction = await waitForPlayerDecision();
        await handlePlayerAction(player, newAction);
    }
}

function resetAction(){
    players.forEach(player =>{
        if(player.isInGame){
            player.hasActed = false;
        }
    })
}

function allPlayersActed() {
    return players.every(player => !player.isInGame || player.hasActed);
}

function highestBetEqualized() {
    return players.every(player => !player.isInGame || player.currentBet === highestBet);
}

async function bettingRound() {
    let bettingContinues = true;
    let currentPlayerIndex = (bigBlindPosition + 1) % players.length;
    if(currentStage !== 'pre-flop'){
        currentPlayerIndex = smallBlindPosition % players.length;
    }

    while (bettingContinues) {
        const player = players[currentPlayerIndex];

        if (player.isInGame) {
            if (player.type === 'bot') {
                botDecision(player, false);
            } else {
                const action = await waitForPlayerDecision();
                if(action !== 'raise'){
                    await handlePlayerAction(player, action);
                }
                player.hasActed = true; // Mark that the player has taken an action
            }
            if (player.isAllIn) {
                await allInBettingRound(currentPlayerIndex);
                break;
            }
        }

        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

        // Check if it's time to end the betting round
        if (allPlayersActed() && highestBetEqualized()) {
            bettingContinues = false;
        }
    }
}

async function allInBettingRound(allInPlayerIndex) {
    let currentPlayerIndex = (allInPlayerIndex + 1) % players.length;

    while (currentPlayerIndex !== allInPlayerIndex) {
        let player = players[currentPlayerIndex];

        if (player.type === 'bot') {
            botDecision(player, true);
        } else {
            const action = await waitForPlayerDecision();
            await handlePlayerAction(player, action);
            player.hasActed = true;
        }
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }
}

function resetGame() {
    players.forEach(player => {
        player.hand = [];
        player.currentBet = 0;
        player.isInGame = true;
        player.isAllIn = false;
    });
    pot = 0;
    highestBet = 0;
    currentStage = 'pre-flop';
}

function awardWinner(winners, communityCards) {
    if (winners.length === 1) {
        // Single winner
        const winner = winners[0];
        players[winner].chips += pot;
        updatePlayerChips(players[winner], players[winner].chips);
        const [rank, _score, _hand] = evaluateHand(players[winner].hand, communityCards);
        updateActionLog(`Player ${players[winner].id} wins the pot of ${pot} chips with a ${handRank[rank -1]}`);
    } else {
        // Multiple winners - chop the pot
        const splitPot = Math.floor(pot / winners.length);
        let winnersLog = winners.map(winner => `Player ${players[winner].id}`);
        winners.forEach(winner => {
            players[winner].chips += splitPot;
            updatePlayerChips(players[winner], players[winner].chips);
        });
        updateActionLog(`${winnersLog.join(", ")} split the pot of ${pot} chips, each receiving ${splitPot} chips`);
    }
}

//================== Game Logic =============================================================================================
function updateGameState(newState) {
    gameState = newState;
    switch(gameState) {
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

async function nextGame() {
    document.getElementById('next-game-button').style.display = 'none';
    document.getElementById('stop-playing-button').style.display = 'none';
    document.getElementById('community-cards').style.display = 'none';

    updateGameState('inProgress');
    rotateDealer();
    updatePotTotal();
    await playRound();
    updateGameState('finished');
}

//Deal two cards to each player by taking the next two available cards 
//off the top of the deck
function dealHands(deck) {
    players.forEach(player => {
        if (deck.length < 2) {
            throw new Error("Not enough cards in the deck to deal a hand");
        }
        player.hand = deck.splice(0, 2);
    });
}

//NOT IMPLEMENTED
function botDecision(player, _isAllInRound) {
    if(highestBet === 0){
        check(player);
    }
    else{
        call(player);
    }
    player.hasActed = true;
}

function postBlinds() {
    bet(players[smallBlindPosition], smallBlind);
    bet(players[bigBlindPosition], bigBlind);
    players[bigBlindPosition].hasActed = true;
    players[smallBlindPosition].hasActed = true;
    updateActionLog(`Player ${players[smallBlindPosition].id} bets ${smallBlind} (small blind)`);
    updateActionLog(`Player ${players[bigBlindPosition].id} bets ${bigBlind} (big blind)`);
}

function rotateDealer() {
    dealerPosition = (dealerPosition + 1) % players.length;
    smallBlindPosition = (dealerPosition + 1) % players.length;
    bigBlindPosition = (dealerPosition + 2) % players.length;
}

function resetBetting(){
    highestBet = 0;
    players.forEach(player => {
        player.currentBet = 0;
    });
}

function isAnyPlayerAllIn() {
    return players.some(player => player.isAllIn);
}

//basic Round logic
async function playRound() {
    updateActionLog('------Pre-Flop-------');
    let deck = createDeck();
    shuffleDeck(deck);
    let communityCards = [];

    //Pre-flop
    dealHands(deck);
    
    //Show player hand - hide all other hands
    displayHand(players[0].hand, 1); 
    displayFaceDown(players[1].hand, 2);
    displayFaceDown(players[2].hand, 3);
    displayFaceDown(players[3].hand, 4);
    displayFaceDown(players[4].hand, 5);
    postBlinds();

    await bettingRound();

    // Deal the flop
    communityCards = dealFlop(deck, communityCards);
    displayCommunity(communityCards);
    
    
    //Flop round of betting
    currentStage = "flop";
    resetAction();
    resetBetting();
    updateActionLog('--------Flop---------');
    
    if(!isAnyPlayerAllIn()){
        await bettingRound();
    }
    

    //Deal the Turn 
    dealTurnOrRiver(deck, communityCards);
    displayCommunity(communityCards);


    //Turn round of betting
    updateActionLog('--------Turn---------');
    currentStage = "turn";
    resetAction();
    resetBetting();

    if(!isAnyPlayerAllIn()){
        await bettingRound();
    }

    //Deal river
    dealTurnOrRiver(deck, communityCards);
    displayCommunity(communityCards);

    //River round of betting
    updateActionLog('--------River---------');
    currentStage = "river";
    resetAction();
    resetBetting();

    if(!isAnyPlayerAllIn()){
        await bettingRound();
    }
    
    //Find Best Hand
    const winners = evaluateAllHands(players, communityCards);

    //end display
    displayHand(players[1].hand, 2);
    displayHand(players[2].hand, 3);
    displayHand(players[3].hand, 4);
    displayHand(players[4].hand, 5);
    awardWinner(winners, communityCards);
    resetGame();
}

//=================================Event Listeners======================================
window.onload = initializeGame();

//End of game actions
document.getElementById('next-game-button').addEventListener('click', nextGame);

document.getElementById('player1-call').addEventListener('click', () => playerAction('call'));
document.getElementById('player1-raise').addEventListener('click', () => {
    const raiseAmount = parseInt(document.getElementById('raiseSlider').value || '0');

    // Perform the raise action
    const currentPlayer = players[0];
    raise(currentPlayer, raiseAmount);

    // Reset the slider to the minimum value after raising
    document.getElementById('raiseSlider').value = document.getElementById('raiseSlider').min;
    document.getElementById('raiseAmountLabel').innerText = `Raise Amount: ${document.getElementById('raiseSlider').min}`;
    resolvePlayerAction('raise');
});

document.getElementById('player1-fold').addEventListener('click', () => playerAction('fold'));
document.getElementById('player1-check').addEventListener('click', () => playerAction('check'));
document.getElementById('player1-allin').addEventListener('click', () => playerAction('allin'));

document.getElementById('raiseSlider').addEventListener('input', () => {
    const raiseAmount = document.getElementById('raiseSlider').value;
    document.getElementById('raiseAmountLabel').innerText = `Raise Amount: ${raiseAmount}`;
});

document.getElementById('start-button').addEventListener('click', async function() {
    updateGameState('inProgress');
    await playRound();
    updateGameState('finished');
});

//
document.querySelectorAll('.player').forEach(player => {
    player.addEventListener('mouseenter', (event) => {
        const chips = player.dataset.chips; 

        // Set the text for the pop-up
        const chipPopup = document.getElementById('chipPopup');
        chipPopup.innerText = `Chips: ${chips}`;

        // Get the position of the player container
        const rect = player.getBoundingClientRect();

        // Adjust the position of the popup based on the player's position
        chipPopup.style.top = `${window.scrollY + rect.top - chipPopup.offsetHeight - 5}px`; // 5px above the player
        chipPopup.style.left = `${window.scrollX + rect.left + (rect.width - chipPopup.offsetWidth) / 2}px`; // horizontally centered relative to the player

        // Show the pop-up
        chipPopup.style.display = 'block';
    });

    player.addEventListener('mouseleave', () => {
        // Hide the pop-up
        document.getElementById('chipPopup').style.display = 'none';
    });
});