import { ACCESS_TOKEN, REFRESH_TOKEN } from 'src/constants';

// utils/redis-keys.ts
export const getAccessTokenKey = (userId: string, deviceId: string) => `${userId}-${deviceId}:${ACCESS_TOKEN}`;

export const getRefreshTokenKey = (userId: string, deviceId: string) => `${userId}-${deviceId}:${REFRESH_TOKEN}`;
