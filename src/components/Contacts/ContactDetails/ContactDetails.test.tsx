import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  PledgeFrequencyEnum,
  StatusEnum,
} from '../../../../graphql/types.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import theme from '../../../theme';
import { ContactDetails } from './ContactDetails';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader/ContactDetailsHeader.generated';

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const onClose = jest.fn();

describe('ContactDetails', () => {
  it('should show loading state', async () => {
    const { getByTestId } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>
        mocks={{
          contact: {
            id: contactId,
            status: StatusEnum.PartnerFinancial,
            pledgeCurrency: 'USD',
            pledgeAmount: 500,
            pledgeFrequency: PledgeFrequencyEnum.Monthly,
            pledgeReceived: true,
            lastDonation: null,
          },
        }}
      >
        <MuiThemeProvider theme={theme}>
          <ContactDetails
            accountListId={accountListId}
            contactId={contactId}
            onClose={onClose}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    expect(getByTestId('Skeleton')).toBeVisible();
  });

  it('should render with contact details', async () => {
    const { findByText, queryByTestId } = render(
      <GqlMockedProvider<GetContactDetailsHeaderQuery>
        mocks={{
          GetContactDetailsHeader: {
            contact: {
              pledgeCurrency: 'USD',
              lastDonation: null,
              primaryPerson: { firstName: 'Fname', lastName: 'Lname' },
            },
          },
        }}
      >
        <MuiThemeProvider theme={theme}>
          <ContactDetails
            accountListId={accountListId}
            contactId={contactId}
            onClose={onClose}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText('Fname Lname')).toBeVisible();

    expect(queryByTestId('Skeleton')).toBeNull();
  });

  it('should change tab', async () => {
    const { getAllByRole } = render(
      <GqlMockedProvider>
        <MuiThemeProvider theme={theme}>
          <ContactDetails
            accountListId={accountListId}
            contactId={contactId}
            onClose={onClose}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    const tasksPanel = getAllByRole('tabpanel')[0];
    expect(tasksPanel).toBeVisible();

    userEvent.click(getAllByRole('tab')[1]);
    expect(tasksPanel).not.toBeVisible();
  });
});
