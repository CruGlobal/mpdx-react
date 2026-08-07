import { Operation } from '@apollo/client';
import { NetworkError } from '@apollo/client/errors';
import { GraphQLFormattedError } from 'graphql';

declare global {
  interface Window {
    DD_RUM: {
      setUser: (user: Record<string, unknown>) => void;
      clearUser: () => void;
      addError: (error: unknown, context?: Record<string, unknown>) => void;
      onReady: (callback: () => void) => void;
    };
  }
}

/** Run the callback once the RUM agent is ready. */
const whenDatadogReady = (callback: () => void): void => {
  if (
    typeof window !== 'undefined' &&
    process.env.DATADOG_CONFIGURED === 'true'
  ) {
    window.DD_RUM?.onReady(callback);
  }
};

export interface SetDataDogUserProps {
  userId: string;
  name: string;
  email: string;
  accountListId: string | null;
  language: string;
}

export const accountListIdsStorageKey = 'accountListIds';

export const setDataDogUser = ({
  userId,
  name,
  email,
  accountListId,
  language,
}: SetDataDogUserProps): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const rawAccountListIds = window.localStorage.getItem(
    accountListIdsStorageKey,
  );
  const accountListIds = rawAccountListIds ? rawAccountListIds.split(',') : [];
  if (accountListId && !accountListIds.includes(accountListId)) {
    accountListIds.push(accountListId);
    window.localStorage.setItem(
      accountListIdsStorageKey,
      accountListIds.join(','),
    );
  }
  whenDatadogReady(() =>
    window.DD_RUM.setUser({
      id: userId,
      name,
      email,
      accountListIds,
      language,
    }),
  );
};

export const clearDataDogUser = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(accountListIdsStorageKey);
  whenDatadogReady(() => window.DD_RUM.clearUser());
};

export const addDataDogError = (
  error: unknown,
  context?: Record<string, unknown>,
): void => {
  whenDatadogReady(() => window.DD_RUM.addError(error, context));
};

export const reportGraphQLError = (
  error: GraphQLFormattedError,
  operation: Pick<Operation, 'operationName'>,
): void => {
  addDataDogError(
    new Error(`GraphQL error in ${operation.operationName}: ${error.message}`),
    {
      mpdxErrorType: 'graphql',
      operationName: operation.operationName,
      errorCode: error.extensions?.code,
      errorPath: error.path?.join('.'),
    },
  );
};

export const reportNetworkError = (
  networkError: NonNullable<NetworkError>,
  operation: Pick<Operation, 'operationName'>,
): void => {
  addDataDogError(networkError, {
    mpdxErrorType: 'graphql_network',
    operationName: operation.operationName,
    statusCode:
      'statusCode' in networkError ? networkError.statusCode : undefined,
  });
};
