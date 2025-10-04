import { Request } from 'express';

export default interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email?: string;
        deviceId: string;
        time_zone?: string;
    };
}
