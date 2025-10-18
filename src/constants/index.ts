export const ERROR_MESSAGES = {
    AUTH: {
        INVALID_TOKEN: 'Invalid Token',
        ACCESSS_INVALID_TOKEN: 'Invalid Access Token',
        REFRESH_INVALID_TOKEN: 'Invalid Refresh Token',
        MISSING_TOKEN: 'Token Missing',
        ACCESS_TOKEN_EXPIRED: 'Access token expired',
        REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
        RESET_TOKEN_INVALID: 'Reset token invalid',
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
        EXISTED: 'Collection name existed',
        NOT_FOUND: 'Collection not found',
        COLLECTION_PROGRESS_NOT_FOUND: 'Collection progress not found',
        ALREADY_REGISTERED: 'You are already registered this collection',
        NOT_REGISTERED_OR_NOT_IN_PROGRESS: 'Collection not in progress or your are not registered',
        CANNOT_CHANGE_TO_COMPLETE_STATUS: 'You can not change collection status to complete ! ',
    },
    CATEGORY: {
        EXISTED: 'Category name existed',
        NOT_FOUND: 'Categiry not found',
        HAVE_COLLECTION_WHEN_DELETE: 'Cannot delete category because it has collections',
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
        VERIFY_OTP: 'Verify OTP successfully',
        RESET_PASSWORD: 'Reset password successfully',
    },
    USER: {
        PROFILE_UPDATED: 'Profile updated successfully',
        UPDATE_TIMEZONE: 'Update timezone succesfully',
        UPDATE_PROFILE: 'Update profile succesfully',
        FIND_ALL: 'Find all succesfully',
    },
    MAIL: {
        SEND_LOGIN_MAGIC_LINK: 'Send login magic link successfully',
        SEND_REGISTER_MAGIC_LINK: 'Send register magic link successfully',
        SEND_RESET_PASSWORD_OTP: 'Send reset password otp successfully',
    },

    CARD: {
        FIND_ALL: 'Find all card successfully',
        CHANGE_STATUS: 'Change card status successfully',
        FIND_ALL_CARD_OF_COLLECTION: 'Find all card of collection successfully',
    },

    COLLECTION: {
        CREATE: 'Create collection successfully',
        REMOVE: 'Remove collection successfully',
        UPDATE: 'Update collection successfully',
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
        CREATE: 'Create category successfully',
        REMOVE: 'Remove category successfully',
        UPDATE: 'Update category successfully',
        FIND_COLLECTION_OF_CATEGORY: 'Find all collection of category successfully',
    },

    QUIZ: {
        RAMDOM_FROM_COLLECTION: 'Random quiz from collection successfully',
        RAMDOM: 'Random quiz from successfully',
        ANSWER: 'Answer quiz from successfully',
    },

    PROGRESS: {
        STATS_DAILY_AND_WEEKLY: 'Get stats daily and weekly successfully',
    },

    FEEDBACK: {
        CREATE: 'Create feedback successfully',
    },
};

export const MEMORY_CACHE_TTL = 60000;

export const ACCESS_TOKEN = 'access-token';
export const REFRESH_TOKEN = 'refresh-token';
export const MAGIC_LINK = 'magic_link';
export const RESET_TOKEN = 'reset-token';
export const RESET_PASSWORD_OTP = 'reset-password-otp';
