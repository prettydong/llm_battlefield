import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Board from '@/components/Board';
import Danmaku from '@/components/Danmaku';
import GiftPanel from '@/components/GiftPanel';
import VipSection from '@/components/VipSection';

export default function GameView() {
    const router = useRouter();
    const { id } = router.query;
    const [game, setGame] = useState(null);
    const [error, setError] = useState('');
    const logEndRef = useRef(null);
    const danmakuRef = useRef(null);

    useEffect(() => {
        if (!id) return;
        let active = true;

        async function fetchGame() {
            try {
                const res = await fetch(`/api/games/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (active) setGame(data);
                } else if (res.status === 404) {
                    if (active) setError('找不到这场对决，蛐蛐都跑了。');
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetchGame();
        const interval = setInterval(fetchGame, 1500);
        return () => { active = false; clearInterval(interval); };
    }, [id]);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [game?.log?.length]);

    if (error) {
        return (
            <div className="page-fill">
                <div className="empty-state" style={{ paddingTop: 80 }}>
                    <span className="empty-state-icon">🦗</span>
                    <p>{error}</p>
                    <a href="/" className="btn btn-secondary">← 回到擂台大厅</a>
                </div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="page-fill">
                <div className="empty-state" style={{ paddingTop: 80 }}>
                    <p className="cursor">正在呼唤蛐蛐</p>
                </div>
            </div>
        );
    }

    const blackModel = game.players?.black?.model || '黑甲战士';
    const whiteModel = game.players?.white?.model || '白翎斗士';
    const moveCount = game.log?.filter((e) => e.move).length || 0;
    const isPlaying = game.status === 'playing';
    const currentLabel = game.currentPlayer === 'black' ? '黑甲' : '白翎';

    function fmt(entry, i) {
        if (entry.move) {
            const b = entry.player === 'black';
            return (
                <div key={i} className={`log-entry ${b ? 'move-black' : 'move-white'}`}>
                    #{entry.move} {b ? '⬤' : '○'} {b ? blackModel : whiteModel} ({entry.x},{entry.y})
                </div>
            );
        }
        if (entry.event === 'win') {
            return (
                <div key={i} className="log-entry event-win">
                    🏆 {entry.player === 'black' ? blackModel : whiteModel} 获胜！
                </div>
            );
        }
        if (entry.event === 'draw') {
            return <div key={i} className="log-entry event-win">🤝 两败俱伤，平局</div>;
        }
        if (entry.event === 'error') {
            return <div key={i} className="log-entry event-error">💀 {entry.message}</div>;
        }
        if (entry.event === 'llm_call') {
            return (
                <div key={i} className="log-entry">
                    📡 {entry.model}{entry.attempt > 1 ? `（第${entry.attempt}次）` : ''}
                </div>
            );
        }
        if (entry.event === 'llm_response') {
            return <div key={i} className="log-entry">💬 {entry.response}</div>;
        }
        if (entry.event === 'parse_error') {
            return <div key={i} className="log-entry event-error">😵 &quot;{entry.response}&quot;</div>;
        }
        if (entry.event === 'invalid_move') {
            return <div key={i} className="log-entry event-error">🚫 ({entry.x},{entry.y}) {entry.error}</div>;
        }
        if (entry.event === 'api_error') {
            return <div key={i} className="log-entry event-error">🔌 {entry.error}</div>;
        }
        return null;
    }

    return (
        <>
            <Head>
                <title>{blackModel} 对战 {whiteModel} — 赛博蛐蛐斗兽场</title>
            </Head>

            <div className="game-view">
                {/* 三栏布局 */}
                <div className="game-layout">
                    {/* 左侧：选手面板 */}
                    <div className="game-sidebar">
                        <div className="panel-title">▸ 选手</div>

                        <div className={`player-info-card ${game.currentPlayer === 'black' && isPlaying ? 'active' : ''}`}>
                            <div className="player-info-row">
                                <span className="stone-icon black-stone" />
                                <span className="player-info-name">黑甲战士</span>
                            </div>
                            <div className="player-info-model">{blackModel}</div>
                        </div>

                        <div className="vs-divider">对战</div>

                        <div className={`player-info-card ${game.currentPlayer === 'white' && isPlaying ? 'active' : ''}`}>
                            <div className="player-info-row">
                                <span className="stone-icon white-stone" />
                                <span className="player-info-name">白翎斗士</span>
                            </div>
                            <div className="player-info-model">{whiteModel}</div>
                        </div>

                        <div className="panel-title">▸ 战况</div>
                        <div className="stats-section">
                            <div className="stat-row">
                                <span className="stat-label">状态</span>
                                <span className="stat-value" style={{ color: isPlaying ? 'var(--green-0)' : 'var(--amber)' }}>
                                    {isPlaying ? '激战中' : game.status === 'finished' ? '已结束' : '异常'}
                                </span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">回合</span>
                                <span className="stat-value">{moveCount}</span>
                            </div>
                            {game.winner && game.winner !== 'draw' && (
                                <div className="stat-row">
                                    <span className="stat-label">胜者</span>
                                    <span className="stat-value" style={{ color: 'var(--amber)' }}>
                                        {game.winner === 'black' ? '黑甲' : '白翎'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 中间：棋盘 */}
                    <div className="board-container">
                        <Board
                            board={game.board}
                            log={game.log}
                            winCoords={game.winCoords}
                        />
                    </div>

                    {/* 右侧：实况日志 */}
                    <div className="log-panel">
                        <div className="log-panel-header">▸ 厮杀实况 [{moveCount}手]</div>
                        <div className="log-entries">
                            {game.log?.map((entry, i) => fmt(entry, i))}
                            <div ref={logEndRef} />
                        </div>
                    </div>
                </div>

                {/* 底部三栏：送礼 | 弹幕 | 贵宾 */}
                <div className="bottom-bar">
                    <GiftPanel onGiftSent={(sender, gift) => {
                        if (danmakuRef.current) {
                            danmakuRef.current.addGiftMsg(sender, gift);
                        }
                    }} />
                    <Danmaku ref={danmakuRef} game={game} />
                    <VipSection />
                </div>

                {/* 底部状态栏 */}
                <div className="game-statusbar">
                    <span className="sb-item">
                        🦗 {game.id}
                    </span>
                    <span className="sb-item">
                        {isPlaying ? (
                            <><span className="sb-active">● 激战中</span> — 等待{currentLabel}出手</>
                        ) : (
                            game.status === 'finished' ? '✦ 对决结束' : '✖ 异常终止'
                        )}
                    </span>
                    <span className="sb-item sb-right">
                        {moveCount}手 · {blackModel} vs {whiteModel}
                    </span>
                </div>
            </div>
        </>
    );
}
