import { User } from '@prisma/client';

declare namespace Express {
  export interface Request {
    user?: User;
    userId?: number;
    tenantId?: number;
  }
}
