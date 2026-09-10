import { describe, it, expect } from 'vitest';
import {
  verifyAdminPassword,
  createAdminSessionToken,
  verifyAdminSessionToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/auth/admin-auth';

describe('Admin Authentication Logic', () => {
  it('correctly exports the cookie name', () => {
    expect(ADMIN_COOKIE_NAME).toBe('whey4you_admin_session');
  });

  it('verifies correct and incorrect admin password', () => {
    expect(verifyAdminPassword('whey4you_admin_2026')).toBe(true);
    expect(verifyAdminPassword('wrong_password')).toBe(false);
    expect(verifyAdminPassword('')).toBe(false);
  });

  it('creates and verifies a valid session token', async () => {
    const token = await createAdminSessionToken();
    expect(token).toBeDefined();
    expect(token.includes('.')).toBe(true);

    const isValid = await verifyAdminSessionToken(token);
    expect(isValid).toBe(true);
  });

  it('rejects tampered or malformed tokens', async () => {
    expect(await verifyAdminSessionToken(null)).toBe(false);
    expect(await verifyAdminSessionToken('')).toBe(false);
    expect(await verifyAdminSessionToken('not-a-token')).toBe(false);

    const validToken = await createAdminSessionToken();
    const [timestamp, signature] = validToken.split('.');

    // Tampered timestamp
    const tamperedTime = (parseInt(timestamp, 10) - 1000).toString();
    expect(await verifyAdminSessionToken(`${tamperedTime}.${signature}`)).toBe(false);

    // Tampered signature
    const tamperedSig = signature.slice(0, -2) + 'aa';
    expect(await verifyAdminSessionToken(`${timestamp}.${tamperedSig}`)).toBe(false);
  });

  it('rejects expired tokens', async () => {
    // 8 days ago
    const expiredTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const fakeToken = `${expiredTimestamp}.somefakehash`;
    expect(await verifyAdminSessionToken(fakeToken)).toBe(false);
  });
});
