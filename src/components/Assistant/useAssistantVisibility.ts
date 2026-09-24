import { useContext } from 'react';
import { ApolloClient, InMemoryCache, getApolloContext } from '@apollo/client';
import { useSession } from 'next-auth/react';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import {
  AssistantSettingsFieldsFragment,
  useAssistantSettingsQuery,
} from './AssistantSettings.generated';

export type AssistantLauncherState = 'hidden' | 'optIn' | 'enabled';

export interface AssistantAccess {
  launcher: AssistantLauncherState;
  // Null when the user may not use the assistant at all, so the Preferences tab hides too
  settings: AssistantSettingsFieldsFragment | null;
}

let inertClient: ApolloClient<unknown> | null = null;

// The login and error pages mount AssistantProvider without an ApolloProvider, and useQuery needs a client even when skipped
const getInertClient = (): ApolloClient<unknown> => {
  inertClient ??= new ApolloClient({ cache: new InMemoryCache() });
  return inertClient;
};

// Uses useSession instead of useRequiredSession because the drawer is mounted on pages without a session
export const useAssistantAccess = (): AssistantAccess => {
  const { data: session } = useSession();
  const user = session?.user;
  const accountListId = useOptionalAccountListId();
  const apolloClient = useContext(getApolloContext()).client;

  const betaDevelopersOnly =
    process.env.ASSISTANT_BETA_DEVELOPERS_ONLY !== 'false';
  const inRollout =
    !betaDevelopersOnly ||
    (process.env.DEVELOPMENT_ENV === 'true' && Boolean(user?.developer));
  const allowed =
    process.env.DISABLE_ASSISTANT !== 'true' &&
    Boolean(user) &&
    !user?.impersonating &&
    Boolean(accountListId) &&
    inRollout;

  const { data } = useAssistantSettingsQuery({
    client: apolloClient ?? getInertClient(),
    skip: !allowed || !apolloClient,
  });

  const settings = (allowed && data?.assistantSettings) || null;
  if (!settings || settings.launcherHidden) {
    return { launcher: 'hidden', settings };
  }
  return { launcher: settings.enabled ? 'enabled' : 'optIn', settings };
};

// The drawer may only open after the user has opted in
export const useAssistantVisibility = (): boolean =>
  useAssistantAccess().launcher === 'enabled';
