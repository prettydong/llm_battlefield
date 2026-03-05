import { useEffect, useState } from 'react';

const VIP_LIST = [
    { name: '蛐蛐王老K', level: 6, badge: '👑', title: '至尊蛐王', color: '#ffd700' },
    { name: '资深蛐蛐饲养员', level: 5, badge: '💎', title: '钻石贵宾', color: '#b9f2ff' },
    { name: '退休象棋大师', level: 4, badge: '🏆', title: '黄金贵宾', color: '#ffcc00' },
    { name: '冠军预测员', level: 3, badge: '🎯', title: '白银贵宾', color: '#c0c0c0' },
    { name: 'AI炼丹师', level: 3, badge: '🧪', title: '白银贵宾', color: '#c0c0c0' },
    { name: '赌狗永不言弃', level: 2, badge: '🎲', title: '青铜贵宾', color: '#cd7f32' },
    { name: '深度学习受害者', level: 2, badge: '🤖', title: '青铜贵宾', color: '#cd7f32' },
    { name: '围棋九段(自封)', level: 1, badge: '♟️', title: '普通贵宾', color: 'var(--text-2)' },
];

const VIP_MESSAGES = [
    '这局我押100蛐蛐币', '黑甲稳赢，不接受反驳', '白翎要发力了',
    '我已经连赢五把了', '大家跟我押就对了', '刚充了648蛐蛐币',
    '今天运气不错', '这步棋我在三秒前就预测到了', '贵宾专属视角真香',
    '有没有人组队押注', '我的蛐蛐币快花完了', '再来一局再来一局',
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function VipSection() {
    const [activeMsg, setActiveMsg] = useState(null);

    // VIP 贵宾随机发言
    useEffect(() => {
        function randomVipMsg() {
            const vip = pick(VIP_LIST.slice(0, 5)); // 高等级的更活跃
            setActiveMsg({
                id: Date.now(),
                viewer: vip,
                text: pick(VIP_MESSAGES),
            });
        }

        randomVipMsg();
        const interval = setInterval(randomVipMsg, 4000 + Math.random() * 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="vip-section">
            <div className="panel-title">▸ 贵宾席 · {VIP_LIST.length}位大佬</div>
            <div className="vip-list">
                {VIP_LIST.map((vip) => (
                    <div key={vip.name} className="vip-item">
                        <span className="vip-badge">{vip.badge}</span>
                        <span className="vip-name" style={{ color: vip.color }}>{vip.name}</span>
                        <span className="vip-level">Lv.{vip.level}</span>
                    </div>
                ))}
            </div>
            {activeMsg && (
                <div className="vip-bubble" key={activeMsg.id}>
                    <span className="vip-bubble-badge">{activeMsg.viewer.badge}</span>
                    <span className="vip-bubble-name" style={{ color: activeMsg.viewer.color }}>
                        {activeMsg.viewer.name}
                    </span>
                    <span className="vip-bubble-text">{activeMsg.text}</span>
                </div>
            )}
        </div>
    );
}
