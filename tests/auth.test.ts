import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Auth & Route Protection Logic', () => {
  // 1. Error Mapping Test
  describe('Error Mapping', () => {
    const mapAuthError = (codeOrMessage: string): string => {
      switch (codeOrMessage) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
        case 'invalid_credentials':
        case 'Invalid login credentials':
          return 'Invalid email or password. Please verify your credentials and try again.';
        case 'auth/not-authorized':
        case 'not_authorized':
          return 'Not authorized: Your account does not have administrative privileges.';
        case 'auth/too-many-requests':
        case 'over_request_rate_limit':
          return 'Too many failed login attempts. Access is temporarily locked. Please wait a few minutes before trying again.';
        case 'auth/user-disabled':
          return 'This administrative account has been deactivated.';
        case 'auth/network-request-failed':
          return 'Network connection error. Please verify your internet connectivity.';
        default:
          return 'Authentication failed. Please verify your credentials and try again.';
      }
    };

    it('maps Supabase invalid credentials to generic safe message', () => {
      assert.equal(
        mapAuthError('invalid_credentials'),
        'Invalid email or password. Please verify your credentials and try again.'
      );
      assert.equal(
        mapAuthError('Invalid login credentials'),
        'Invalid email or password. Please verify your credentials and try again.'
      );
    });

    it('maps non-admin authorization denial to descriptive alert', () => {
      assert.equal(
        mapAuthError('auth/not-authorized'),
        'Not authorized: Your account does not have administrative privileges.'
      );
    });

    it('maps rate limit errors properly', () => {
      assert.equal(
        mapAuthError('over_request_rate_limit'),
        'Too many failed login attempts. Access is temporarily locked. Please wait a few minutes before trying again.'
      );
    });
  });

  // 2. Middleware Routing Matrix Test (Preventing Redirect Loops)
  describe('Middleware Routing Matrix', () => {
    function evaluateMiddlewareRedirect(pathname: string, hasUser: boolean): string | null {
      if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!hasUser) {
          return '/admin/login';
        }
      }
      if (pathname === '/admin/login' && hasUser) {
        return '/admin/dashboard';
      }
      return null; // allowed to proceed
    }

    it('unauthenticated user on /admin/dashboard redirects to /admin/login', () => {
      assert.equal(evaluateMiddlewareRedirect('/admin/dashboard', false), '/admin/login');
    });

    it('unauthenticated user on /admin redirects to /admin/login', () => {
      assert.equal(evaluateMiddlewareRedirect('/admin', false), '/admin/login');
    });

    it('unauthenticated user on /admin/login is allowed without redirect', () => {
      assert.equal(evaluateMiddlewareRedirect('/admin/login', false), null);
    });

    it('authenticated admin on /admin/dashboard is allowed without redirect', () => {
      assert.equal(evaluateMiddlewareRedirect('/admin/dashboard', true), null);
    });

    it('authenticated admin on /admin/login redirects to /admin/dashboard', () => {
      assert.equal(evaluateMiddlewareRedirect('/admin/login', true), '/admin/dashboard');
    });

    it('proves no cyclic redirect loop occurs', () => {
      // Trace unauth: /admin/dashboard -> /admin/login -> allowed
      let path: string | null = '/admin/dashboard';
      path = evaluateMiddlewareRedirect(path, false);
      assert.equal(path, '/admin/login');
      assert.equal(evaluateMiddlewareRedirect(path!, false), null); // Terminates at login

      // Trace auth: /admin/login -> /admin/dashboard -> allowed
      path = '/admin/login';
      path = evaluateMiddlewareRedirect(path, true);
      assert.equal(path, '/admin/dashboard');
      assert.equal(evaluateMiddlewareRedirect(path!, true), null); // Terminates at dashboard
    });
  });
});
