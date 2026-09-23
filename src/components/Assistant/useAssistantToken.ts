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
const REFRESH_RETRY_DELAYS_MS = [5 * 1000, 15 * 1000, 60 * 1000];

// mpdx_api refuses these with the same AUTHORIZATION_ERROR code as impersonation, so only the message tells them apart
const NOT_TURNED_ON_MESSAGES = new Set([
  'The assistant is not turned on',
  'No assistant features are turned on',
]);

export type AssistantTokenRefusal = 'notTurnedOn' | 'notAllowed';

export type AssistantTokenState =
  | { status: 'idle' }
  | { status: 'minting' }
  | { status: 'ready'; token: string; expiresAt: number }
  | { status: 'refusing'; reason: AssistantTokenRefusal }
  | { status: 'failed'; retryable: boolean };

export interface AssistantToken {
  state: AssistantTokenState;
  token: string | null;
  refreshToken: () => Promise<string | null>;
  retry: () => void;
}

const refusalReason = (error: unknown): AssistantTokenRefusal | null => {
  const refusal =
    error instanceof ApolloError
      ? error.graphQLErrors.find(
          (graphQLError) =>
            graphQLError.extensions?.code === 'AUTHORIZATION_ERROR',
        )
      : undefined;
  if (!refusal) {
    return null;
  }
  return NOT_TURNED_ON_MESSAGES.has(refusal.message)
    ? 'notTurnedOn'
    : 'notAllowed';
};

// A server that answered with an error will answer the same way again
const isRetryable = (error: unknown): boolean =>
  !(error instanceof ApolloError && error.graphQLErrors.length > 0);

// Reads the Apollo context directly because the drawer can open on /404 and /500, which have no Apollo provider
export const useAssistantToken = (
  accountListId: string | null,
): AssistantToken => {
  const { client } = useContext(getApolloContext());
  const [state, setState] = useState<AssistantTokenState>({ status: 'idle' });
  const stateRef = useRef(state);
  const pending = useRef<Promise<string | null> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const generation = useRef(0);

  const update = useCallback((next: AssistantTokenState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const mint = useCallback(
    (retryAttempt = 0): Promise<string | null> => {
      const { status } = stateRef.current;
      // A refusal or failed first mint waits for Try again, a reopen, or another account list
      if (
        !client ||
        !accountListId ||
        status === 'refusing' ||
        status === 'failed'
      ) {
        return Promise.resolve(null);
      }
      if (pending.current) {
        return pending.current;
      }

      const mintGeneration = generation.current;
      const isCurrent = () => generation.current === mintGeneration;
      clearTimeout(timer.current);

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
          const expiresAt = new Date(minted.expiresAt).getTime();
          update({ status: 'ready', token: minted.token, expiresAt });
          timer.current = setTimeout(
            () => mint(),
            Math.max(
              expiresAt - Date.now() - REFRESH_LEAD_MS,
              MIN_REFRESH_DELAY_MS,
            ),
          );
          return minted.token;
        })
        .catch((error: unknown) => {
          if (!isCurrent()) {
            return null;
          }
          const reason = refusalReason(error);
          const held = stateRef.current;
          const remaining =
            held.status === 'ready' ? held.expiresAt - Date.now() : 0;
          if (reason) {
            update({ status: 'refusing', reason });
          } else if (remaining > 0) {
            // A failed refresh keeps the token it holds and tries again until that token expires
            const delay =
              REFRESH_RETRY_DELAYS_MS[
                Math.min(retryAttempt, REFRESH_RETRY_DELAYS_MS.length - 1)
              ];
            timer.current = setTimeout(
              () => mint(retryAttempt + 1),
              Math.min(delay, remaining),
            );
          } else {
            update({ status: 'failed', retryable: isRetryable(error) });
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
    },
    [client, accountListId, update],
  );

  const refreshToken = useCallback(() => mint(), [mint]);

  const retry = useCallback(() => {
    if (stateRef.current.status === 'failed') {
      update({ status: 'minting' });
      mint();
    }
  }, [mint, update]);

  useEffect(() => {
    update(
      client && accountListId ? { status: 'minting' } : { status: 'idle' },
    );
    mint();

    return () => {
      generation.current += 1;
      pending.current = null;
      clearTimeout(timer.current);
    };
  }, [client, accountListId, mint, update]);

  return {
    state,
    token: state.status === 'ready' ? state.token : null,
    refreshToken,
    retry,
  };
};
