import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UserRole } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string, role: UserRole) => Promise<AuthUser>;
  signOut: () => void;
}

const STORAGE_KEY = 'akademia-session';

const mockAccounts: Record<UserRole, { email: string; password: string; user: AuthUser }> = {
  student: {
    email: 'student@akademia.com',
    password: 'student123',
    user: {
      id: 'u_student',
      email: 'student@akademia.com',
      name: 'Alex Rivera',
      role: 'student',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces&q=80',
    },
  },
  instructor: {
    email: 'instructor@akademia.com',
    password: 'instructor123',
    user: {
      id: 'u_instructor',
      email: 'instructor@akademia.com',
      name: 'Dr. Sarah Chen',
      role: 'instructor',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces&q=80',
    },
  },
  admin: {
    email: 'admin@akademia.com',
    password: 'admin123',
    user: {
      id: 'u_admin',
      email: 'admin@akademia.com',
      name: 'James Park',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces&q=80',
    },
  },
};

function findAccount(email: string, password: string): AuthUser | null {
  for (const account of Object.values(mockAccounts)) {
    if (
      account.email.toLowerCase() === email.toLowerCase().trim() &&
      account.password === password
    ) {
      return account.user;
    }
  }
  return null;
}

function findAccountByRole(email: string, password: string, role: UserRole): AuthUser | null {
  const account = mockAccounts[role];
  if (
    account.email.toLowerCase() === email.toLowerCase().trim() &&
    account.password === password
  ) {
    return account.user;
  }
  return null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string, role: UserRole): Promise<AuthUser> => {
    await new Promise((r) => setTimeout(r, 500));

    const authedUser = findAccountByRole(email, password, role);
    if (!authedUser) {
      // Also check if credentials are valid but role doesn't match
      const anyAccount = findAccount(email, password);
      if (anyAccount && anyAccount.role !== role) {
        throw new Error(
          `These credentials belong to a ${anyAccount.role} account. Please select the correct role.`
        );
      }
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authedUser));
    setUser(authedUser);
    return authedUser;
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const roleDashboardPath: Record<UserRole, string> = {
  student: '/student/dashboard',
  instructor: '/instructor/dashboard',
  admin: '/admin/dashboard',
};

export const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  instructor: 'Instructor',
  admin: 'Admin',
};
