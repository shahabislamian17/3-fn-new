
'use client';
import { useAuth } from './use-auth';
import type { User as AppUser } from '@/lib/types';
import { User } from 'firebase/auth';

export function useUser(): (User & AppUser) | null {
  const auth = useAuth();
  return auth.user as (User & AppUser) | null;
}
