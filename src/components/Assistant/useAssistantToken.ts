import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ApolloError, getApolloContext } from '@apollo/client';
import {
  CreateAssistantTokenDocument,
  CreateAssistantTokenMutation,
  CreateAssistantTokenMutationVariables,
} from './CreateAssistantToken.generated';

const REFRESH_LEAD_MS = 60 * 1000;
// Keeps a skewed client clock from turning refreshes into a tight loop
const MIN_REFRESH_DELAY_MS = 30 * 1000;

// mpdx_api refuses these with the same AUTHORIZATION_ERROR code as impersonation, so only the message tells them apart
const NOT_TURNED_ON_MESSAGES = new Set([
  'The assistant is not turned on',
  'No assistant features are turned on',
]);

export type AssistantTokenStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'notTurnedOn'
  | 'error';

export interface AssistantToken {
  token: string | null;
  status: AssistantTokenStatus;
  refreshToken: () => Promise<string | null>;
}

const isNotTurnedOn = (error: unknown): boolean =>
  error instanceof ApolloError &&
  error.graphQLErrors.some(
    (graphQLError) =>
      graphQLError.extensions?.code === 'AUTHORIZATION_ERROR' &&
      NOT_TURNED_ON_MESSAGES.has(graphQLError.message),
  );

// Reads the Apollo context directly because the drawer can open on /404 and /500, which have no Apollo provider
export const useAssistantToken = (
  accountListId: string | null,
): AssistantToken => {
  const { client } = useContext(getApolloContext());
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AssistantTokenStatus>('idle');
  const pending = useRef<Promise<string | null> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout>>();
  const generation = useRef(0);
  const failed = useRef(false);

  const refreshToken = useCallback((): Promise<string | null> => {
    // A refused or failed mint waits for the drawer to reopen or the account list to change
    if (!client || !accountListId || failed.current) {
      return Promise.resolve(null);
    }
    if (pending.current) {
      return pending.current;
    }

    const mintGeneration = generation.current;
    const isCurrent = () => generation.current === mintGeneration;
    clearTimeout(refreshTimer.current);

    const request = client
      .mutate<
        CreateAssistantTokenMutation,
        CreateAssistantTokenMutationVariables
      >({
        mutation: CreateAssistantTokenDocument,
        variables: { accountListId },
        fetchPolicy: 'no-cache',
        context: { suppressErrors: true },
      })
      .then(({ data }) => {
        const minted = data?.createAssistantToken;
        if (!minted) {
          throw new Error('The assistant token mutation returned no token');
        }
        if (!isCurrent()) {
          return null;
        }
        setToken(minted.token);
        setStatus('ready');
        const delay = Math.max(
          new Date(minted.expiresAt).getTime() - Date.now() - REFRESH_LEAD_MS,
          MIN_REFRESH_DELAY_MS,
        );
        refreshTimer.current = setTimeout(refreshToken, delay);
        return minted.token;
      })
      .catch((error: unknown) => {
        if (isCurrent()) {
          failed.current = true;
          setToken(null);
          setStatus(isNotTurnedOn(error) ? 'notTurnedOn' : 'error');
        }
        return null;
      })
      .finally(() => {
        if (pending.current === request) {
          pending.current = null;
        }
      });
    pending.current = request;
    return request;
  }, [client, accountListId]);

  useEffect(() => {
    setToken(null);
    setStatus(client && accountListId ? 'loading' : 'idle');
    refreshToken();

    return () => {
      generation.current += 1;
      pending.current = null;
      failed.current = false;
      clearTimeout(refreshTimer.current);
    };
  }, [client, accountListId, refreshToken]);

  return { token, status, refreshToken };
};
