import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import {
  StatusEnum as ContactPartnershipStatusEnum,
  PledgeFrequencyEnum,
} from 'src/graphql/types.generated';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import i18n from '../../../../../lib/i18n';
import theme from '../../../../../theme';
import {
  ContactDetailsHeaderFragment,
  ContactDetailsHeaderFragmentDoc,
} from '../ContactDetailsHeader.generated';
import { ContactHeaderStatusSection } from './ContactHeaderStatusSection';

const contactMock = (status: ContactPartnershipStatusEnum) => {
  return gqlMock<ContactDetailsHeaderFragment>(
    ContactDetailsHeaderFragmentDoc,
    {
      mocks: {
        status,
        pledgeCurrency: 'USD',
        pledgeAmount: 500,
        pledgeFrequency: PledgeFrequencyEnum.Monthly,
        pledgeReceived: true,
        lastDonation: {
          donationDate: '2021-09-07T16:38:20.242-04:00',
          amount: {
            currency: 'CAD',
          },
        },
        contactReferralsToMe: {
          nodes: [
            {
              id: 'referred-by-id-1',
              referredBy: {
                id: 'referred-by-contact-id',
                name: 'Person, Cool',
              },
            },
          ],
        },
      },
    },
  );
};

describe('ContactHeaderStatusSection', () => {
  it('should show loading state', () => {
    const { queryByText } = render(
      <ContactHeaderStatusSection loading={true} contact={undefined} />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('should render if status is null', () => {
    const { queryByText } = render(
      <ContactHeaderStatusSection
        loading={false}
        contact={gqlMock<ContactDetailsHeaderFragment>(
          ContactDetailsHeaderFragmentDoc,
          { mocks: { status: null, lastDonation: null } },
        )}
      />,
    );

    expect(queryByText('Partner - Financial')).toBeNull();
  });

  it('renders for financial partner', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <ContactHeaderStatusSection
          loading={false}
          contact={contactMock(
            'PARTNER_FINANCIAL' as ContactPartnershipStatusEnum,
          )}
        />
      </ThemeProvider>,
    );
    expect(queryByText('Partner - Financial')).toBeInTheDocument();
    expect(queryByText('$500 - Monthly')).toBeInTheDocument();
  });

  const statuses = Object.entries(contactPartnershipStatus)
    .filter(([_, status]) => status.phase)
    .map(([statusKey, status]) => {
      return [statusKey, status.name];
    });

  it.each([...statuses])('should render status | %s', (status, expected) => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <ContactHeaderStatusSection
            loading={false}
            contact={contactMock(status as ContactPartnershipStatusEnum)}
          />
        </I18nextProvider>
      </ThemeProvider>,
    );
    expect(getByText(expected)).toBeInTheDocument();
  });
});
