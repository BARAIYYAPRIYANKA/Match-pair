import { createGridFragment } from "./index.js";

const rows = 4;
const cols = 4;
const symbols = [
    '🍇', '🍉', '🚗', '🍌', '🏠', '🥭', '🍎', '🐯', '🍒', '🍓', 
    '🐵', '🥝', '🍿', '🏀', '🎱', '🐻', '🍜', '🍢', '🎓', '🍤'
];
const delay = 2000;
const positions = Array.from({ length: rows * cols }, (_, i) => i);

const gameState = {
    activeTiles: [],
    attempts: 0,
    randomizedSymbols: [],
    isResetInProgress: false,
    timeoutIdx: null,
};

const gameFrontEl = document.querySelector('.game-front');
const gameBackEl = document.querySelector('.game-back');
const outputEl = document.querySelector('output');
const restartBtn = document.querySelector('.restart');

// Fisher-Yates shuffle
const getRandomSymbols = (rows, cols, items) => {
    const selectedSymbols = Array.from(
        { length: (rows * cols) / 2 },
        () => items[Math.floor(Math.random() * items.length)]
    );
    const totalSymbols = [...selectedSymbols, ...selectedSymbols];
    
    for (let i = totalSymbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [totalSymbols[i], totalSymbols[j]] = [totalSymbols[j], totalSymbols[i]];
    }
    
    return totalSymbols;
};

const toggleClassOnElements = (elements, className, add = true) => {
    elements.forEach(pos => {
        gameFrontEl.children[pos].classList.toggle(className, add);
        gameBackEl.children[pos].classList.toggle(className, add);
    });
};

const startGame = async (init = false) => {
    if (gameState.isResetInProgress) return;

    gameState.randomizedSymbols = [];
    gameState.activeTiles = [];
    gameState.attempts = 0;
    gameState.isResetInProgress = true;
    outputEl.textContent = gameState.attempts;

    if (!init) {
        gameFrontEl.classList.add('reset');
        gameBackEl.classList.add('reset');

        toggleClassOnElements(positions, 'active', false);
        toggleClassOnElements(positions, 'match', false);

        await new Promise(r => setTimeout(r, delay / 2));
    }

    gameState.randomizedSymbols = getRandomSymbols(rows, cols, symbols);
    gameBackEl.childNodes.forEach((el, idx) => {
        el.textContent = gameState.randomizedSymbols[idx];
    });

    gameFrontEl.classList.remove('reset');
    gameBackEl.classList.remove('reset');
    gameState.isResetInProgress = false;
};

gameFrontEl.appendChild(createGridFragment(rows, cols, { type: 'button', className: 'tile' }));
gameBackEl.appendChild(createGridFragment(rows, cols, { type: 'button', className: 'tile back-tile' }));

gameFrontEl.addEventListener('click', e => {
    const idx = e.target.dataset.idx;

    if (idx == null || gameState.isResetInProgress || e.target.classList.contains('match')) return;

    gameState.attempts++;

    if (gameState.activeTiles.length === 2) {
        if (gameState.timeoutIdx) clearTimeout(gameState.timeoutIdx);
        toggleClassOnElements(gameState.activeTiles, 'active', false);
        gameState.activeTiles = [];
    }

    gameState.activeTiles.push(idx);

    if (gameState.activeTiles.length === 2) {
        if (gameState.randomizedSymbols[gameState.activeTiles[0]] === gameState.randomizedSymbols[gameState.activeTiles[1]]) {
            toggleClassOnElements(gameState.activeTiles, 'active', false);
            toggleClassOnElements(gameState.activeTiles, 'match', true);
        }

        gameState.timeoutIdx = setTimeout(() => {
            toggleClassOnElements(gameState.activeTiles, 'active', false);
            gameState.activeTiles = [];
        }, delay);
    }

    e.target.classList.add('active');
    gameBackEl.children[idx].classList.add('active');
    outputEl.textContent = gameState.attempts;
});

restartBtn.addEventListener('click', () => startGame());
startGame(true);
