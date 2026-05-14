import { useState, useEffect, useCallback } from 'react';
import { birdeye } from './lib/birdeye';
import type { TrendingToken, NewToken } from './lib/birdeye';
import './App.css';

function formatNum(n: number): string {
  if (!n || isNaN(n)) return '$—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  return `$${n.toFixed(4)}`;
}

function formatPct(n: number): string {
  if (!n || isNaN(n)) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function TokenRow({ token }: { token: TrendingToken }) {
  const up = (token.price24hChangePercent ?? 0) >= 0;
  return (
    <tr className="token-row">
      <td className="rank">#{token.rank}</td>
      <td className="token-col">
        {token.logoURI && (
          <img src={token.logoURI} alt="" className="token-logo"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <span className="symbol">{token.symbol}</span>
        <span className="name">{token.name}</span>
      </td>
      <td className="mono">{formatNum(token.price)}</td>
      <td className={`mono pct ${up ? 'up' : 'down'}`}>{formatPct(token.price24hChangePercent)}</td>
      <td className="mono">{formatNum(token.volume24h)}</td>
      <td className="mono">{formatNum(token.marketcap)}</td>
    </tr>
  );
}

function NewTokenRow({ token }: { token: NewToken }) {
  const ageMin = Math.floor((Date.now() / 1000 - token.listTime) / 60);
  const ageStr = ageMin < 60 ? `${ageMin}m` : `${Math.floor(ageMin / 60)}h ${ageMin % 60}m`;
  return (
    <tr className="token-row">
      <td className="token-col">
        {token.logoURI && (
          <img src={token.logoURI} alt="" className="token-logo"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <span className="symbol">{token.symbol}</span>
        <span className="name">{token.name}</span>
      </td>
      <td className="mono">{formatNum(token.price)}</td>
      <td className="mono">{formatNum(token.liquidity)}</td>
      <td className="mono age">{ageStr} ago</td>
      <td className="addr">{token.address.slice(0, 8)}…</td>
    </tr>
  );
}

type Tab = 'trending' | 'new';

export default function App() {
  const [tab, setTab] = useState<Tab>('trending');
  const [trending, setTrending] = useState<TrendingToken[]>([]);
  const [newTokens, setNewTokens] = useState<NewToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiCalls, setApiCalls] = useState(0);

  const fetchData = useCallback(async (t: Tab) => {
    setLoading(true);
    setError(null);
    try {
      if (t === 'trending') {
        const data = await birdeye.getTrending(20);
        setTrending(data.tokens ?? []);
      } else {
        const data = await birdeye.getNewListings(20);
        setNewTokens(data.items ?? []);
      }
      setApiCalls(c => c + 1);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(tab);
    const interval = setInterval(() => fetchData(tab), 30000);
    return () => clearInterval(interval);
  }, [tab, fetchData]);

  const hasKey = !!import.meta.env.VITE_BIRDEYE_API_KEY;

  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="logo-icon">⚡</span>
          <h1>SolanaRadar</h1>
          <span className="tag">Powered by Birdeye Data API</span>
        </div>
        <div className="stats">
          {!hasKey && <span className="warn">⚠ No API key</span>}
          <span className="counter">📡 {apiCalls} API calls</span>
          {lastUpdated && <span className="ts">Updated {lastUpdated.toLocaleTimeString()}</span>}
          <span className="refresh">⟳ 30s auto-refresh</span>
          <button className="refresh-btn" onClick={() => fetchData(tab)}>Refresh</button>
        </div>
      </header>

      <nav>
        <button className={tab === 'trending' ? 'active' : ''} onClick={() => setTab('trending')}>🔥 Trending Tokens</button>
        <button className={tab === 'new' ? 'active' : ''} onClick={() => setTab('new')}>🆕 New Listings</button>
      </nav>

      {error && (
        <div className="error">
          ⚠️ {error}
          {!hasKey && <span> — Add <code>VITE_BIRDEYE_API_KEY</code> to <code>.env</code> (<a href="https://bds.birdeye.so" target="_blank" rel="noreferrer">get key</a>)</span>}
        </div>
      )}

      {loading && trending.length === 0 && newTokens.length === 0 && (
        <div className="loading">⏳ Fetching Birdeye data…</div>
      )}

      {tab === 'trending' && trending.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>#</th><th>Token</th><th>Price</th><th>24h %</th><th>Volume 24h</th><th>Market Cap</th>
            </tr>
          </thead>
          <tbody>{trending.map(t => <TokenRow key={t.address} token={t} />)}</tbody>
        </table>
      )}

      {tab === 'new' && newTokens.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Token</th><th>Price</th><th>Liquidity</th><th>Age</th><th>Address</th>
            </tr>
          </thead>
          <tbody>{newTokens.map(t => <NewTokenRow key={t.address} token={t} />)}</tbody>
        </table>
      )}

      <footer>
        <span>Built for <a href="https://superteam.fun/earn/listing/birdeye-data-4-week-bip-competition-sprint-4" target="_blank" rel="noreferrer">Birdeye BIP Sprint 4</a></span>
        <span>Data by <a href="https://bds.birdeye.so" target="_blank" rel="noreferrer">Birdeye Data API</a></span>
        <a href="https://github.com/emil07770/solana-radar" target="_blank" rel="noreferrer">GitHub</a>
        <span className="hashtags">#BirdeyeAPI @birdeye_data</span>
      </footer>
    </div>
  );
}
