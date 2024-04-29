import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetDonationsTableQuery } from '../GetDonationsTable.generated';
import { DonationsReportTable } from './DonationsReportTable';

export default {
  title: 'Reports/DonationsReport/Table',
};

const onSelectContact = () => {};
const time = DateTime.now();

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<{ GetDonationsTable: GetDonationsTableQuery }>
      mocks={{
        GetDonationsTable: {
          donations: {
            nodes: [
              {
                amount: {
                  amount: 10,
                  convertedAmount: 10,
                  convertedCurrency: 'CAD',
                  currency: 'CAD',
                },
                appeal: {
                  amount: 10,
                  amountCurrency: 'CAD',
                  createdAt: DateTime.now().minus({ month: 3 }).toISO(),
                  id: 'abc',
                  name: 'John',
                },
                donationDate: DateTime.now().plus({ minutes: 4 }).toISO(),
                donorAccount: {
                  displayName: 'John',
                  id: 'abc',
                },
                id: 'abc',
                paymentMethod: 'pay',
              },
              {
                amount: {
                  amount: 10,
                  convertedAmount: 10,
                  convertedCurrency: 'CAD',
                  currency: 'CAD',
                },
                appeal: {
                  amount: 10,
                  amountCurrency: 'CAD',
                  createdAt: DateTime.now().minus({ month: 3 }).toISO(),
                  id: 'abc',
                  name: 'John',
                },
                donationDate: DateTime.now().plus({ days: 5 }).toISO(),
                donorAccount: {
                  displayName: 'Bob',
                  id: '123',
                },
                id: '123',
                paymentMethod: 'pay',
              },
            ],
          },
        },
      }}
    >
      <DonationsReportTable
        accountListId={'abc'}
        onSelectContact={onSelectContact}
        time={time}
        setTime={() => {}}
      />
    </GqlMockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <GqlMockedProvider<{ GetDonationsTable: GetDonationsTableQuery }>
      mocks={{
        GetDonationsTable: {
          donations: {
            nodes: [],
          },
        },
      }}
    >
      <DonationsReportTable
        accountListId={'abc'}
        onSelectContact={onSelectContact}
        time={time}
        setTime={() => {}}
      />
    </GqlMockedProvider>
  );
};
