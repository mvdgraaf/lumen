import type { Request } from 'express';
import { authLib } from '../lib/auth.lib'

export interface AuthenticatedRequest extends Omit<Request, 'user' | 'session'> {
    user?: typeof authLib.$Infer.Session.user;
    session?: typeof authLib.$Infer.Session.session;
    companyId?: string;
}