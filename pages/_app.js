import '@/styles/globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const saved = localStorage.getItem('cricket-theme');
        if (saved === 'light' || saved === 'dark') {
            setTheme(saved);
            document.documentElement.setAttribute('data-theme', saved);
        }
    }, []);

    function toggleTheme() {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('cricket-theme', next);
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link href="/" className="navbar-brand">
                        <span>🦗</span>
                        赛博蛐蛐斗兽场
                    </Link>
                    <div className="navbar-links">
                        <Link href="/" className="navbar-link">擂台大厅</Link>
                        <Link href="/new" className="navbar-link">召唤蛐蛐</Link>
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
                            aria-label="切换主题"
                        >
                            {theme === 'dark' ? '☀' : '🌙'}
                        </button>
                    </div>
                </div>
            </nav>
            <Component {...pageProps} />
        </>
    );
}
