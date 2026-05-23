import { useLocation, useParams as wouterUseParams } from 'wouter';

export function useRouter() {
  const [location, setLocation] = useLocation();
  return {
    push: (path: string) => setLocation(path),
    replace: (path: string) => setLocation(path, { replace: true }),
    back: () => window.history.back(),
    refresh: () => window.location.reload(),
    pathname: location,
  };
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function usePathname(): string {
  const [location] = useLocation();
  return location;
}

export function useParams<T extends Record<string, string>>(): T {
  return wouterUseParams() as T;
}
