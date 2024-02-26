//=====================================UI Functions=======================================================
//Shows What Cards a particular player has
//cards in hand are {rank, suit} player id is an int [0,5]
export function displayHand(hand, playerId) {
    const cardContainer = document.querySelector(`#player${playerId} .player-cards`);
    cardContainer.innerHTML = ''; // Clear previous cards

    hand.forEach(function(card) {
        const cardImg = document.createElement('img');
        cardImg.src = `./Images/cards/${card.suit}_${card.rank}.png`; 
        cardImg.className = 'card';
        cardContainer.appendChild(cardImg);
    });
}

export function updatePotTotal(pot) {
    const potDisplay = document.getElementById('potDisplay');
    potDisplay.innerText = `Pot: ${pot}`;
}

export function updatePlayerChips(player, newChipTotal) {
    const playerElement = document.getElementById(`player${player.id}`);
    playerElement.setAttribute('data-chips', newChipTotal);
}

export function updateActionLog(message) {
    const log = document.getElementById('action-log');
    const newAction = document.createElement('p');
    newAction.textContent = message;
    log.appendChild(newAction); // Append the new message as a separate paragraph
    log.scrollTop = log.scrollHeight; // Scroll to the bottom of the log
}

export function updateMinRaise(minRaise) {
    document.getElementById('raiseSlider').min = minRaise;
    const raiseAmountLabel = document.getElementById('raiseAmountLabel');
    raiseAmountLabel.textContent = `Raise Amount: ${minRaise}`;
}

//Displays Community Cards
export function displayCommunity(hand) {
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
export function displayFaceDown(hand, playerId) {
    const cardContainer = document.querySelector(`#player${playerId} .player-cards`);
    cardContainer.innerHTML = ''; // Clear previous cards

    hand.forEach(function(card) {
        const cardImg = document.createElement('img');
        cardImg.src = `./Images/cards/card_back.png`; 
        cardImg.className = 'card';
        cardContainer.appendChild(cardImg);
    });
}

export function displayGameEndOptions() {
    document.getElementById('stop-playing-button').style.display = 'block';
    document.getElementById('next-game-button').style.display = 'block';
}

export function initializeGame() {
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

export function inProgressUI() {
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

export function displayPlayerProfits(gameManager) {
    const profitsContainer = document.getElementById('player-profits');
    profitsContainer.innerHTML = '';
    gameManager.players.forEach(player => {
        const profit = player.chips + player.buyIns;
        const playerProfitElement = document.createElement('div');
        playerProfitElement.innerText = `Player ${player.id}: Profit ${profit} chips`;
        profitsContainer.appendChild(playerProfitElement);
    });
    profitsContainer.style.display = 'block';
}
