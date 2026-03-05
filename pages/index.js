import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function fetchGames() {
            try {
                const res = await fetch('/api/games');
                if (res.ok) {
                    const data = await res.json();
                    if (active) setGames(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (active) setLoading(false);
            }
        }

        fetchGames();
        const interval = setInterval(fetchGames, 2000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    function badgeClass(status) {
        if (status === 'playing') return 'badge badge-playing';
        if (status === 'finished') return 'badge badge-finished';
        return 'badge badge-error';
    }

    function statusLabel(status) {
        if (status === 'playing') return '⚔ 激战中';
        if (status === 'finished') return '✦ 已分胜负';
        return '✖ 蛐蛐逃跑了';
    }

    function formatTime(ts) {
        return new Date(ts).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }

    return (
        <>
            <Head>
                <title>赛博蛐蛐斗兽场 — 大语言模型五子棋生死对决</title>
            </Head>

            <div className="container page-fill">
                <section className="hero animate-in">
                    <h1>🦗 赛博蛐蛐斗兽场 🦗</h1>
                    <div className="hero-subtitle">
                        <span>— 大语言模型五子棋对决擂台 —</span>
                    </div>
                    <p>
                        输入两只蛐蛐的召唤咒语（即 API 密钥），<br />
                        坐等看它们在棋盘上你死我活。<br />
                        观战免费，结果不保。
                    </p>
                    <Link href="/new" className="btn btn-primary btn-lg" id="create-new-match">
                        ⚡ 召唤蛐蛐入场
                    </Link>
                </section>

                <section className="games-section animate-in">
                    <div className="section-label">近期厮杀实况</div>

                    {loading && (
                        <div className="empty-state">
                            <p className="cursor">正在扫描擂台...</p>
                        </div>
                    )}

                    {!loading && games.length === 0 && (
                        <div className="empty-state">
                            <span className="empty-state-icon">🦗</span>
                            <p>擂台空空如也，还没有蛐蛐敢上场</p>
                        </div>
                    )}

                    {!loading && games.length > 0 && (
                        <div className="games-grid">
                            {games.map((game) => (
                                <Link
                                    href={`/games/${game.id}`}
                                    key={game.id}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="card card-interactive" id={`game-card-${game.id}`}>
                                        <div className="game-card-header">
                                            <span className={badgeClass(game.status)}>
                                                {statusLabel(game.status)}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                                                #{game.id}
                                            </span>
                                        </div>
                                        <div className="game-card-vs">
                                            <span>🖤 {game.blackModel}</span>
                                            <span className="vs">对战</span>
                                            <span>🤍 {game.whiteModel}</span>
                                        </div>
                                        <div className="game-card-meta">
                                            已厮杀 {game.moveCount} 回合 · {formatTime(game.createdAt)}
                                            {game.winner && game.winner !== 'draw' && ` · 胜者：${game.winner === 'black' ? '黑甲' : '白翎'}`}
                                            {game.winner === 'draw' && ' · 平局收场，两败俱伤'}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
