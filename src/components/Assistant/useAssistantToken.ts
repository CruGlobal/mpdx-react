import { useSession } from 'next-auth/react';

// WEB-002 replaces this with the scoped assistant token
export const useAssistantToken = (): string | null => {
  const { data: session } = useSession();
  return session?.user.apiToken ?? null;
};
