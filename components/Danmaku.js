import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

// 观众名字池
const VIEWERS = [
    '蛐蛐王老K', '棋盘扫地僧', '路过的猫', '隔壁老王',
    '吃瓜群众甲', '资深蛐蛐饲养员', 'AI炼丹师', '退休象棋大师',
    '围棋九段(自封)', '深度学习受害者', '梯度下降中...', '半夜睡不着',
    '赌狗永不言弃', '黑甲死忠粉', '白翎后援会', '量子叠加态',
    '冠军预测员', '反向指标大师', '理性分析(瞎猜)', '来凑热闹的',
    '蛐蛐界梅西', '按F致敬', '前排出售瓜子', '抢沙发',
    '五子棋世界冠军', '挂机看戏', '弹幕重要参与者', 'GPU燃烧中',
];

// 闲聊语句池
const IDLE_CHAT = [
    '前排前排！', '来了来了', '终于蹲到直播了',
    '刚到，谁赢了？', '瓜子饮料矿泉水~', '有人吗',
    '66666', '哈哈哈哈哈', '啊这...', 'nb',
    '前排留名', '开始了吗', '主播说话啊',
    '今天押谁赢', '感觉要翻盘', '别急 让子弹飞一会儿',
    '大家好', '打卡', '有人押注吗',
    '第一次看蛐蛐斗棋', '这比赛真刺激', '我赌五毛',
    '太精彩了!', '求黑甲赢！', '白翎加油！',
    '刷一波666', '请开始你的表演', '我已经看了三个小时了',
    '有没有高手分析一下', '我感觉局势有变', 'flag立住了吗',
];

// 落子反应
const MOVE_REACTIONS = [
    '这步稳', '高！实在是高！', '看不懂但大受震撼',
    '啊这一步...', '好手！', '妙啊', '？？？',
    '什么棋啊这是', '这步有讲究', '暗藏杀机',
    '我也想到了这步（才怪）', '严重怀疑在乱下', '稳如老狗',
    '这不是我教它的', '教科书级别的操作', '开始发力了',
    '要变天了', '这步有点草率吧', '经典操作',
    '它在想什么？', '一步封神', '感觉有陷阱',
    '这位置我也会下', '居然下这里？', '我寻思也是',
    '绝了', '牛', '好家伙',
];

// 胜负反应
const WIN_REACTIONS = [
    '赢了赢了赢了！', '我就说吧！我早说了！',
    'GG', '太强了 恐怖如斯', '不愧是冠军选手',
    '输的那个别灰心 下次一定', '恭喜恭喜！',
    '我押对了！！！', '精彩绝伦的一局', '再来一局！',
    '对手:我不服', '果然实力碾压', '就这？就这？',
];

// 错误反应
const ERROR_REACTIONS = [
    '蛐蛐跑了哈哈哈', '这是掀桌子了？', '网线被咬断了吧',
    '翻车了翻车了', '笑死我了', '果然AI也会摆烂',
    '逃跑也算一种策略', '蛐蛐：我不玩了', '这算认输吗',
];

// 送礼反应
const GIFT_REACTIONS = [
    '谢谢老板！', '大哥大气！', '土豪666', '打赏走一波！',
    '有钱人的快乐', '沾沾喜气', '我也想送但我没币',
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomColor() {
    const hues = [30, 60, 90, 120, 180, 200, 270, 300, 330, 45, 150];
    const h = pick(hues);
    return `hsl(${h}, 70%, 65%)`;
}

const Danmaku = forwardRef(function Danmaku({ game }, ref) {
    const [messages, setMessages] = useState([]);
    const containerRef = useRef(null);
    const lastMoveCountRef = useRef(0);
    const lastStatusRef = useRef('playing');
    const idCounterRef = useRef(0);

    const addMsg = useCallback((text, opts = {}) => {
        const id = idCounterRef.current++;
        const msg = {
            id,
            viewer: opts.viewer || pick(VIEWERS),
            text,
            color: opts.color || randomColor(),
            timestamp: Date.now(),
            isGift: opts.isGift || false,
        };
        setMessages((prev) => {
            const next = [...prev, msg];
            return next.length > 80 ? next.slice(-80) : next;
        });
    }, []);

    // 暴露 addGiftMsg 给父组件
    useImperativeHandle(ref, () => ({
        addGiftMsg(sender, gift) {
            addMsg(`送出了 ${gift.emoji} ${gift.name}！`, {
                viewer: sender,
                color: '#ffd700',
                isGift: true,
            });
            // 概率触发观众反应
            if (Math.random() < 0.5) {
                setTimeout(() => {
                    addMsg(pick(GIFT_REACTIONS));
                }, 300 + Math.random() * 500);
            }
        },
    }), [addMsg]);

    // 闲聊定时器
    useEffect(() => {
        setTimeout(() => addMsg(pick(IDLE_CHAT)), 300);
        setTimeout(() => addMsg(pick(IDLE_CHAT)), 800);
        setTimeout(() => addMsg(pick(IDLE_CHAT)), 1500);

        const interval = setInterval(() => {
            if (Math.random() < 0.7) {
                addMsg(pick(IDLE_CHAT));
            }
        }, 2000 + Math.random() * 3000);

        return () => clearInterval(interval);
    }, [addMsg]);

    // 游戏事件反应
    useEffect(() => {
        if (!game) return;
        const moveCount = game.moveCount || 0;
        const status = game.status;

        if (moveCount > lastMoveCountRef.current) {
            const diff = moveCount - lastMoveCountRef.current;
            lastMoveCountRef.current = moveCount;

            for (let i = 0; i < Math.min(diff, 3); i++) {
                const delay = i * 400 + Math.random() * 600;
                setTimeout(() => {
                    addMsg(pick(MOVE_REACTIONS));
                    if (Math.random() < 0.4) {
                        setTimeout(() => addMsg(pick(MOVE_REACTIONS)), 300 + Math.random() * 500);
                    }
                }, delay);
            }
        }

        if (status !== lastStatusRef.current) {
            lastStatusRef.current = status;
            if (status === 'finished') {
                setTimeout(() => addMsg(pick(WIN_REACTIONS)), 200);
                setTimeout(() => addMsg(pick(WIN_REACTIONS)), 700);
                setTimeout(() => addMsg(pick(WIN_REACTIONS)), 1200);
                setTimeout(() => addMsg('66666'), 1500);
                setTimeout(() => addMsg('恭喜恭喜！'), 1800);
            } else if (status === 'error') {
                setTimeout(() => addMsg(pick(ERROR_REACTIONS)), 200);
                setTimeout(() => addMsg(pick(ERROR_REACTIONS)), 800);
            }
        }
    }, [game, addMsg]);

    // 自动滚动
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages.length]);

    return (
        <div className="danmaku-panel">
            <div className="danmaku-header">
                <span>▸ 弹幕区 · 直播间观众 ({VIEWERS.length}人在线)</span>
                <span className="danmaku-live">● 直播中</span>
            </div>
            <div className="danmaku-messages" ref={containerRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`danmaku-msg ${msg.isGift ? 'danmaku-gift' : ''}`}>
                        <span className="danmaku-viewer" style={{ color: msg.color }}>
                            {msg.viewer}
                        </span>
                        <span className={`danmaku-text ${msg.isGift ? 'danmaku-gift-text' : ''}`}>
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default Danmaku;
