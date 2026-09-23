import React, { useState } from 'react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { GraphQLError } from 'graphql';

export const mintedToken = (token: string, expiresInMs = 15 * 60 * 1000) => ({
  createAssistantToken: {
    token,
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    scopes: ['help'],
  },
});

export type MintOutcome =
  | { token: string; expiresInMs?: number; expiresAt?: string }
  | { refusal: string }
  | { networkError: true };

interface MintSequenceProviderProps {
  outcomes: MintOutcome[];
  onMint?: (variables: Record<string, unknown>) => void;
  children?: React.ReactNode;
}

// Answers each mint with the next outcome, repeating the last, and returns a refusal as mpdx_api's GraphQL error
export const MintSequenceProvider: React.FC<MintSequenceProviderProps> = ({
  outcomes,
  onMint,
  children,
}) => {
  const [client] = useState(() => {
    const queue = [...outcomes];
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            onMint?.(operation.variables);
            const outcome = queue.length > 1 ? queue.shift() : queue[0];
            if (!outcome || 'networkError' in outcome) {
              observer.error(new Error('Failed to fetch'));
              return;
            }
            if ('refusal' in outcome) {
              observer.next({
                errors: [
                  new GraphQLError(outcome.refusal, {
                    extensions: { code: 'AUTHORIZATION_ERROR' },
                  }),
                ],
              });
            } else {
              const minted = mintedToken(outcome.token, outcome.expiresInMs);
              if (outcome.expiresAt !== undefined) {
                minted.createAssistantToken.expiresAt = outcome.expiresAt;
              }
              observer.next({ data: minted });
            }
            observer.complete();
          }),
      ),
    });
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
