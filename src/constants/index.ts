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
        COLLECTION_PROGRESS_NOT_FOUND: 'Collection progress not found',
        ALREADY_REGISTERED: 'You are already registered this collection',
        NOT_REGISTED_OR_NOT_IN_PROGRESS: 'Collection not in progress or your are not registered',
        CANNOT_CHANGE_TO_COMPLETE_STATUS: 'You can not change collection status to complete ! ',
    },

    CARD: {
        NOT_FOUND: 'Card not found',
        CARD_PROGRESS_NOT_FOUND: 'Card progress not found',
    },
    QUIZ: {
        MODE_NOT_FOUND: 'Quiz mode not found',
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
        UPDATE_TIMEZONE: 'Update timezone succesfully',
    },
    MAIL: {
        SEND_LOGIN_MAGIC_LINK: 'Send login magic link successfully',
    },

    CARD: {
        FIND_ALL: 'Find all card successfully',
        CHANGE_STATUS: 'Change card status successfully',
        FIND_ALL_CARD_OF_COLLECTION: 'Find all card of collection successfully',
    },

    COLLECTION: {
        FIND_ALL: 'Find all collection successfully',
        FIND_ONE: 'Find collection successfully',
        REGISTER: 'Register collection successfully',
        CHANGE_STATUS: 'Change status of collection successfully',
        CHANGE_TASK: 'Change task of collection successfully',
        GET_OWN: 'Get own collection successfully',
        GET_STOP_COLLECTION: 'Get stop collection successfully',
        GET_COMPLETED_COLLECTION: 'Get completed collection successfully',
    },

    CATEGORY: {
        FIND_ALL: 'Find all category successfully',
        FIND_COLLECTION_OF_CATEGORY: 'Find all collection of category successfully',
    },

    QUIZ: {
        RAMDOM_FROM_COLLECTION: 'Random quiz from collection successfully',
        RAMDOM: 'Random quiz from successfully',
        ANSWER: 'Answer quiz from successfully',
    },

    PROGRESS: {
        STATS_DAILY_AND_WEEKLY: 'Get stats daily and weeklu successfully',
    },
};

export const MEMORY_CACHE_TTL = 60000;

export const ACCESS_TOKEN = 'access-token';
export const REFRESH_TOKEN = 'refresh-token';
export const MAGIC_LINK = 'magic_link';
