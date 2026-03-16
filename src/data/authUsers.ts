import { AuthUser } from '../types';

export interface AuthCredential extends AuthUser {
  password: string;
}

export const authUsers: AuthCredential[] = [
  {
    username: 'admin',
    password: 'admin123',
    displayName: 'Administrator',
    role: 'admin',
  },
  {
    username: 'mitarbeiter',
    password: 'dienstplan',
    displayName: 'Mitarbeiter',
    role: 'mitarbeiter',
  },
];
