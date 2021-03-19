import React from 'react';
import { render } from '@testing-library/react';
import matchMediaMock from '../../../../__tests__/util/matchMediaMock';
import { ContactsTable } from './ContactsTable';

const accountListId = '111';

describe('ContactFilters', () => {
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
  });

  it('default', async () => {
    const { queryByTestId } = render(
      <ContactsTable accountListId={accountListId} />,
    );

    expect(queryByTestId('ContactsTable')).toBeVisible();
    expect(queryByTestId('LoadingText')).toBeNull();
    expect(queryByTestId('EmptyText')).toBeNull();
    expect(queryByTestId('ErrorText')).toBeNull();

    expect(queryByTestId('ContactsTable').childNodes.length).toEqual(2);
  });

  it('loading', async () => {
    const { queryByTestId } = render(
      <ContactsTable accountListId={accountListId} />,
    );

    expect(queryByTestId('ContactsTable')).toBeNull();
    expect(queryByTestId('LoadingText')).toBeVisible();
    expect(queryByTestId('EmptyText')).toBeNull();
    expect(queryByTestId('ErrorText')).toBeNull();
  });

  it('empty', async () => {
    const { queryByTestId } = render(
      <ContactsTable accountListId={accountListId} />,
    );

    expect(queryByTestId('ContactsTable')).toBeNull();
    expect(queryByTestId('LoadingText')).toBeNull();
    expect(queryByTestId('EmptyText')).toBeVisible();
    expect(queryByTestId('ErrorText')).toBeNull();
  });
});
