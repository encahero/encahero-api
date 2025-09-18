export const ERROR_MESSAGES = {
    AUTH: {
        INVALID_TOKEN: 'Invalid Token',
        ACCESSS_INVALID_TOKEN: 'Invalid Access Token',
        REFRESH_INVALID_TOKEN: 'Invalid Refresh Token',
        MISSING_TOKEN: 'Token Missing',
        ACCESS_TOKEN_EXPIRED: 'Access token expired',
        REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
        INVALID_PASSWORD: 'Wrong password',
    },

    USER: {
        NOT_FOUND: 'User not found',
        ALREADY_EXISTS: 'User already exists',
    },
    SERVER: {
        UNEXPECTED: 'Unexpected error',
        INTERNAL: 'Internal server error',
    },
    VALIDATION: {
        EMAIL_INVALID: 'Email is not valid',
        REQUIRED_FIELD: 'Missing required field',
    },

    COLLECTION: {
        NOT_FOUND: 'Collection not found',
        ALREADY_REGISTERED: 'You are already registered this collection',
    },
} as const;

export const SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN: 'Login Successfully',
        REGISTER: 'Register Successfully',
        LOGOUT: 'Logout Successfully',
        REFRESH_TOKEN: 'Refresh token successfully',
    },
    USER: {
        PROFILE_UPDATED: 'Profile updated successfully',
    },
    MAIL: {
        SEND_LOGIN_MAGIC_LINK: 'Send login magic link successfully',
    },

    CARD: {
        FIND_ALL: 'Find all card successfully',
    },

    COLLECTION: {
        FIND_ALL: 'Find all collection successfully',
        REGISTER: 'Register collection successfully',
        GET_OWN: 'Get own collection successfully',
    },

    CATEGORY: {
        FIND_ALL: 'Find all category successfully',
    },
};

export const MEMORY_CACHE_TTL = 60000;

export const ACCESS_TOKEN = 'access-token';
export const REFRESH_TOKEN = 'refresh-token';
export const MAGIC_LINK = 'magic_link';
