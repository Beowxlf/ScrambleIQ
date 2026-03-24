export type AppRoute =
  | {
      page: 'list';
    }
  | {
      page: 'detail';
      matchId: string;
    }
  | {
      page: 'reports';
    };

export function parseRoute(pathname: string): AppRoute {
  if (pathname === '/') {
    return { page: 'list' };
  }

  if (pathname === '/reports') {
    return { page: 'reports' };
  }

  const detailPathMatch = pathname.match(/^\/matches\/([^/]+)$/);

  if (detailPathMatch) {
    return {
      page: 'detail',
      matchId: decodeURIComponent(detailPathMatch[1]),
    };
  }

  return { page: 'list' };
}

export function navigateTo(pathname: string): void {
  window.history.pushState({}, '', pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
