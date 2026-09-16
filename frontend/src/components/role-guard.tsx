'use client';

import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from './loading-spinner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackPath = '/login' }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !allowedRoles.includes(user.role)) {
      router.push(fallbackPath);
    }
  }, [user, loading, allowedRoles, fallbackPath, router]);

  if (loading) {
    return <LoadingSpinner fullPage message="Authenticating..." />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
