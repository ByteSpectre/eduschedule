import { User } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: Partial<User>;
}
