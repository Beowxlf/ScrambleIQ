import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { AUTH_CONFIG } from './auth.constants';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined>; method?: string; path?: string; url?: string }>();

    if (this.isPublicHealthRoute(request)) {
      return true;
    }

    const expectedToken = process.env[AUTH_CONFIG.tokenEnvVarName] ?? AUTH_CONFIG.defaultToken;
    const providedToken = this.extractToken(request);

    if (!providedToken || providedToken !== expectedToken) {
      throw new UnauthorizedException('Authentication token is missing or invalid.');
    }

    return true;
  }

  private isPublicHealthRoute(request: { method?: string; path?: string; url?: string }): boolean {
    const requestPath = request.path ?? request.url ?? '';
    return request.method === 'GET' && requestPath.startsWith('/health');
  }

  private extractToken(request: { headers: Record<string, string | string[] | undefined> }): string | null {
    const headerToken = request.headers[AUTH_CONFIG.headerName];

    if (typeof headerToken === 'string' && headerToken.trim().length > 0) {
      return headerToken.trim();
    }

    const authorizationHeader = request.headers.authorization;

    if (typeof authorizationHeader === 'string' && authorizationHeader.startsWith(AUTH_CONFIG.bearerPrefix)) {
      return authorizationHeader.slice(AUTH_CONFIG.bearerPrefix.length).trim();
    }

    return null;
  }
}
