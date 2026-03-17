import { createGame, listGames } from '@/lib/gomoku';
import { runGameLoop } from '@/lib/llm_runner';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { players } = req.body;

        if (
            !players?.black?.baseUrl ||
            !players?.black?.model ||
            !players?.black?.apiKey ||
            !players?.white?.baseUrl ||
            !players?.white?.model ||
            !players?.white?.apiKey
        ) {
            return res.status(400).json({ error: 'Missing player configuration' });
        }

        const game = createGame({ players });

        // Fire-and-forget: start the game loop
        runGameLoop(game.id).catch((err) => {
            console.error(`Game loop error [${game.id}]:`, err);
        });

        return res.status(201).json({ gameId: game.id });
    }

    if (req.method === 'GET') {
        return res.status(200).json(listGames());
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
}
