 document.addEventListener('DOMContentLoaded', () => {
            const scoreEl = document.getElementById('score');
            const triesEl = document.getElementById('tries');
            const stageEl = document.getElementById('stage');
            const picksLeftEl = document.getElementById('picks-left');
            const gameBoard = document.getElementById('game-board');
            const controls = document.getElementById('controls');
            const startButton = document.getElementById('start-button');
            const modal = document.getElementById('modal');
            const modalTitle = document.getElementById('modal-title');
            const modalText = document.getElementById('modal-text');
            const finalScoreEl = document.getElementById('final-score');
            const playAgainButton = document.getElementById('play-again-button');
            const rulesButton = document.getElementById('rules-button');
            const rulesModal = document.getElementById('rules-modal');
            const closeRulesButton = document.getElementById('close-rules-button');

            const STAGES = [
                { cards: 9, picks: 3 }, { cards: 7, picks: 3 }, { cards: 5, picks: 2 },
                { cards: 4, picks: 1 }, { cards: 5, picks: 2 }, { cards: 7, picks: 2 },
                { cards: 3, picks: 1 }, { cards: 2, picks: 1 }
            ];
            const MAX_TRIES = 4;
            const VISIBLE_STAGES = 5;

            const CARD_LOGO_URL = 'sentient.png';
            const BOOM_LOGO_URL = 'boom.jpg';

            let totalScore = 0;
            let currentTries = MAX_TRIES;
            let currentStageIndex = 0;
            let picksRemaining = 0;
            let gameActive = false;

            function initGame() {
                totalScore = 0;
                currentTries = MAX_TRIES;
                currentStageIndex = 0;
                gameActive = true;
                modal.classList.add('hidden');
                controls.innerHTML = '';
                setupGameBoard();
            }

            function setupGameBoard() {
                gameBoard.innerHTML = '';
                for (let i = 0; i < VISIBLE_STAGES; i++) {
                    const stageIndex = currentStageIndex + i;
                    if (stageIndex < STAGES.length) {
                        const stageConfig = STAGES[stageIndex];
                        const isLocked = i > 0;
                        const stageRow = createStageRow(stageIndex, stageConfig, isLocked);
                        gameBoard.appendChild(stageRow);
                    }
                }
                updateStageState();
            }
            
            function createStageRow(stageIndex, stageConfig, isLocked) {
                const stageRow = document.createElement('div');
                stageRow.className = 'stage-row';
                stageRow.id = `stage-row-${stageIndex}`;
                
                const numBooms = stageConfig.cards > 4 ? 2 : 1;
                const cardContents = createCardContents(stageConfig.cards, numBooms);
                
                for(let i = 0; i < stageConfig.cards; i++) {
                    const card = createCardElement(cardContents[i], isLocked);
                    stageRow.appendChild(card);
                }
                return stageRow;
            }

            function createCardContents(totalCards, numBooms) {
                const contents = [];
                for (let i = 0; i < numBooms; i++) { contents.push('boom'); }
                for (let i = 0; i < totalCards - numBooms; i++) { contents.push(Math.floor(Math.random() * 9) + 1); }
                return contents.sort(() => Math.random() - 0.5);
            }

            function createCardElement(content, isLocked) {
                const card = document.createElement('div');
                card.className = `card w-16 h-20 sm:w-24 sm:h-32 relative rounded-lg ${isLocked ? 'locked' : ''}`;
                card.dataset.content = content;

                const lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400 opacity-50"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
                const cardBackLogo = `<img src="${CARD_LOGO_URL}" alt="Card Logo" class="w-full h-full object-contain p-2" onerror="this.style.display='none'">`;

                card.innerHTML = `
                    <div class="card-face card-front flex items-center justify-center">
                        ${isLocked ? lockIcon : cardBackLogo}
                    </div>
                    <div class="card-face card-back ${content === 'boom' ? 'boom' : 'points'}">
                        ${content === 'boom' 
                            ? `<img src="${BOOM_LOGO_URL}" alt="Boom!" class="w-full h-full object-cover rounded-md" onerror="this.parentElement.innerHTML='BOOM'">` 
                            : content}
                    </div>
                `;

                if (!isLocked) {
                    card.addEventListener('click', () => handleCardClick(card));
                }
                return card;
            }
            
            function updateStageState() {
                const stageConfig = STAGES[currentStageIndex];
                picksRemaining = stageConfig.picks;
                updateUI();
            }

            function handleCardClick(card) {
                if (!gameActive || card.classList.contains('flipped') || currentTries <= 0 || picksRemaining === 0) {
                    return;
                }

                card.classList.add('flipped');
                const content = card.dataset.content;

                if (content === 'boom') {
                    currentTries--;
                    document.getElementById('game-container').classList.add('animate-shake');
                    setTimeout(() => document.getElementById('game-container').classList.remove('animate-shake'), 500);
                    if (currentTries <= 0) endGame(false);
                } else {
                    totalScore += parseInt(content);
                    picksRemaining--;
                }

                updateUI();

                if (picksRemaining === 0 && currentTries > 0) {
                    gameActive = false; // Pause the game to let the user decide
                    handleStageClear();
                }
            }
            
            function handleStageClear() {
                const clearedStageRow = document.getElementById(`stage-row-${currentStageIndex}`);
                if (clearedStageRow) {
                    clearedStageRow.classList.add('cleared');
                }

                // If stage is 3 or higher (index 2+), show decision buttons. Otherwise, auto-advance.
                if (currentStageIndex >= 2) {
                    setTimeout(() => {
                        controls.innerHTML = ''; 
                        const nextStageButton = document.createElement('button');
                        nextStageButton.textContent = 'Next Stage';
                        nextStageButton.className = 'game-button';
                        nextStageButton.onclick = advanceToNextStage;
                        controls.appendChild(nextStageButton);

                        const giveUpButton = document.createElement('button');
                        giveUpButton.textContent = 'Give Up & Keep Score';
                        giveUpButton.className = 'game-button give-up-button ml-4';
                        giveUpButton.onclick = () => endGame(true);
                        controls.appendChild(giveUpButton);
                    }, 500);
                } else {
                    // Auto-advance for early stages
                    setTimeout(advanceToNextStage, 500);
                }
            }

            function advanceToNextStage() {
                const clearedStageRow = document.getElementById(`stage-row-${currentStageIndex}`);
                if (clearedStageRow) {
                    // Remove the row after its fade-out animation finishes
                    setTimeout(() => clearedStageRow.remove(), 500);
                }

                currentStageIndex++;
                
                if (currentStageIndex >= STAGES.length) {
                    endGame(true, true); // Player won the game
                    return;
                }

                // Add the next upcoming stage to the top of the pyramid
                const nextStageIndex = currentStageIndex + VISIBLE_STAGES - 1;
                if (nextStageIndex < STAGES.length) {
                    const stageConfig = STAGES[nextStageIndex];
                    const stageRow = createStageRow(nextStageIndex, stageConfig, true);
                    gameBoard.appendChild(stageRow);
                }

                // Unlock the new active stage
                const newActiveRow = document.getElementById(`stage-row-${currentStageIndex}`);
                if (newActiveRow) {
                    const cards = newActiveRow.querySelectorAll('.card');
                    cards.forEach(card => {
                        card.classList.remove('locked');
                        card.querySelector('.card-front').innerHTML = `<img src="${CARD_LOGO_URL}" alt="Card Logo" class="w-full h-full object-contain p-2" onerror="this.style.display='none'">`;
                        
                        // Re-create the card to properly set the event listener
                        const newCard = card.cloneNode(true);
                        card.parentNode.replaceChild(newCard, card);
                        newCard.addEventListener('click', () => handleCardClick(newCard));
                    });
                }
                
                updateStageState();
                controls.innerHTML = ''; // Clear the decision buttons
                gameActive = true; // Resume the game for the new stage
            }

            function endGame(didGiveUp, isWinner = false) {
                gameActive = false;
                if (isWinner) {
                    modalTitle.textContent = 'You Win!';
                    modalText.textContent = 'You cleared all the stages! Incredible luck!';
                    finalScoreEl.textContent = totalScore;
                } else if (didGiveUp) {
                    modalTitle.textContent = 'You Cashed Out!';
                    modalText.textContent = 'Smart move! You kept all your points.';
                    finalScoreEl.textContent = totalScore;
                } else {
                    modalTitle.textContent = 'Game Over';
                    modalText.textContent = 'Your luck ran out! Your score has been halved.';
                    finalScoreEl.textContent = Math.floor(totalScore / 2);
                }
                modal.classList.remove('hidden');
            }

            function updateUI() {
                scoreEl.textContent = totalScore;
                triesEl.textContent = `${currentTries}/${MAX_TRIES}`;
                stageEl.textContent = currentStageIndex + 1;
                picksLeftEl.textContent = picksRemaining;
            }

            startButton.addEventListener('click', () => {
                startButton.style.display = 'none';
                initGame();
            });

            playAgainButton.addEventListener('click', () => {
                initGame();
            });

                rulesButton.addEventListener('click', () => {
                rulesModal.classList.remove('hidden');
            });

            closeRulesButton.addEventListener('click', () => {
                rulesModal.classList.add('hidden');
            });

            const styleSheet = document.createElement("style");
            styleSheet.type = "text/css";
            styleSheet.innerText = `
                @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
                .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }`;
            document.head.appendChild(styleSheet);
        });