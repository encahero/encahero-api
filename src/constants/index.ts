export const ERROR_MESSAGES = {
    AUTH: {
        INVALID_TOKEN: 'Invalid Token',
    },

    USER: {
        USER_NOT_FOUND: 'User not found',
        USER_ALREADY_EXISTS: 'User already exists',
    },
    SERVER: {
        UNEXPECTED: 'Unexpected error',
        INTERNAL: 'Internal server error',
    },
    VALIDATION: {
        EMAIL_INVALID: 'Email is not valid',
        REQUIRED_FIELD: 'Missing required field',
    },
} as const;

export const SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN: 'Login Successfully',
        REGISTER: 'Register Successfully',
        LOGOUT: 'Logout Successfully',
    },
    USER: {
        PROFILE_UPDATED: 'Profile updated successfully',
    },
};

export const MEMORY_CACHE_TTL = 60000;
