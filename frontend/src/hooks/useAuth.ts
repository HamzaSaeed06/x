import { useEffect } from 'react';
import { getCurrentUser } from '@/lib/services/authService';
import { useAuthStore } from '@/store/authStore';
import { getToken } from '@/lib/api';

export function useAuth() {
  const { setUser, setRole, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    getCurrentUser()
      .then((user) => {
        if (user) {
          setUser(user);
          setRole(user.role ?? 'user');
        } else {
          setUser(null);
          setRole(null);
        }
      })
      .catch(() => {
        setUser(null);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, [setUser, setRole, setLoading]);
}
