
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
//off the top of the deck
function dealFlop(deck) {
    deck.splice(0, 1); // Burn a card
    let flopCards = deck.splice(0, 3); // Deal the flop
    communityCards = communityCards.concat(flopCards); // Add to community cards
    return flopCards;
}

//Simulates Turn and River by burning a card and then taking three
//off the top of the deck
function dealTurnAndRiver(deck) {
    deck.splice(0, 1); 
    return deck.splice(0, 1)[0]; 
}

//Function Shows player what cards they have in their Hand
//Uses card-container div
function displayHand(hand, container) {
    const cardContainer = document.getElementById(container);
    cardContainer.innerHTML = ''; // Clear previous cards

    hand.forEach(function(card) {
        const cardImg = document.createElement('img');
        cardImg.src = `./Images/cards/${card.suit}_${card.rank}.png`; // Adjust the path to match your PNG images
        cardImg.className = 'card';
        cardContainer.appendChild(cardImg);
    });
}

function appendCardToCommunity(card) {
    const communityCardContainer = document.getElementById('community-card-container');
    
    const cardImg = document.createElement('img');
    cardImg.src = `images/cards/${card.suit}_${card.rank}.png`;
    cardImg.className = 'card';
    
    communityCardContainer.appendChild(cardImg);
}


//================== Early game Logic =====================================================
//Deals a two card hand... Not good for actual poker game
function deal2(deck) {
    if (deck.length < 2) {
        throw new Error("Not enough cards in the deck to deal a hand");
    }

    // Take the first two cards from the deck
    const hand = deck.slice(0, 2);

    // Remove the dealt cards from the deck
    deck.splice(0, 2);

    return hand;
}

//Subject to change but this function waits for the page to be loaded and once it is
// it creates a deck and listens for button press which will then start a 2 card hand
document.addEventListener('DOMContentLoaded', function () {
    let deck = createDeck();
    shuffleDeck(deck);
    let communityCards = [];

    document.getElementById('deal-button').addEventListener('click', function() {
        let hand = deal2(deck);
        displayHand(hand, 'card-container');
    });

    document.getElementById('flop-button').addEventListener('click', function() {
        let community = dealFlop(deck);
        displayHand(community, 'community-card-container');
    });

    document.getElementById('turn-button').addEventListener('click', function() {
        let community = dealTurnAndRiver(deck);
        appendCardToCommunity(community);
    });
    document.getElementById('river-button').addEventListener('click', function() {
        let community = dealTurnAndRiver(deck);
        appendCardToCommunity(community);
    });
});

