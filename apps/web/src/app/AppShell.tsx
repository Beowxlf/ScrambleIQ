import { useEffect, useState } from 'react';

import type { ReportingApi } from '../api/reportingApi';
import type { MatchesApi } from '../matches-api';
import { MatchDetailPage } from '../pages/MatchDetailPage';
import { MatchListPage } from '../pages/MatchListPage';
import { ReportsPage } from '../pages/ReportsPage';
import { navigateTo, parseRoute } from './router';

interface AppShellProps {
  api: MatchesApi;
  reportingApi: ReportingApi;
}

export function AppShell({ api, reportingApi }: AppShellProps) {
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

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1>ScrambleIQ</h1>
        <p className="muted">Coach workspace for discovery, setup, and review.</p>
        <nav aria-label="Primary navigation" className="button-row">
          <button type="button" onClick={() => navigateTo('/')} aria-current={route.page === 'list' ? 'page' : undefined}>
            Match List
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/reports')}
            aria-current={route.page === 'reports' ? 'page' : undefined}
          >
            Reports
          </button>
          {route.page === 'detail' ? (
            <button type="button" aria-current="page" disabled>
              Match Detail
            </button>
          ) : null}
        </nav>
      </header>

      {route.page === 'detail' ? (
        <MatchDetailPage api={api} matchId={route.matchId} />
      ) : null}

      {route.page === 'reports' ? <ReportsPage reportingApi={reportingApi} /> : null}

      {route.page === 'list' ? (
        <MatchListPage api={api} onOpenMatch={(matchId) => navigateTo(`/matches/${matchId}`)} />
      ) : null}
    </div>
  );
}
