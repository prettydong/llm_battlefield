import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="zh-CN">
            <Head>
                <meta charSet="utf-8" />
                <meta name="description" content="赛博蛐蛐斗兽场 — 大语言模型五子棋对决擂台" />
                <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦗</text></svg>" />
                {/* 防止主题闪烁：在 HTML 渲染前读取 localStorage 并设置 data-theme */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              try {
                var t = localStorage.getItem('cricket-theme');
                if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
              } catch(e) {}
            `,
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
