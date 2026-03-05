/**
 * LLM Runner — drives the game loop by sending board state to LLMs
 * and parsing their move responses.
 */

const { getGame, makeMove, markError, boardToString } = require('./gomoku');

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

/**
 * Build the chat prompt for the current player.
 */
function buildPrompt(game) {
    const player = game.currentPlayer;
    const symbol = player === 'black' ? 'X' : 'O';
    const opponent = player === 'black' ? 'O' : 'X';
    const boardStr = boardToString(game);

    const lastMoves = game.log
        .filter((e) => e.move)
        .slice(-5)
        .map((e) => `  ${e.player === 'black' ? 'X' : 'O'} -> (${e.x}, ${e.y})`)
        .join('\n');

    return `You are playing Gomoku (五子棋) on a 15×15 board.
You are "${symbol}" (${player}). Your opponent is "${opponent}".
The board uses 0-indexed coordinates: x is column (0-14, left to right), y is row (0-14, top to bottom).
"." = empty, "X" = black, "O" = white.

Current board:
${boardStr}

Recent moves:
${lastMoves || '  (none yet — you go first!)'}

It is your turn. Analyze the board and respond with ONLY your move in this exact format:
(x, y)

For example: (7, 7)

Think about both offense (building your own 5-in-a-row) and defense (blocking opponent). Respond with just the coordinates.`;
}

/**
 * Call the OpenAI-compatible chat completions API.
 */
async function callLLM(config, prompt) {
    const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 50,
            }),
            signal: controller.signal,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || '';
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Parse LLM response to extract (x, y) coordinates.
 */
function parseMove(response) {
    // Match patterns like (7, 7) or (7,7) or 7, 7 etc.
    const match = response.match(/\(?\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)?/);
    if (!match) return null;
    return { x: parseInt(match[1], 10), y: parseInt(match[2], 10) };
}

/**
 * Run the full game loop asynchronously.
 * This is fire-and-forget — it mutates game state in memory.
 */
async function runGameLoop(gameId) {
    // Small initial delay so the API response can return first
    await new Promise((r) => setTimeout(r, 500));

    while (true) {
        const game = getGame(gameId);
        if (!game || game.status !== 'playing') break;

        const player = game.currentPlayer;
        const config = game.players[player];
        const prompt = buildPrompt(game);

        let success = false;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                game.log.push({
                    event: 'llm_call',
                    player,
                    model: config.model,
                    attempt,
                    timestamp: new Date().toISOString(),
                });

                const response = await callLLM(config, prompt);

                game.log.push({
                    event: 'llm_response',
                    player,
                    response: response.slice(0, 200),
                    timestamp: new Date().toISOString(),
                });

                const parsed = parseMove(response);
                if (!parsed) {
                    game.log.push({
                        event: 'parse_error',
                        player,
                        response: response.slice(0, 200),
                        attempt,
                        timestamp: new Date().toISOString(),
                    });
                    continue;
                }

                const result = makeMove(gameId, parsed.x, parsed.y, player);
                if (!result.ok) {
                    game.log.push({
                        event: 'invalid_move',
                        player,
                        x: parsed.x,
                        y: parsed.y,
                        error: result.error,
                        attempt,
                        timestamp: new Date().toISOString(),
                    });
                    continue;
                }

                success = true;
                break;
            } catch (err) {
                game.log.push({
                    event: 'api_error',
                    player,
                    error: err.message,
                    attempt,
                    timestamp: new Date().toISOString(),
                });

                if (err.name === 'AbortError') {
                    game.log.push({
                        event: 'timeout',
                        player,
                        attempt,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
        }

        if (!success) {
            markError(gameId, `${player} (${config.model}) failed after ${MAX_RETRIES} attempts`);
            break;
        }

        // Small delay between turns for readability
        await new Promise((r) => setTimeout(r, 300));
    }
}

module.exports = { runGameLoop };
