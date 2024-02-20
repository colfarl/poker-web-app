//============================================Deck Operations====================================================
//Creates a deck of 52 standard cards
//Cards are stored in a list as (rank, suit)
export function createDeck() {
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
export function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

//Simulates A Flop by burning a card and then taking three
//off the top of the deck and adding them to community cards
export function dealFlop(deck, communityCards) {
    deck.splice(0, 1); 
    let flopCards = deck.splice(0, 3); 
    return communityCards.concat(flopCards); 
}

//Simulates Turn and River by burning a card and then taking three
//off the top of the deck
export function dealTurnOrRiver(deck, communityCards) {
    deck.splice(0, 1); 
    let card = deck.splice(0, 1)[0];
    communityCards.push(card); 
    return communityCards;
}