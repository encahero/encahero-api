import { Request } from 'express';
import { Role } from '../enums';

export default interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email?: string;
        deviceId: string;
        time_zone?: string;
        role: Role;
    };
}
