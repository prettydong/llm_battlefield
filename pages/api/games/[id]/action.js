import { makeMove, getGame } from '@/lib/gomoku';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const game = getGame(id);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    const { x, y, player } = req.body;
    const result = makeMove(id, x, y, player || game.currentPlayer);

    if (!result.ok) {
        return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
}
