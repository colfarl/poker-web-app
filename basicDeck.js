//Global variables
hands=[8, 9, 5, 6, 1,
       2, 3, 10, 4, 7];

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

//Shows What Cards Are in Play
function displayHand(hand, containerId) {
    const cardContainer = document.getElementById(containerId);
    cardContainer.innerHTML = ''; // Clear previous cards

    hand.forEach(function(card) {
        const cardImg = document.createElement('img');
        cardImg.src = `./Images/cards/${card.suit}_${card.rank}.png`; // Adjust the path to match your PNG images
        cardImg.className = 'card';
        cardContainer.appendChild(cardImg);
    });
}

function displayWinner(winner) {
    console.log(winner);
    const winningHandDiv = document.getElementById('winner');
    winningHandDiv.innerHTML = ''; // Clear previous content

    // Display text
    const text = document.createElement('div');
    text.innerText = `Player ${winner + 1} wins`;
    winningHandDiv.appendChild(text);  // Append the text to the div
}
//====================== Hand Evaluation Logic ====================================================================================

// Function to get the numerical value of a card
function getCardValue(card) {
    return CardValues[card.rank];
}

function getSuitValue(card) {
    return SuitValues[card.suit];
}

//generate all possible 5 card combinations 
//from a 7 card hand
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
    let bestHandIndex = -1;
    let bestHand = null;

    players.forEach((player, index) => {
        const [rank, score, hand] = evaluateHand(player.hand, communityCards);
        if (rank > bestHandScore || (rank === bestHandScore && score > bestHand[1])) {
            bestHandScore = rank;
            bestHandIndex = index;
            bestHand = [rank, score, hand];
        }
    });

    return bestHandIndex;
}
//================== Early game Logic =============================================================================================
let players = [
    { id: 1, hand: [], type: 'human', chips: 1000 },
    { id: 2, hand: [], type: 'bot', chips: 1000 },
    { id: 3, hand: [], type: 'bot', chips: 1000 },
    { id: 4, hand: [], type: 'bot', chips: 1000 },
    { id: 5, hand: [], type: 'bot', chips: 1000 }
];

function dealHands(deck) {
    players.forEach(player => {
        if (deck.length < 2) {
            throw new Error("Not enough cards in the deck to deal a hand");
        }
        player.hand = deck.splice(0, 2);
    });
}

function botDecision(player) {
    console.log(`Player ${player.id} makes decision.`);
}

function playRound() {
    let deck = createDeck();
    shuffleDeck(deck);
    let communityCards = [];

    //Pre-flop
    dealHands(deck);
    players.forEach(player => {
        if (player.type === 'bot') {
            botDecision(player);
        } else {
            console.log(`Player ${player.id} makes decision.`);
        }
    });
    displayHand(players[0].hand, 'player1');
    displayHand(players[1].hand, 'player2');
    displayHand(players[2].hand, 'player3');
    displayHand(players[3].hand, 'player4');
    displayHand(players[4].hand, 'player5');

    // Deal the flop
    communityCards = dealFlop(deck, communityCards);
    displayHand(communityCards, 'community-cards');
    
    //Flop round of betting
    players.forEach(player => {
        if (player.type === 'bot') {
            botDecision(player);
        } else {
            console.log(`Player ${player.id} makes decision.`);
        }
    });

    //Deal the Turn 
    dealTurnOrRiver(deck, communityCards);
    displayHand(communityCards, 'community-cards');

    //Turn round of betting
    players.forEach(player => {
        if (player.type === 'bot') {
            botDecision(player);
        } else {
            console.log(`Player ${player.id} makes decision.`);
        }
    });

    //Deal river
    dealTurnOrRiver(deck, communityCards);
    displayHand(communityCards, 'community-cards');

    //River round of betting
    players.forEach(player => {
        if (player.type === 'bot') {
            botDecision(player);
        } else {
            console.log(`Player ${player.id} makes decision.`);
        }
    });
    
    //Find Best Hand
    const winner = evaluateAllHands(players, communityCards);
    console.log(winner);
    displayWinner(winner);
}

//Subject to change but this function waits for the page to be loaded and once it is
// it creates a deck and listens for button press which will then start a 2 card hand
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('deal-button').addEventListener('click', function() {
        playRound();
    });
});

