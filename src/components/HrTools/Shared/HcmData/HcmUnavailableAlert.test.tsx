import React from 'react';
import { ApolloError } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import {
  HcmUnavailableAlert,
  isHcmUnavailableError,
} from './HcmUnavailableAlert';

const apolloError = (code: string) =>
  new ApolloError({
    graphQLErrors: [
      new GraphQLError('HCM UserInfo report unavailable', {
        extensions: { code },
      }),
    ],
  });

describe('isHcmUnavailableError', () => {
  it('is true for an HCM_UNAVAILABLE error', () => {
    expect(isHcmUnavailableError(apolloError('HCM_UNAVAILABLE'))).toBe(true);
  });

  it('is false for other errors', () => {
    expect(isHcmUnavailableError(apolloError('NOT_FOUND'))).toBe(false);
    expect(
      isHcmUnavailableError(
        new ApolloError({ networkError: new Error('offline') }),
      ),
    ).toBe(false);
  });

  it('is false without an error', () => {
    expect(isHcmUnavailableError(undefined)).toBe(false);
  });
});

describe('HcmUnavailableAlert', () => {
  it('asks the user to try again in a few minutes', () => {
    const { getByRole } = render(<HcmUnavailableAlert refetch={jest.fn()} />);

    expect(getByRole('alert')).toHaveTextContent(
      'The system is currently under heavy load. Please try again in a few minutes.',
    );
  });

  it('refetches when Try Again is clicked', () => {
    const refetch = jest.fn().mockResolvedValue({});
    const { getByRole } = render(<HcmUnavailableAlert refetch={refetch} />);

    userEvent.click(getByRole('button', { name: 'Try Again' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('disables Try Again while the retry is running', async () => {
    let finishRetry: () => void = () => {};
    const refetch = jest.fn(
      () => new Promise<void>((resolve) => (finishRetry = resolve)),
    );
    const { getByRole } = render(<HcmUnavailableAlert refetch={refetch} />);

    const button = getByRole('button', { name: 'Try Again' });
    userEvent.click(button);
    expect(button).toBeDisabled();

    finishRetry();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('lets the user try again after a failed retry', async () => {
    const refetch = jest.fn().mockRejectedValue(apolloError('HCM_UNAVAILABLE'));
    const { getByRole } = render(<HcmUnavailableAlert refetch={refetch} />);

    const button = getByRole('button', { name: 'Try Again' });
    userEvent.click(button);

    await waitFor(() => expect(button).toBeEnabled());
    userEvent.click(button);
    expect(refetch).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(button).toBeEnabled());
  });
});
