import { useState, useEffect, useCallback } from 'react';

const GIFTS = [
    { emoji: '🌹', name: '鲜花', price: 1 },
    { emoji: '🍗', name: '鸡腿', price: 5 },
    { emoji: '🎆', name: '烟花', price: 10 },
    { emoji: '🚀', name: '火箭', price: 50 },
    { emoji: '💎', name: '钻石', price: 100 },
    { emoji: '👑', name: '皇冠', price: 520 },
];

const MOCK_SENDERS = [
    '路过的猫', '赌狗永不言弃', '吃瓜群众甲', '量子叠加态',
    '半夜睡不着', '前排出售瓜子', '冠军预测员', 'GPU燃烧中',
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function GiftPanel({ onGiftSent }) {
    const [counts, setCounts] = useState(() => {
        const init = {};
        GIFTS.forEach((g) => { init[g.name] = 0; });
        return init;
    });

    const [flyGift, setFlyGift] = useState(null);

    const sendGift = useCallback((gift, sender) => {
        setCounts((prev) => ({ ...prev, [gift.name]: prev[gift.name] + 1 }));
        setFlyGift({ ...gift, id: Date.now() });
        setTimeout(() => setFlyGift(null), 1200);
        if (onGiftSent) {
            onGiftSent(sender || '你', gift);
        }
    }, [onGiftSent]);

    // Mock 观众自动送礼
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.35) {
                const gift = Math.random() < 0.6
                    ? GIFTS[0]  // 60% 送鲜花
                    : Math.random() < 0.7
                        ? GIFTS[Math.floor(Math.random() * 3)]
                        : pick(GIFTS);
                sendGift(gift, pick(MOCK_SENDERS));
            }
        }, 3000 + Math.random() * 4000);
        return () => clearInterval(interval);
    }, [sendGift]);

    const totalValue = GIFTS.reduce((sum, g) => sum + g.price * counts[g.name], 0);

    return (
        <div className="gift-section">
            <div className="panel-title">▸ 打赏蛐蛐</div>
            <div className="gift-grid">
                {GIFTS.map((g) => (
                    <button
                        key={g.name}
                        className="gift-btn"
                        onClick={() => sendGift(g, '你')}
                        title={`${g.name} (${g.price}蛐蛐币)`}
                    >
                        <span className="gift-emoji">{g.emoji}</span>
                        <span className="gift-name">{g.name}</span>
                        {counts[g.name] > 0 && (
                            <span className="gift-count">x{counts[g.name]}</span>
                        )}
                    </button>
                ))}
            </div>
            {totalValue > 0 && (
                <div className="gift-total">
                    已收到 {totalValue} 蛐蛐币
                </div>
            )}
            {/* 飘礼物动画 */}
            {flyGift && (
                <div className="gift-fly" key={flyGift.id}>
                    {flyGift.emoji}
                </div>
            )}
        </div>
    );
}
