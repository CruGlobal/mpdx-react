import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { CreateAssistantTokenDocument } from './CreateAssistantToken.generated';

export const mintedToken = (token: string, expiresInMs = 15 * 60 * 1000) => ({
  createAssistantToken: {
    token,
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    scopes: ['help'],
  },
});

interface RefusedMintProviderProps {
  message: string;
  accountListId?: string;
  onMint?: () => void;
  children?: React.ReactNode;
}

// Returns mpdx_api's refusal as a GraphQL error so Apollo wraps it the way it does in the app
export const RefusedMintProvider: React.FC<RefusedMintProviderProps> = ({
  message,
  accountListId = 'account-list-1',
  onMint,
  children,
}) => {
  const refusal = {
    request: {
      query: CreateAssistantTokenDocument,
      variables: { accountListId },
    },
    result: () => {
      onMint?.();
      return {
        errors: [
          new GraphQLError(message, {
            extensions: { code: 'AUTHORIZATION_ERROR' },
          }),
        ],
      };
    },
  };

  return (
    <MockedProvider mocks={[refusal, refusal, refusal]}>
      {children}
    </MockedProvider>
  );
};
