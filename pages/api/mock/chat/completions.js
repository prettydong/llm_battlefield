/**
 * Mock LLM endpoint for testing.
 * Reads the board from the prompt and returns a random valid move.
 */
export default function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const prompt = req.body?.messages?.[0]?.content || '';

    // Parse the board from the prompt to find empty cells
    const emptyCells = [];
    const lines = prompt.split('\n');
    for (const line of lines) {
        // Match board rows like " 7  . . X O . ..."
        const rowMatch = line.match(/^\s*(\d{1,2})\s+([ .XO]+)$/);
        if (rowMatch) {
            const y = parseInt(rowMatch[1], 10);
            const cells = rowMatch[2].trim().split(/\s+/);
            cells.forEach((cell, x) => {
                if (cell === '.') {
                    emptyCells.push({ x, y });
                }
            });
        }
    }

    // Strategy: prefer center-ish cells
    let move;
    if (emptyCells.length === 0) {
        move = { x: 7, y: 7 };
    } else {
        // Sort by distance to center, pick one of the top candidates randomly
        emptyCells.sort((a, b) => {
            const da = Math.abs(a.x - 7) + Math.abs(a.y - 7);
            const db = Math.abs(b.x - 7) + Math.abs(b.y - 7);
            return da - db;
        });
        const topN = Math.min(5, emptyCells.length);
        move = emptyCells[Math.floor(Math.random() * topN)];
    }

    // Simulate a small delay
    setTimeout(() => {
        res.status(200).json({
            id: 'mock-' + Date.now(),
            object: 'chat.completion',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: `(${move.x}, ${move.y})`,
                    },
                    finish_reason: 'stop',
                },
            ],
        });
    }, 200);
}
