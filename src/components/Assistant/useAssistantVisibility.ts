import { useSession } from 'next-auth/react';

// Uses useSession instead of useRequiredSession because the drawer is mounted on pages without a session
export const useAssistantVisibility = (): boolean => {
  const { data: session } = useSession();
  const user = session?.user;

  if (process.env.DISABLE_ASSISTANT === 'true' || !user || user.impersonating) {
    return false;
  }

  // Until a real opt-in exists, only developers in a development env may see the assistant
  return process.env.DEVELOPMENT_ENV === 'true' && user.developer;
};
