/**
 * Gomoku (五子棋) Core Game Logic
 * In-memory state management — no database dependency.
 */

const { randomUUID } = require('crypto');

/** @type {Map<string, Game>} */
const games = new Map();

const BOARD_SIZE = 15;

/**
 * Create a new game session.
 * @param {{ players: { black: PlayerConfig, white: PlayerConfig } }} config
 */
function createGame(config) {
    const id = randomUUID().slice(0, 8);
    const board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(0)
    );

    const game = {
        id,
        board,
        boardSize: BOARD_SIZE,
        currentPlayer: 'black',
        status: 'playing', // 'playing' | 'finished' | 'error'
        winner: null,
        winCoords: null,
        log: [],
        players: config.players,
        moveCount: 0,
        createdAt: Date.now(),
    };

    games.set(id, game);
    return game;
}

function getGame(id) {
    return games.get(id) || null;
}

function listGames() {
    return Array.from(games.values()).map((g) => ({
        id: g.id,
        status: g.status,
        winner: g.winner,
        moveCount: g.moveCount,
        blackModel: g.players.black.model,
        whiteModel: g.players.white.model,
        createdAt: g.createdAt,
    }));
}

/**
 * Execute a move.
 * @returns {{ ok: boolean, error?: string, winner?: string }}
 */
function makeMove(gameId, x, y, player) {
    const game = games.get(gameId);
    if (!game) return { ok: false, error: 'Game not found' };
    if (game.status !== 'playing') return { ok: false, error: 'Game is not active' };
    if (game.currentPlayer !== player) return { ok: false, error: 'Not your turn' };
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE)
        return { ok: false, error: `Out of bounds: (${x}, ${y})` };
    if (game.board[y][x] !== 0)
        return { ok: false, error: `Cell (${x}, ${y}) is already occupied` };

    const stone = player === 'black' ? 1 : 2;
    game.board[y][x] = stone;
    game.moveCount++;

    const timestamp = new Date().toISOString();
    game.log.push({
        move: game.moveCount,
        player,
        x,
        y,
        timestamp,
    });

    // Check win
    const winCoords = checkWin(game.board, x, y, stone);
    if (winCoords) {
        game.status = 'finished';
        game.winner = player;
        game.winCoords = winCoords;
        game.log.push({ event: 'win', player, timestamp });
        return { ok: true, winner: player };
    }

    // Check draw (board full)
    if (game.moveCount >= BOARD_SIZE * BOARD_SIZE) {
        game.status = 'finished';
        game.winner = 'draw';
        game.log.push({ event: 'draw', timestamp });
        return { ok: true, winner: 'draw' };
    }

    // Switch turns
    game.currentPlayer = player === 'black' ? 'white' : 'black';
    return { ok: true };
}

/**
 * Mark a game as errored.
 */
function markError(gameId, message) {
    const game = games.get(gameId);
    if (!game) return;
    game.status = 'error';
    game.log.push({ event: 'error', message, timestamp: new Date().toISOString() });
}

/**
 * Check if placing stone at (x,y) results in 5-in-a-row.
 * Returns the winning coordinates array or null.
 */
function checkWin(board, x, y, stone) {
    const directions = [
        [1, 0],  // horizontal
        [0, 1],  // vertical
        [1, 1],  // diagonal ↘
        [1, -1], // diagonal ↗
    ];

    for (const [dx, dy] of directions) {
        const coords = [[x, y]];

        // Check forward
        for (let i = 1; i < 5; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
            if (board[ny][nx] !== stone) break;
            coords.push([nx, ny]);
        }

        // Check backward
        for (let i = 1; i < 5; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
            if (board[ny][nx] !== stone) break;
            coords.push([nx, ny]);
        }

        if (coords.length >= 5) return coords;
    }

    return null;
}

/**
 * Render the board as a human-readable string for LLM prompts.
 */
function boardToString(game) {
    const colLabels = '   ' + Array.from({ length: BOARD_SIZE }, (_, i) =>
        String(i).padStart(2)
    ).join(' ');

    const rows = game.board.map((row, y) => {
        const cells = row.map((cell) => {
            if (cell === 0) return ' .';
            if (cell === 1) return ' X';
            return ' O';
        }).join('');
        return String(y).padStart(2) + ' ' + cells;
    });

    return colLabels + '\n' + rows.join('\n');
}

module.exports = {
    createGame,
    getGame,
    listGames,
    makeMove,
    markError,
    boardToString,
    BOARD_SIZE,
};
