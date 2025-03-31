export const REDIS_KEYS = {
  SESSION: 'session',
  BLACKLIST: 'blacklist',
} as const;

export const createSessionKey = (sessionId: string) => `${REDIS_KEYS.SESSION}:${sessionId}`;
export const createBlacklistKey = (jti: string) => `${REDIS_KEYS.BLACKLIST}:${jti}`;