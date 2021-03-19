import React from 'react';
import { render } from '@testing-library/react';
import matchMediaMock from '../../../../__tests__/util/matchMediaMock';
import { StatusEnum } from '../../../../graphql/types.generated';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import { ContactsTable } from './ContactsTable';

const data: ContactRowFragment[] = [
  {
    id: '1',
    name: 'Mouse, Mickey',
    status: StatusEnum.PartnerFinancial,
    people: undefined,
  },
  {
    id: '2',
    name: 'Duck, Donald',
    status: StatusEnum.PartnerPray,
    people: undefined,
  },
];

const loadFilters = jest.fn();

describe('ContactFilters', () => {
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
  });

  it('default', async () => {
    const { queryByTestId } = render(
      <ContactsTable contacts={data} loading={false} error={null} />,
    );

    expect(queryByTestId('ContactsTable')).toBeVisible();
    expect(queryByTestId('LoadingText')).toBeNull();
    expect(queryByTestId('EmptyText')).toBeNull();
    expect(queryByTestId('ErrorText')).toBeNull();

    expect(queryByTestId('ContactsTable').childNodes.length).toEqual(2);
  });

  it('loading', async () => {
    const { queryByTestId } = render(
      <ContactsTable contacts={data} loading={true} error={null} />,
    );

    expect(queryByTestId('ContactsTable')).toBeNull();
    expect(queryByTestId('LoadingText')).toBeVisible();
    expect(queryByTestId('EmptyText')).toBeNull();
    expect(queryByTestId('ErrorText')).toBeNull();
  });

  it('empty', async () => {
    const { queryByTestId } = render(
      <ContactsTable contacts={undefined} loading={false} error={null} />,
    );

    expect(queryByTestId('ContactsTable')).toBeNull();
    expect(queryByTestId('LoadingText')).toBeNull();
    expect(queryByTestId('EmptyText')).toBeVisible();
    expect(queryByTestId('ErrorText')).toBeNull();
  });
});
