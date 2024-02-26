import { initializeGame, displayPlayerProfits } from './modules/ui.js';
import { GameManager } from './modules/gameManager.js';


const gameManager = new GameManager();
gameManager.addPlayer(1, 'human', 5000);
gameManager.addPlayer(2, 'bot', 5000);
gameManager.addPlayer(3, 'bot', 5000);
gameManager.addPlayer(4, 'bot', 5000);
gameManager.addPlayer(5, 'bot', 5000);
gameManager.addPlayer(6, 'bot', 5000);
gameManager.addPlayer(7, 'bot', 5000);
gameManager.addPlayer(8, 'bot', 5000);
gameManager.addPlayer(9, 'bot', 5000);

// Initialize the game when the window loads
window.onload = () => {
    initializeGame();
};

//End of game actions
document.getElementById('next-game-button').addEventListener('click', () => gameManager.nextGame());

document.getElementById('player1-call').addEventListener('click', () => gameManager.playerAction('call'));

document.getElementById('player1-raise').addEventListener('click', () => {
    const raiseAmount = parseInt(document.getElementById('raiseSlider').value || '0');

    // Perform the raise action
    const currentPlayer = gameManager.players[0];
    gameManager.raise(currentPlayer, raiseAmount);

    // Reset the slider to the minimum value after raising
    document.getElementById('raiseSlider').value = document.getElementById('raiseSlider').min;
    document.getElementById('raiseAmountLabel').innerText = `Raise Amount: ${document.getElementById('raiseSlider').min}`;
    gameManager.playerAction('raise');
});

document.getElementById('player1-fold').addEventListener('click', () => gameManager.playerAction('fold'));
document.getElementById('player1-check').addEventListener('click', () => gameManager.playerAction('check'));
document.getElementById('player1-allin').addEventListener('click', () => gameManager.playerAction('allin'));

document.getElementById('raiseSlider').addEventListener('input', () => {
    const raiseAmount = document.getElementById('raiseSlider').value;
    document.getElementById('raiseAmountLabel').innerText = `Raise Amount: ${raiseAmount}`;
});

document.getElementById('start-button').addEventListener('click', async function() {
    gameManager.updateGameState('inProgress');
    await gameManager.playRound();
    gameManager.updateGameState('finished');
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
        document.getElementById('chipPopup').style.display = 'none';
    });
});

document.getElementById('stop-playing-button').addEventListener('click', () => {
    document.querySelectorAll('.betting-options button').forEach(button => {
        button.style.display = 'none';
    });

    // Hide the raise slider and label
    document.getElementById('raiseSlider').style.display = 'none';
    document.getElementById('raiseAmountLabel').style.display = 'none';
    document.getElementById('potDisplay').style.display = 'none';
    document.getElementById('player1').style.display = 'none';
    document.getElementById('player2').style.display = 'none';
    document.getElementById('player3').style.display = 'none';
    document.getElementById('player4').style.display = 'none';
    document.getElementById('player5').style.display = 'none';
    document.getElementById('player6').style.display = 'none';
    document.getElementById('player7').style.display = 'none';
    document.getElementById('player8').style.display = 'none';
    document.getElementById('player9').style.display = 'none';
    document.getElementById('stop-playing-button').style.display = 'none';
    document.getElementById('next-game-button').style.display = 'none';
    document.getElementById('community-cards').style.display = 'none';
    document.getElementById('action-log').style.display = 'none';
    displayPlayerProfits(gameManager);
});