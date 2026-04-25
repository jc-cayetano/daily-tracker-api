import { UserRole } from '../entities/user.entity';

export interface AuthenticatedRequest {
  user: { id: string; username: string; role: UserRole };
}
