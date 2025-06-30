// =======================
        // 1. PLAYER FACTORY
        // =======================
        // Creates player objects with name and marker (X or O)
        const Player = (name, marker) => {
            return { name, marker };
        };

        // =======================
        // 2. GAMEBOARD MODULE (IIFE)
        // =======================
        // Manages the game board state and logic
        const Gameboard = (() => {
            let board = ['', '', '', '', '', '', '', '', ''];

            const getBoard = () => board;
            
            const setMark = (index, marker) => {
                if (board[index] === '') {
                    board[index] = marker;
                    return true;
                }
                return false;
            };

            const resetBoard = () => {
                board = ['', '', '', '', '', '', '', '', ''];
            };

            const isFull = () => {
                return board.every(cell => cell !== '');
            };

            const checkWinner = () => {
                const winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                    [0, 4, 8], [2, 4, 6] // diagonals
                ];

                for (let pattern of winPatterns) {
                    const [a, b, c] = pattern;
                    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                        return board[a];
                    }
                }
                return null;
            };

            return { getBoard, setMark, resetBoard, isFull, checkWinner };
        })();

        // =======================
        // 3. GAME CONTROLLER MODULE (IIFE)
        // =======================
        // Controls the game flow and logic
        const GameController = (() => {
            let players = [];
            let currentPlayerIndex = 0;
            let gameActive = false;
            let scores = { player1: 0, player2: 0, ties: 0 };

            const getCurrentPlayer = () => players[currentPlayerIndex];
            
            const switchPlayer = () => {
                currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
            };

            const startGame = () => {
                // Get player names from input fields
                const player1Name = document.getElementById('player1').value || 'Player 1';
                const player2Name = document.getElementById('player2').value || 'Player 2';
                
                // Create player objects
                players = [
                    Player(player1Name, 'X'),
                    Player(player2Name, 'O')
                ];

                // Reset game state
                currentPlayerIndex = 0;
                gameActive = true;
                Gameboard.resetBoard();
                
                // Update display
                DisplayController.updateScoreLabels(player1Name, player2Name);
                DisplayController.updateCurrentPlayer(getCurrentPlayer().name);
                DisplayController.renderBoard();
                DisplayController.clearResult();
                
                console.log('Game started!');
                console.log(`${getCurrentPlayer().name} (${getCurrentPlayer().marker}) goes first`);
            };

            const playTurn = (index) => {
                if (!gameActive) {
                    console.log('Game is not active. Start a new game first!');
                    return;
                }

                const currentPlayer = getCurrentPlayer();
                
                if (Gameboard.setMark(index, currentPlayer.marker)) {
                    console.log(`${currentPlayer.name} placed ${currentPlayer.marker} at position ${index}`);
                    console.log('Current board:', Gameboard.getBoard());
                    
                    // Check for winner
                    const winner = Gameboard.checkWinner();
                    if (winner) {
                        gameActive = false;
                        const winnerName = winner === 'X' ? players[0].name : players[1].name;
                        scores[winner === 'X' ? 'player1' : 'player2']++;
                        DisplayController.displayResult(`${winnerName} wins!`, 'winner');
                        DisplayController.updateScores(scores);
                        console.log(`${winnerName} wins the game!`);
                        return;
                    }
                    
                    // Check for tie
                    if (Gameboard.isFull()) {
                        gameActive = false;
                        scores.ties++;
                        DisplayController.displayResult("It's a tie!", 'tie');
                        DisplayController.updateScores(scores);
                        console.log("It's a tie!");
                        return;
                    }
                    
                    // Switch players
                    switchPlayer();
                    DisplayController.updateCurrentPlayer(getCurrentPlayer().name);
                    DisplayController.renderBoard();
                } else {
                    console.log('That position is already taken!');
                }
            };

            const resetGame = () => {
                scores = { player1: 0, player2: 0, ties: 0 };
                DisplayController.updateScores(scores);
                gameActive = false;
                Gameboard.resetBoard();
                DisplayController.renderBoard();
                DisplayController.clearResult();
                DisplayController.updateCurrentPlayer('Click "Start New Game" to begin!');
                console.log('Game reset!');
            };

            const isGameActive = () => gameActive;

            return { startGame, playTurn, resetGame, isGameActive };
        })();

        // =======================
        // 4. DISPLAY CONTROLLER MODULE (IIFE)
        // =======================
        // Handles all DOM manipulation and display logic
        const DisplayController = (() => {
            const boardElement = document.getElementById('game-board');
            const currentPlayerElement = document.getElementById('current-player');
            const gameResultElement = document.getElementById('game-result');
            const player1ScoreElement = document.getElementById('player1-score');
            const player2ScoreElement = document.getElementById('player2-score');
            const tiesScoreElement = document.getElementById('ties-score');
            const player1LabelElement = document.getElementById('player1-label');
            const player2LabelElement = document.getElementById('player2-label');

            const renderBoard = () => {
                const board = Gameboard.getBoard();
                const cells = document.querySelectorAll('.cell');
                
                cells.forEach((cell, index) => {
                    cell.textContent = board[index];
                    cell.className = 'cell'; // Reset classes
                    
                    if (board[index] !== '') {
                        cell.classList.add('taken');
                        cell.classList.add(board[index].toLowerCase());
                    }
                });
            };

            const updateCurrentPlayer = (playerName) => {
                if (GameController.isGameActive()) {
                    currentPlayerElement.textContent = `${playerName}'s turn`;
                } else {
                    currentPlayerElement.textContent = playerName;
                }
            };

            const displayResult = (message, type) => {
                gameResultElement.textContent = message;
                gameResultElement.className = `game-result ${type}`;
                gameResultElement.classList.remove('hidden');
            };

            const clearResult = () => {
                gameResultElement.classList.add('hidden');
            };

            const updateScores = (scores) => {
                player1ScoreElement.textContent = scores.player1;
                player2ScoreElement.textContent = scores.player2;
                tiesScoreElement.textContent = scores.ties;
            };

            const updateScoreLabels = (player1Name, player2Name) => {
                player1LabelElement.textContent = player1Name;
                player2LabelElement.textContent = player2Name;
            };

            // Add click event listeners to board cells
            const initializeBoard = () => {
                boardElement.addEventListener('click', (e) => {
                    if (e.target.classList.contains('cell')) {
                        const index = parseInt(e.target.dataset.index);
                        GameController.playTurn(index);
                    }
                });
            };

            return { 
                renderBoard, 
                updateCurrentPlayer, 
                displayResult, 
                clearResult, 
                updateScores, 
                updateScoreLabels,
                initializeBoard 
            };
        })();

        // =======================
        // 5. INITIALIZE THE GAME
        // =======================
        // Set up the game when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            DisplayController.initializeBoard();
            DisplayController.renderBoard();
            console.log('=== TIC-TAC-TOE GAME INITIALIZED ===');
            console.log('You can also play in the console!');
            console.log('Commands:');
            console.log('- GameController.startGame() - Start a new game');
            console.log('- GameController.playTurn(index) - Play at position 0-8');
            console.log('- GameController.resetGame() - Reset scores');
        });