import { getGame } from '@/lib/gomoku';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const game = getGame(id);

    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    return res.status(200).json(game);
}
