import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function NewGame() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [black, setBlack] = useState({ baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', apiKey: '' });
    const [white, setWhite] = useState({ baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', apiKey: '' });

    function validate() {
        const errs = {};
        if (!black.baseUrl.trim()) errs.blackUrl = '黑甲蛐蛐还没找到窝！请填写来源地址';
        if (!black.model.trim()) errs.blackModel = '黑甲蛐蛐品种未定！请填写模型名';
        if (!black.apiKey.trim()) errs.blackKey = '黑甲蛐蛐没有入场凭证！请填写 API Key';
        if (!white.baseUrl.trim()) errs.whiteUrl = '白翎蛐蛐来源不明！请填写来源地址';
        if (!white.model.trim()) errs.whiteModel = '白翎蛐蛐品种未定！请填写模型名';
        if (!white.apiKey.trim()) errs.whiteKey = '白翎蛐蛐没有入场凭证！请填写 API Key';
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const errs = validate();
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSubmitting(true);

        try {
            const res = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ players: { black, white } }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `服务器开溜了：${res.status}`);
            }

            const { gameId } = await res.json();
            router.push(`/games/${gameId}`);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    function fillMock() {
        const mockUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/api/mock`
            : 'http://localhost:3000/api/mock';

        setBlack({ baseUrl: mockUrl, model: '测试蛐蛐甲', apiKey: 'mock' });
        setWhite({ baseUrl: mockUrl, model: '测试蛐蛐乙', apiKey: 'mock' });
        setFieldErrors({});
    }

    // 输入时清除对应字段错误
    function updateBlack(field, value) {
        setBlack(p => ({ ...p, [field]: value }));
        const errKey = field === 'baseUrl'
            ? 'blackUrl'
            : field === 'model'
                ? 'blackModel'
                : field === 'apiKey'
                    ? 'blackKey'
                    : null;
        if (errKey && fieldErrors[errKey]) {
            setFieldErrors(prev => { const n = { ...prev }; delete n[errKey]; return n; });
        }
    }
    function updateWhite(field, value) {
        setWhite(p => ({ ...p, [field]: value }));
        const errKey = field === 'baseUrl'
            ? 'whiteUrl'
            : field === 'model'
                ? 'whiteModel'
                : field === 'apiKey'
                    ? 'whiteKey'
                    : null;
        if (errKey && fieldErrors[errKey]) {
            setFieldErrors(prev => { const n = { ...prev }; delete n[errKey]; return n; });
        }
    }

    return (
        <>
            <Head>
                <title>召唤新蛐蛐 — 赛博蛐蛐斗兽场</title>
            </Head>

            <div className="container page-fill">
                <div className="config-panel animate-in">
                    <h1 className="config-title">🦗 召唤新蛐蛐上场 🦗</h1>
                    <p className="config-subtitle">
                        填写两只蛐蛐的来源地、品种和入场凭证，方可开战。
                    </p>

                    <div style={{ textAlign: 'center', marginBottom: 22 }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={fillMock}
                            id="fill-mock-btn"
                        >
                            🧪 用幽灵蛐蛐测试（无需真实密钥）
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="players-grid">

                            {/* 黑甲战士 */}
                            <div className="card">
                                <div className="player-card-title">
                                    <span className="stone-icon black-stone" />
                                    黑甲战士
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="black-url">▸ 蛐蛐来源（API 地址）</label>
                                    <input
                                        id="black-url"
                                        className={`form-input ${fieldErrors.blackUrl ? 'form-input-error' : ''}`}
                                        type="text"
                                        placeholder="https://api.openai.com/v1"
                                        value={black.baseUrl}
                                        onChange={(e) => updateBlack('baseUrl', e.target.value)}
                                    />
                                    {fieldErrors.blackUrl && <div className="field-error">{fieldErrors.blackUrl}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="black-model">▸ 蛐蛐品种（模型名）</label>
                                    <input
                                        id="black-model"
                                        className={`form-input ${fieldErrors.blackModel ? 'form-input-error' : ''}`}
                                        type="text"
                                        placeholder="gpt-4o"
                                        value={black.model}
                                        onChange={(e) => updateBlack('model', e.target.value)}
                                    />
                                    {fieldErrors.blackModel && <div className="field-error">{fieldErrors.blackModel}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="black-key">▸ 入场凭证（密钥）</label>
                                    <input
                                        id="black-key"
                                        className={`form-input ${fieldErrors.blackKey ? 'form-input-error' : ''}`}
                                        type="password"
                                        placeholder="sk-..."
                                        value={black.apiKey}
                                        onChange={(e) => updateBlack('apiKey', e.target.value)}
                                    />
                                    {fieldErrors.blackKey && <div className="field-error">{fieldErrors.blackKey}</div>}
                                </div>
                            </div>

                            {/* 白翎斗士 */}
                            <div className="card">
                                <div className="player-card-title">
                                    <span className="stone-icon white-stone" />
                                    白翎斗士
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="white-url">▸ 蛐蛐来源（API 地址）</label>
                                    <input
                                        id="white-url"
                                        className={`form-input ${fieldErrors.whiteUrl ? 'form-input-error' : ''}`}
                                        type="text"
                                        placeholder="https://api.deepseek.com/v1"
                                        value={white.baseUrl}
                                        onChange={(e) => updateWhite('baseUrl', e.target.value)}
                                    />
                                    {fieldErrors.whiteUrl && <div className="field-error">{fieldErrors.whiteUrl}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="white-model">▸ 蛐蛐品种（模型名）</label>
                                    <input
                                        id="white-model"
                                        className={`form-input ${fieldErrors.whiteModel ? 'form-input-error' : ''}`}
                                        type="text"
                                        placeholder="deepseek-chat"
                                        value={white.model}
                                        onChange={(e) => updateWhite('model', e.target.value)}
                                    />
                                    {fieldErrors.whiteModel && <div className="field-error">{fieldErrors.whiteModel}</div>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="white-key">▸ 入场凭证（密钥）</label>
                                    <input
                                        id="white-key"
                                        className={`form-input ${fieldErrors.whiteKey ? 'form-input-error' : ''}`}
                                        type="password"
                                        placeholder="sk-..."
                                        value={white.apiKey}
                                        onChange={(e) => updateWhite('apiKey', e.target.value)}
                                    />
                                    {fieldErrors.whiteKey && <div className="field-error">{fieldErrors.whiteKey}</div>}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="error-alert">
                                ⚠ {error}
                            </div>
                        )}

                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={submitting}
                                id="start-clash-btn"
                            >
                                {submitting ? '⏳ 蛐蛐正在入场...' : '⚔ 开始厮杀！'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
