import { CSSProperties, useEffect, useState } from 'react';

import type { MatchesApi } from '../matches-api';
import { MatchDetailPage } from '../pages/MatchDetailPage';
import { MatchListPage } from '../pages/MatchListPage';
import { navigateTo, parseRoute } from './router';

interface AppShellProps {
  api: MatchesApi;
}

const shellStyles: Record<string, CSSProperties> = {
  page: {
    margin: '0 auto',
    maxWidth: '1100px',
    padding: '1.5rem 1rem 2rem',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#142033',
    lineHeight: 1.4,
  },
  header: {
    borderBottom: '1px solid #d6deea',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
  },
  title: {
    fontSize: '1.6rem',
    margin: 0,
  },
  subtitle: {
    margin: '0.35rem 0 0',
    color: '#44536b',
    fontSize: '0.95rem',
  },
  navList: {
    alignItems: 'center',
    color: '#4d607f',
    display: 'flex',
    gap: '0.35rem',
    listStyle: 'none',
    margin: '0.9rem 0 0',
    padding: 0,
    fontSize: '0.9rem',
  },
  navCurrent: {
    color: '#1e2c45',
    fontWeight: 600,
  },
};

export function AppShell({ api }: AppShellProps) {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const isDetailPage = route.page === 'detail';

  return (
    <div style={shellStyles.page}>
      <header style={shellStyles.header}>
        <h1 style={shellStyles.title}>ScrambleIQ</h1>
        <p style={shellStyles.subtitle}>Coach Workspace: match discovery, setup, and review in one focused workflow.</p>
        <nav aria-label="Primary navigation">
          <ol style={shellStyles.navList}>
            <li style={!isDetailPage ? shellStyles.navCurrent : undefined}>Match List</li>
            <li aria-hidden="true">/</li>
            <li style={isDetailPage ? shellStyles.navCurrent : undefined}>Match Detail</li>
          </ol>
        </nav>
      </header>

      {isDetailPage ? (
        <MatchDetailPage api={api} matchId={route.matchId} />
      ) : (
        <MatchListPage api={api} onOpenMatch={(matchId) => navigateTo(`/matches/${matchId}`)} />
      )}
    </div>
  );
}
