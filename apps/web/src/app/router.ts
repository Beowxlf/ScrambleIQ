export type AppRoute =
  | {
      page: 'list';
    }
  | {
      page: 'detail';
      matchId: string;
    };

export function parseRoute(pathname: string): AppRoute {
  if (pathname === '/') {
    return { page: 'list' };
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
