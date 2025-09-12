import { Request } from 'express';

export default interface AuthenticatedRequest extends Request {
    user?: {
        userId?: string;
        email?: string;
        deviceId: string;
    };
}
