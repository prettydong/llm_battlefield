import styles from '@/styles/Board.module.css';
import { useEffect, useState } from 'react';

const BOARD_SIZE = 15;
const PADDING = 14;
const CELL_SIZE = 6;
const BOARD_PX = PADDING * 2 + CELL_SIZE * (BOARD_SIZE - 1);

const STAR_POINTS = [
    [3, 3], [3, 7], [3, 11],
    [7, 3], [7, 7], [7, 11],
    [11, 3], [11, 7], [11, 11],
];

function toSvg(col, row) {
    return {
        cx: PADDING + col * CELL_SIZE,
        cy: PADDING + row * CELL_SIZE,
    };
}

/**
 * Read CSS variable values from the document for SVG gradient use.
 * SVG stop elements don't support var() directly.
 */
function useBoardColors() {
    const [colors, setColors] = useState(null);

    useEffect(() => {
        function read() {
            const s = getComputedStyle(document.documentElement);
            setColors({
                boardBgA: s.getPropertyValue('--board-bg-a').trim(),
                boardBgB: s.getPropertyValue('--board-bg-b').trim(),
                boardBorder: s.getPropertyValue('--board-border').trim(),
                stoneBlackA: s.getPropertyValue('--stone-black-a').trim(),
                stoneBlackB: s.getPropertyValue('--stone-black-b').trim(),
                stoneWhiteA: s.getPropertyValue('--stone-white-a').trim(),
                stoneWhiteB: s.getPropertyValue('--stone-white-b').trim(),
                stoneShadowColor: s.getPropertyValue('--stone-shadow-color').trim(),
                stoneShadowOpacity: s.getPropertyValue('--stone-shadow-opacity').trim(),
                dotOnBlack: s.getPropertyValue('--dot-on-black').trim(),
                dotOnWhite: s.getPropertyValue('--dot-on-white').trim(),
            });
        }

        read();

        // Re-read when theme changes
        const observer = new MutationObserver(read);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => observer.disconnect();
    }, []);

    return colors;
}

export default function Board({ board, log, winCoords }) {
    const colors = useBoardColors();

    const lastMove = log
        ? [...log].reverse().find((e) => e.move !== undefined)
        : null;

    const winSet = new Set(
        (winCoords || []).map(([x, y]) => `${x},${y}`)
    );

    // Don't render until we have colors (avoids flash)
    if (!colors) return <div className={styles.boardWrapper} />;

    return (
        <div className={styles.boardWrapper}>
            <svg
                className={styles.boardSvg}
                viewBox={`0 0 ${BOARD_PX} ${BOARD_PX}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.boardBgA} />
                        <stop offset="100%" stopColor={colors.boardBgB} />
                    </linearGradient>

                    <radialGradient id="blackGrad" cx="35%" cy="30%">
                        <stop offset="0%" stopColor={colors.stoneBlackA} />
                        <stop offset="100%" stopColor={colors.stoneBlackB} />
                    </radialGradient>

                    <radialGradient id="whiteGrad" cx="35%" cy="30%">
                        <stop offset="0%" stopColor={colors.stoneWhiteA} />
                        <stop offset="100%" stopColor={colors.stoneWhiteB} />
                    </radialGradient>

                    <filter id="stoneShadow" x="-25%" y="-25%" width="150%" height="150%">
                        <feDropShadow
                            dx="0" dy="0.5" stdDeviation="0.6"
                            floodColor={colors.stoneShadowColor}
                            floodOpacity={colors.stoneShadowOpacity}
                        />
                    </filter>

                    <filter id="winGlow">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* 擂台底色 */}
                <rect
                    x="0" y="0"
                    width={BOARD_PX} height={BOARD_PX}
                    fill="url(#boardBg)"
                    stroke={colors.boardBorder}
                    strokeWidth="1"
                />

                {/* 棋格线 */}
                {Array.from({ length: BOARD_SIZE }, (_, i) => {
                    const pos = PADDING + i * CELL_SIZE;
                    const start = PADDING;
                    const end = PADDING + (BOARD_SIZE - 1) * CELL_SIZE;
                    return (
                        <g key={`grid-${i}`}>
                            <line x1={pos} y1={start} x2={pos} y2={end} className={styles.gridLine} />
                            <line x1={start} y1={pos} x2={end} y2={pos} className={styles.gridLine} />
                        </g>
                    );
                })}

                {/* 星位 */}
                {STAR_POINTS.map(([x, y]) => {
                    const { cx, cy } = toSvg(x, y);
                    return (
                        <rect
                            key={`star-${x}-${y}`}
                            x={cx - 0.9} y={cy - 0.9}
                            width={1.8} height={1.8}
                            className={styles.starPoint}
                        />
                    );
                })}

                {/* 坐标标签 */}
                {Array.from({ length: BOARD_SIZE }, (_, i) => {
                    const pos = PADDING + i * CELL_SIZE;
                    return (
                        <g key={`label-${i}`}>
                            <text x={pos} y={PADDING - 6} className={styles.coordLabel}>{i}</text>
                            <text x={PADDING - 7} y={pos} className={styles.coordLabel}>{i}</text>
                        </g>
                    );
                })}

                {/* 棋子 */}
                {board && board.map((row, y) =>
                    row.map((cell, x) => {
                        if (cell === 0) return null;
                        const { cx, cy } = toSvg(x, y);
                        const isLast = lastMove && lastMove.x === x && lastMove.y === y;
                        const isWin = winSet.has(`${x},${y}`);
                        const cls = [
                            styles.stone,
                            cell === 1 ? styles.stoneBlack : styles.stoneWhite,
                            isLast ? styles.lastMove : '',
                            isWin ? styles.winStone : '',
                        ].filter(Boolean).join(' ');

                        return (
                            <circle
                                key={`s-${x}-${y}`}
                                cx={cx} cy={cy}
                                r={2.6}
                                className={cls}
                                filter={isWin ? 'url(#winGlow)' : 'url(#stoneShadow)'}
                            />
                        );
                    })
                )}

                {/* 最后落子标记 */}
                {lastMove && (() => {
                    const { cx, cy } = toSvg(lastMove.x, lastMove.y);
                    const col = lastMove.player === 'black' ? colors.dotOnBlack : colors.dotOnWhite;
                    return (
                        <rect
                            x={cx - 0.7} y={cy - 0.7}
                            width={1.4} height={1.4}
                            fill={col}
                            opacity={0.9}
                        />
                    );
                })()}
            </svg>
        </div>
    );
}
